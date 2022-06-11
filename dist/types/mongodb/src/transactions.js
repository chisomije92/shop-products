import { MongoRuntimeError, MongoTransactionError } from './error';
import { ReadConcern } from './read_concern';
import { ReadPreference } from './read_preference';
import { WriteConcern } from './write_concern';
/** @internal */
export const TxnState = Object.freeze({
    NO_TRANSACTION: 'NO_TRANSACTION',
    STARTING_TRANSACTION: 'STARTING_TRANSACTION',
    TRANSACTION_IN_PROGRESS: 'TRANSACTION_IN_PROGRESS',
    TRANSACTION_COMMITTED: 'TRANSACTION_COMMITTED',
    TRANSACTION_COMMITTED_EMPTY: 'TRANSACTION_COMMITTED_EMPTY',
    TRANSACTION_ABORTED: 'TRANSACTION_ABORTED'
});
const stateMachine = {
    [TxnState.NO_TRANSACTION]: [TxnState.NO_TRANSACTION, TxnState.STARTING_TRANSACTION],
    [TxnState.STARTING_TRANSACTION]: [
        TxnState.TRANSACTION_IN_PROGRESS,
        TxnState.TRANSACTION_COMMITTED,
        TxnState.TRANSACTION_COMMITTED_EMPTY,
        TxnState.TRANSACTION_ABORTED
    ],
    [TxnState.TRANSACTION_IN_PROGRESS]: [
        TxnState.TRANSACTION_IN_PROGRESS,
        TxnState.TRANSACTION_COMMITTED,
        TxnState.TRANSACTION_ABORTED
    ],
    [TxnState.TRANSACTION_COMMITTED]: [
        TxnState.TRANSACTION_COMMITTED,
        TxnState.TRANSACTION_COMMITTED_EMPTY,
        TxnState.STARTING_TRANSACTION,
        TxnState.NO_TRANSACTION
    ],
    [TxnState.TRANSACTION_ABORTED]: [TxnState.STARTING_TRANSACTION, TxnState.NO_TRANSACTION],
    [TxnState.TRANSACTION_COMMITTED_EMPTY]: [
        TxnState.TRANSACTION_COMMITTED_EMPTY,
        TxnState.NO_TRANSACTION
    ]
};
const ACTIVE_STATES = new Set([
    TxnState.STARTING_TRANSACTION,
    TxnState.TRANSACTION_IN_PROGRESS
]);
const COMMITTED_STATES = new Set([
    TxnState.TRANSACTION_COMMITTED,
    TxnState.TRANSACTION_COMMITTED_EMPTY,
    TxnState.TRANSACTION_ABORTED
]);
/**
 * @public
 * A class maintaining state related to a server transaction. Internal Only
 */
export class Transaction {
    /** Create a transaction @internal */
    constructor(options) {
        options = options !== null && options !== void 0 ? options : {};
        this.state = TxnState.NO_TRANSACTION;
        this.options = {};
        const writeConcern = WriteConcern.fromOptions(options);
        if (writeConcern) {
            if (writeConcern.w === 0) {
                throw new MongoTransactionError('Transactions do not support unacknowledged write concern');
            }
            this.options.writeConcern = writeConcern;
        }
        if (options.readConcern) {
            this.options.readConcern = ReadConcern.fromOptions(options);
        }
        if (options.readPreference) {
            this.options.readPreference = ReadPreference.fromOptions(options);
        }
        if (options.maxCommitTimeMS) {
            this.options.maxTimeMS = options.maxCommitTimeMS;
        }
        // TODO: This isn't technically necessary
        this._pinnedServer = undefined;
        this._recoveryToken = undefined;
    }
    /** @internal */
    get server() {
        return this._pinnedServer;
    }
    get recoveryToken() {
        return this._recoveryToken;
    }
    get isPinned() {
        return !!this.server;
    }
    /** @returns Whether the transaction has started */
    get isStarting() {
        return this.state === TxnState.STARTING_TRANSACTION;
    }
    /**
     * @returns Whether this session is presently in a transaction
     */
    get isActive() {
        return ACTIVE_STATES.has(this.state);
    }
    get isCommitted() {
        return COMMITTED_STATES.has(this.state);
    }
    /**
     * Transition the transaction in the state machine
     * @internal
     * @param nextState - The new state to transition to
     */
    transition(nextState) {
        const nextStates = stateMachine[this.state];
        if (nextStates && nextStates.includes(nextState)) {
            this.state = nextState;
            if (this.state === TxnState.NO_TRANSACTION ||
                this.state === TxnState.STARTING_TRANSACTION ||
                this.state === TxnState.TRANSACTION_ABORTED) {
                this.unpinServer();
            }
            return;
        }
        throw new MongoRuntimeError(`Attempted illegal state transition from [${this.state}] to [${nextState}]`);
    }
    /** @internal */
    pinServer(server) {
        if (this.isActive) {
            this._pinnedServer = server;
        }
    }
    /** @internal */
    unpinServer() {
        this._pinnedServer = undefined;
    }
}
export function isTransactionCommand(command) {
    return !!(command.commitTransaction || command.abortTransaction);
}
//# sourceMappingURL=transactions.js.map