import { AbstractCursor } from '../cursor/abstract_cursor';
import { maxWireVersion } from '../utils';
import { CommandOperation } from './command';
import { executeOperation } from './execute_operation';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class ListCollectionsOperation extends CommandOperation {
    constructor(db, filter, options) {
        super(db, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.db = db;
        this.filter = filter;
        this.nameOnly = !!this.options.nameOnly;
        this.authorizedCollections = !!this.options.authorizedCollections;
        if (typeof this.options.batchSize === 'number') {
            this.batchSize = this.options.batchSize;
        }
    }
    execute(server, session, callback) {
        return super.executeCommand(server, session, this.generateCommand(maxWireVersion(server)), callback);
    }
    /* This is here for the purpose of unit testing the final command that gets sent. */
    generateCommand(wireVersion) {
        const command = {
            listCollections: 1,
            filter: this.filter,
            cursor: this.batchSize ? { batchSize: this.batchSize } : {},
            nameOnly: this.nameOnly,
            authorizedCollections: this.authorizedCollections
        };
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (wireVersion >= 9 && this.options.comment !== undefined) {
            command.comment = this.options.comment;
        }
        return command;
    }
}
/** @public */
export class ListCollectionsCursor extends AbstractCursor {
    constructor(db, filter, options) {
        super(db.s.client, db.s.namespace, options);
        this.parent = db;
        this.filter = filter;
        this.options = options;
    }
    clone() {
        return new ListCollectionsCursor(this.parent, this.filter, Object.assign(Object.assign({}, this.options), this.cursorOptions));
    }
    /** @internal */
    _initialize(session, callback) {
        const operation = new ListCollectionsOperation(this.parent, this.filter, Object.assign(Object.assign(Object.assign({}, this.cursorOptions), this.options), { session }));
        executeOperation(this.parent.s.client, operation, (err, response) => {
            if (err || response == null)
                return callback(err);
            // TODO: NODE-2882
            callback(undefined, { server: operation.server, session, response });
        });
    }
}
defineAspects(ListCollectionsOperation, [
    Aspect.READ_OPERATION,
    Aspect.RETRYABLE,
    Aspect.CURSOR_CREATING
]);
//# sourceMappingURL=list_collections.js.map