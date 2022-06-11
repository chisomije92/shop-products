import { MongoCompatibilityError, MongoInvalidArgumentError } from '../error';
import { Explain } from '../explain';
import { ReadConcern } from '../read_concern';
import { MIN_SECONDARY_WRITE_WIRE_VERSION } from '../sdam/server_selection';
import { commandSupportsReadConcern, decorateWithExplain, maxWireVersion, MongoDBNamespace } from '../utils';
import { WriteConcern } from '../write_concern';
import { AbstractOperation, Aspect } from './operation';
const SUPPORTS_WRITE_CONCERN_AND_COLLATION = 5;
/** @internal */
export class CommandOperation extends AbstractOperation {
    constructor(parent, options) {
        super(options);
        this.options = options !== null && options !== void 0 ? options : {};
        // NOTE: this was explicitly added for the add/remove user operations, it's likely
        //       something we'd want to reconsider. Perhaps those commands can use `Admin`
        //       as a parent?
        const dbNameOverride = (options === null || options === void 0 ? void 0 : options.dbName) || (options === null || options === void 0 ? void 0 : options.authdb);
        if (dbNameOverride) {
            this.ns = new MongoDBNamespace(dbNameOverride, '$cmd');
        }
        else {
            this.ns = parent
                ? parent.s.namespace.withCollection('$cmd')
                : new MongoDBNamespace('admin', '$cmd');
        }
        this.readConcern = ReadConcern.fromOptions(options);
        this.writeConcern = WriteConcern.fromOptions(options);
        // TODO(NODE-2056): make logger another "inheritable" property
        if (parent && parent.logger) {
            this.logger = parent.logger;
        }
        if (this.hasAspect(Aspect.EXPLAINABLE)) {
            this.explain = Explain.fromOptions(options);
        }
        else if ((options === null || options === void 0 ? void 0 : options.explain) != null) {
            throw new MongoInvalidArgumentError(`Option "explain" is not supported on this command`);
        }
    }
    get canRetryWrite() {
        if (this.hasAspect(Aspect.EXPLAINABLE)) {
            return this.explain == null;
        }
        return true;
    }
    executeCommand(server, session, cmd, callback) {
        // TODO: consider making this a non-enumerable property
        this.server = server;
        const options = Object.assign(Object.assign(Object.assign({}, this.options), this.bsonOptions), { readPreference: this.readPreference, session });
        const serverWireVersion = maxWireVersion(server);
        const inTransaction = this.session && this.session.inTransaction();
        if (this.readConcern && commandSupportsReadConcern(cmd) && !inTransaction) {
            Object.assign(cmd, { readConcern: this.readConcern });
        }
        if (this.trySecondaryWrite && serverWireVersion < MIN_SECONDARY_WRITE_WIRE_VERSION) {
            options.omitReadPreference = true;
        }
        if (options.collation && serverWireVersion < SUPPORTS_WRITE_CONCERN_AND_COLLATION) {
            callback(new MongoCompatibilityError(`Server ${server.name}, which reports wire version ${serverWireVersion}, does not support collation`));
            return;
        }
        if (this.writeConcern && this.hasAspect(Aspect.WRITE_OPERATION) && !inTransaction) {
            Object.assign(cmd, { writeConcern: this.writeConcern });
        }
        if (serverWireVersion >= SUPPORTS_WRITE_CONCERN_AND_COLLATION) {
            if (options.collation &&
                typeof options.collation === 'object' &&
                !this.hasAspect(Aspect.SKIP_COLLATION)) {
                Object.assign(cmd, { collation: options.collation });
            }
        }
        if (typeof options.maxTimeMS === 'number') {
            cmd.maxTimeMS = options.maxTimeMS;
        }
        if (this.hasAspect(Aspect.EXPLAINABLE) && this.explain) {
            if (serverWireVersion < 6 && cmd.aggregate) {
                // Prior to 3.6, with aggregate, verbosity is ignored, and we must pass in "explain: true"
                cmd.explain = true;
            }
            else {
                cmd = decorateWithExplain(cmd, this.explain);
            }
        }
        server.command(this.ns, cmd, options, callback);
    }
}
//# sourceMappingURL=command.js.map