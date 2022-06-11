import { isRetryableReadError, isRetryableWriteError, MongoCompatibilityError, MONGODB_ERROR_CODES, MongoError, MongoExpiredSessionError, MongoNetworkError, MongoNotConnectedError, MongoRuntimeError, MongoServerError, MongoTransactionError, MongoUnexpectedServerResponseError } from '../error';
import { ReadPreference } from '../read_preference';
import { sameServerSelector, secondaryWritableServerSelector } from '../sdam/server_selection';
import { maybePromise, supportsRetryableWrites } from '../utils';
import { AbstractOperation, Aspect } from './operation';
const MMAPv1_RETRY_WRITES_ERROR_CODE = MONGODB_ERROR_CODES.IllegalOperation;
const MMAPv1_RETRY_WRITES_ERROR_MESSAGE = 'This MongoDB deployment does not support retryable writes. Please add retryWrites=false to your connection string.';
export function executeOperation(client, operation, callback) {
    if (!(operation instanceof AbstractOperation)) {
        // TODO(NODE-3483): Extend MongoRuntimeError
        throw new MongoRuntimeError('This method requires a valid operation instance');
    }
    return maybePromise(callback, callback => {
        const topology = client.topology;
        if (topology == null) {
            if (client.s.hasBeenClosed) {
                return callback(new MongoNotConnectedError('Client must be connected before running operations'));
            }
            client.s.options[Symbol.for('@@mdb.skipPingOnConnect')] = true;
            return client.connect(error => {
                delete client.s.options[Symbol.for('@@mdb.skipPingOnConnect')];
                if (error) {
                    return callback(error);
                }
                return executeOperation(client, operation, callback);
            });
        }
        if (topology.shouldCheckForSessionSupport()) {
            return topology.selectServer(ReadPreference.primaryPreferred, {}, err => {
                if (err)
                    return callback(err);
                executeOperation(client, operation, callback);
            });
        }
        // The driver sessions spec mandates that we implicitly create sessions for operations
        // that are not explicitly provided with a session.
        let session = operation.session;
        let owner;
        if (topology.hasSessionSupport()) {
            if (session == null) {
                owner = Symbol();
                session = topology.startSession({ owner, explicit: false });
            }
            else if (session.hasEnded) {
                return callback(new MongoExpiredSessionError('Use of expired sessions is not permitted'));
            }
            else if (session.snapshotEnabled && !topology.capabilities.supportsSnapshotReads) {
                return callback(new MongoCompatibilityError('Snapshot reads require MongoDB 5.0 or later'));
            }
        }
        else if (session) {
            // If the user passed an explicit session and we are still, after server selection,
            // trying to run against a topology that doesn't support sessions we error out.
            return callback(new MongoCompatibilityError('Current topology does not support sessions'));
        }
        try {
            executeWithServerSelection(topology, session, operation, (error, result) => {
                if ((session === null || session === void 0 ? void 0 : session.owner) != null && session.owner === owner) {
                    return session.endSession(endSessionError => callback(endSessionError !== null && endSessionError !== void 0 ? endSessionError : error, result));
                }
                callback(error, result);
            });
        }
        catch (error) {
            if ((session === null || session === void 0 ? void 0 : session.owner) != null && session.owner === owner) {
                session.endSession();
            }
            throw error;
        }
    });
}
function executeWithServerSelection(topology, session, operation, callback) {
    var _a, _b;
    const readPreference = (_a = operation.readPreference) !== null && _a !== void 0 ? _a : ReadPreference.primary;
    const inTransaction = !!(session === null || session === void 0 ? void 0 : session.inTransaction());
    if (inTransaction && !readPreference.equals(ReadPreference.primary)) {
        return callback(new MongoTransactionError(`Read preference in a transaction must be primary, not: ${readPreference.mode}`));
    }
    if ((session === null || session === void 0 ? void 0 : session.isPinned) && session.transaction.isCommitted && !operation.bypassPinningCheck) {
        session.unpin();
    }
    let selector;
    if (operation.hasAspect(Aspect.CURSOR_ITERATING)) {
        // Get more operations must always select the same server, but run through
        // server selection to potentially force monitor checks if the server is
        // in an unknown state.
        selector = sameServerSelector((_b = operation.server) === null || _b === void 0 ? void 0 : _b.description);
    }
    else if (operation.trySecondaryWrite) {
        // If operation should try to write to secondary use the custom server selector
        // otherwise provide the read preference.
        selector = secondaryWritableServerSelector(topology.commonWireVersion, readPreference);
    }
    else {
        selector = readPreference;
    }
    const serverSelectionOptions = { session };
    function retryOperation(originalError) {
        const isWriteOperation = operation.hasAspect(Aspect.WRITE_OPERATION);
        const isReadOperation = operation.hasAspect(Aspect.READ_OPERATION);
        if (isWriteOperation && originalError.code === MMAPv1_RETRY_WRITES_ERROR_CODE) {
            return callback(new MongoServerError({
                message: MMAPv1_RETRY_WRITES_ERROR_MESSAGE,
                errmsg: MMAPv1_RETRY_WRITES_ERROR_MESSAGE,
                originalError
            }));
        }
        if (isWriteOperation && !isRetryableWriteError(originalError)) {
            return callback(originalError);
        }
        if (isReadOperation && !isRetryableReadError(originalError)) {
            return callback(originalError);
        }
        if (originalError instanceof MongoNetworkError &&
            (session === null || session === void 0 ? void 0 : session.isPinned) &&
            !session.inTransaction() &&
            operation.hasAspect(Aspect.CURSOR_CREATING)) {
            // If we have a cursor and the initial command fails with a network error,
            // we can retry it on another connection. So we need to check it back in, clear the
            // pool for the service id, and retry again.
            session.unpin({ force: true, forceClear: true });
        }
        // select a new server, and attempt to retry the operation
        topology.selectServer(selector, serverSelectionOptions, (error, server) => {
            if (!error && isWriteOperation && !supportsRetryableWrites(server)) {
                return callback(new MongoUnexpectedServerResponseError('Selected server does not support retryable writes'));
            }
            if (error || !server) {
                return callback(error !== null && error !== void 0 ? error : new MongoUnexpectedServerResponseError('Server selection failed without error'));
            }
            operation.execute(server, session, callback);
        });
    }
    if (readPreference &&
        !readPreference.equals(ReadPreference.primary) &&
        (session === null || session === void 0 ? void 0 : session.inTransaction())) {
        callback(new MongoTransactionError(`Read preference in a transaction must be primary, not: ${readPreference.mode}`));
        return;
    }
    // select a server, and execute the operation against it
    topology.selectServer(selector, serverSelectionOptions, (error, server) => {
        if (error || !server) {
            return callback(error);
        }
        if (session && operation.hasAspect(Aspect.RETRYABLE)) {
            const willRetryRead = topology.s.options.retryReads && !inTransaction && operation.canRetryRead;
            const willRetryWrite = topology.s.options.retryWrites &&
                !inTransaction &&
                supportsRetryableWrites(server) &&
                operation.canRetryWrite;
            const hasReadAspect = operation.hasAspect(Aspect.READ_OPERATION);
            const hasWriteAspect = operation.hasAspect(Aspect.WRITE_OPERATION);
            if ((hasReadAspect && willRetryRead) || (hasWriteAspect && willRetryWrite)) {
                if (hasWriteAspect && willRetryWrite) {
                    operation.options.willRetryWrite = true;
                    session.incrementTransactionNumber();
                }
                return operation.execute(server, session, (error, result) => {
                    if (error instanceof MongoError) {
                        return retryOperation(error);
                    }
                    else if (error) {
                        return callback(error);
                    }
                    callback(undefined, result);
                });
            }
        }
        return operation.execute(server, session, callback);
    });
}
//# sourceMappingURL=execute_operation.js.map