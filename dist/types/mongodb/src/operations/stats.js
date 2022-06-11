import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/**
 * Get all the collection statistics.
 * @internal
 */
export class CollStatsOperation extends CommandOperation {
    /**
     * Construct a Stats operation.
     *
     * @param collection - Collection instance
     * @param options - Optional settings. See Collection.prototype.stats for a list of options.
     */
    constructor(collection, options) {
        super(collection, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.collectionName = collection.collectionName;
    }
    execute(server, session, callback) {
        const command = { collStats: this.collectionName };
        if (this.options.scale != null) {
            command.scale = this.options.scale;
        }
        super.executeCommand(server, session, command, callback);
    }
}
/** @internal */
export class DbStatsOperation extends CommandOperation {
    constructor(db, options) {
        super(db, options);
        this.options = options;
    }
    execute(server, session, callback) {
        const command = { dbStats: true };
        if (this.options.scale != null) {
            command.scale = this.options.scale;
        }
        super.executeCommand(server, session, command, callback);
    }
}
defineAspects(CollStatsOperation, [Aspect.READ_OPERATION]);
defineAspects(DbStatsOperation, [Aspect.READ_OPERATION]);
//# sourceMappingURL=stats.js.map