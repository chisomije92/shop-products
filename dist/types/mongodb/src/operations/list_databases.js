import { maxWireVersion, MongoDBNamespace } from '../utils';
import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class ListDatabasesOperation extends CommandOperation {
    constructor(db, options) {
        super(db, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.ns = new MongoDBNamespace('admin', '$cmd');
    }
    execute(server, session, callback) {
        const cmd = { listDatabases: 1 };
        if (this.options.nameOnly) {
            cmd.nameOnly = Number(cmd.nameOnly);
        }
        if (this.options.filter) {
            cmd.filter = this.options.filter;
        }
        if (typeof this.options.authorizedDatabases === 'boolean') {
            cmd.authorizedDatabases = this.options.authorizedDatabases;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (maxWireVersion(server) >= 9 && this.options.comment !== undefined) {
            cmd.comment = this.options.comment;
        }
        super.executeCommand(server, session, cmd, callback);
    }
}
defineAspects(ListDatabasesOperation, [Aspect.READ_OPERATION, Aspect.RETRYABLE]);
//# sourceMappingURL=list_databases.js.map