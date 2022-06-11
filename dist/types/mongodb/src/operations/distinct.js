import { MongoCompatibilityError } from '../error';
import { decorateWithCollation, decorateWithReadConcern, maxWireVersion } from '../utils';
import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/**
 * Return a list of distinct values for the given key across a collection.
 * @internal
 */
export class DistinctOperation extends CommandOperation {
    /**
     * Construct a Distinct operation.
     *
     * @param collection - Collection instance.
     * @param key - Field of the document to find distinct values for.
     * @param query - The query for filtering the set of documents to which we apply the distinct filter.
     * @param options - Optional settings. See Collection.prototype.distinct for a list of options.
     */
    constructor(collection, key, query, options) {
        super(collection, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.collection = collection;
        this.key = key;
        this.query = query;
    }
    execute(server, session, callback) {
        const coll = this.collection;
        const key = this.key;
        const query = this.query;
        const options = this.options;
        // Distinct command
        const cmd = {
            distinct: coll.collectionName,
            key: key,
            query: query
        };
        // Add maxTimeMS if defined
        if (typeof options.maxTimeMS === 'number') {
            cmd.maxTimeMS = options.maxTimeMS;
        }
        // Do we have a readConcern specified
        decorateWithReadConcern(cmd, coll, options);
        // Have we specified collation
        try {
            decorateWithCollation(cmd, coll, options);
        }
        catch (err) {
            return callback(err);
        }
        if (this.explain && maxWireVersion(server) < 4) {
            callback(new MongoCompatibilityError(`Server ${server.name} does not support explain on distinct`));
            return;
        }
        super.executeCommand(server, session, cmd, (err, result) => {
            if (err) {
                callback(err);
                return;
            }
            callback(undefined, this.explain ? result : result.values);
        });
    }
}
defineAspects(DistinctOperation, [Aspect.READ_OPERATION, Aspect.RETRYABLE, Aspect.EXPLAINABLE]);
//# sourceMappingURL=distinct.js.map