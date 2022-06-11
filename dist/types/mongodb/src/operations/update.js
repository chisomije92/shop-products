import { MongoCompatibilityError, MongoInvalidArgumentError, MongoServerError } from '../error';
import { collationNotSupported, hasAtomicOperators, maxWireVersion } from '../utils';
import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class UpdateOperation extends CommandOperation {
    constructor(ns, statements, options) {
        super(undefined, options);
        this.options = options;
        this.ns = ns;
        this.statements = statements;
    }
    get canRetryWrite() {
        if (super.canRetryWrite === false) {
            return false;
        }
        return this.statements.every(op => op.multi == null || op.multi === false);
    }
    execute(server, session, callback) {
        var _a;
        const options = (_a = this.options) !== null && _a !== void 0 ? _a : {};
        const ordered = typeof options.ordered === 'boolean' ? options.ordered : true;
        const command = {
            update: this.ns.collection,
            updates: this.statements,
            ordered
        };
        if (typeof options.bypassDocumentValidation === 'boolean') {
            command.bypassDocumentValidation = options.bypassDocumentValidation;
        }
        if (options.let) {
            command.let = options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        const statementWithCollation = this.statements.find(statement => !!statement.collation);
        if (collationNotSupported(server, options) ||
            (statementWithCollation && collationNotSupported(server, statementWithCollation))) {
            callback(new MongoCompatibilityError(`Server ${server.name} does not support collation`));
            return;
        }
        const unacknowledgedWrite = this.writeConcern && this.writeConcern.w === 0;
        if (unacknowledgedWrite || maxWireVersion(server) < 5) {
            if (this.statements.find((o) => o.hint)) {
                callback(new MongoCompatibilityError(`Servers < 3.4 do not support hint on update`));
                return;
            }
        }
        if (this.explain && maxWireVersion(server) < 3) {
            callback(new MongoCompatibilityError(`Server ${server.name} does not support explain on update`));
            return;
        }
        if (this.statements.some(statement => !!statement.arrayFilters) && maxWireVersion(server) < 6) {
            callback(new MongoCompatibilityError('Option "arrayFilters" is only supported on MongoDB 3.6+'));
            return;
        }
        super.executeCommand(server, session, command, callback);
    }
}
/** @internal */
export class UpdateOneOperation extends UpdateOperation {
    constructor(collection, filter, update, options) {
        super(collection.s.namespace, [makeUpdateStatement(filter, update, Object.assign(Object.assign({}, options), { multi: false }))], options);
        if (!hasAtomicOperators(update)) {
            throw new MongoInvalidArgumentError('Update document requires atomic operators');
        }
    }
    execute(server, session, callback) {
        super.execute(server, session, (err, res) => {
            var _a, _b;
            if (err || !res)
                return callback(err);
            if (this.explain != null)
                return callback(undefined, res);
            if (res.code)
                return callback(new MongoServerError(res));
            if (res.writeErrors)
                return callback(new MongoServerError(res.writeErrors[0]));
            callback(undefined, {
                acknowledged: (_b = ((_a = this.writeConcern) === null || _a === void 0 ? void 0 : _a.w) !== 0) !== null && _b !== void 0 ? _b : true,
                modifiedCount: res.nModified != null ? res.nModified : res.n,
                upsertedId: Array.isArray(res.upserted) && res.upserted.length > 0 ? res.upserted[0]._id : null,
                upsertedCount: Array.isArray(res.upserted) && res.upserted.length ? res.upserted.length : 0,
                matchedCount: Array.isArray(res.upserted) && res.upserted.length > 0 ? 0 : res.n
            });
        });
    }
}
/** @internal */
export class UpdateManyOperation extends UpdateOperation {
    constructor(collection, filter, update, options) {
        super(collection.s.namespace, [makeUpdateStatement(filter, update, Object.assign(Object.assign({}, options), { multi: true }))], options);
        if (!hasAtomicOperators(update)) {
            throw new MongoInvalidArgumentError('Update document requires atomic operators');
        }
    }
    execute(server, session, callback) {
        super.execute(server, session, (err, res) => {
            var _a, _b;
            if (err || !res)
                return callback(err);
            if (this.explain != null)
                return callback(undefined, res);
            if (res.code)
                return callback(new MongoServerError(res));
            if (res.writeErrors)
                return callback(new MongoServerError(res.writeErrors[0]));
            callback(undefined, {
                acknowledged: (_b = ((_a = this.writeConcern) === null || _a === void 0 ? void 0 : _a.w) !== 0) !== null && _b !== void 0 ? _b : true,
                modifiedCount: res.nModified != null ? res.nModified : res.n,
                upsertedId: Array.isArray(res.upserted) && res.upserted.length > 0 ? res.upserted[0]._id : null,
                upsertedCount: Array.isArray(res.upserted) && res.upserted.length ? res.upserted.length : 0,
                matchedCount: Array.isArray(res.upserted) && res.upserted.length > 0 ? 0 : res.n
            });
        });
    }
}
/** @internal */
export class ReplaceOneOperation extends UpdateOperation {
    constructor(collection, filter, replacement, options) {
        super(collection.s.namespace, [makeUpdateStatement(filter, replacement, Object.assign(Object.assign({}, options), { multi: false }))], options);
        if (hasAtomicOperators(replacement)) {
            throw new MongoInvalidArgumentError('Replacement document must not contain atomic operators');
        }
    }
    execute(server, session, callback) {
        super.execute(server, session, (err, res) => {
            var _a, _b;
            if (err || !res)
                return callback(err);
            if (this.explain != null)
                return callback(undefined, res);
            if (res.code)
                return callback(new MongoServerError(res));
            if (res.writeErrors)
                return callback(new MongoServerError(res.writeErrors[0]));
            callback(undefined, {
                acknowledged: (_b = ((_a = this.writeConcern) === null || _a === void 0 ? void 0 : _a.w) !== 0) !== null && _b !== void 0 ? _b : true,
                modifiedCount: res.nModified != null ? res.nModified : res.n,
                upsertedId: Array.isArray(res.upserted) && res.upserted.length > 0 ? res.upserted[0]._id : null,
                upsertedCount: Array.isArray(res.upserted) && res.upserted.length ? res.upserted.length : 0,
                matchedCount: Array.isArray(res.upserted) && res.upserted.length > 0 ? 0 : res.n
            });
        });
    }
}
export function makeUpdateStatement(filter, update, options) {
    if (filter == null || typeof filter !== 'object') {
        throw new MongoInvalidArgumentError('Selector must be a valid JavaScript object');
    }
    if (update == null || typeof update !== 'object') {
        throw new MongoInvalidArgumentError('Document must be a valid JavaScript object');
    }
    const op = { q: filter, u: update };
    if (typeof options.upsert === 'boolean') {
        op.upsert = options.upsert;
    }
    if (options.multi) {
        op.multi = options.multi;
    }
    if (options.hint) {
        op.hint = options.hint;
    }
    if (options.arrayFilters) {
        op.arrayFilters = options.arrayFilters;
    }
    if (options.collation) {
        op.collation = options.collation;
    }
    return op;
}
defineAspects(UpdateOperation, [Aspect.RETRYABLE, Aspect.WRITE_OPERATION, Aspect.SKIP_COLLATION]);
defineAspects(UpdateOneOperation, [
    Aspect.RETRYABLE,
    Aspect.WRITE_OPERATION,
    Aspect.EXPLAINABLE,
    Aspect.SKIP_COLLATION
]);
defineAspects(UpdateManyOperation, [
    Aspect.WRITE_OPERATION,
    Aspect.EXPLAINABLE,
    Aspect.SKIP_COLLATION
]);
defineAspects(ReplaceOneOperation, [
    Aspect.RETRYABLE,
    Aspect.WRITE_OPERATION,
    Aspect.SKIP_COLLATION
]);
//# sourceMappingURL=update.js.map