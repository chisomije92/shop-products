import { AbstractOperation, Aspect, defineAspects } from './operation';
/** @internal */
export class BulkWriteOperation extends AbstractOperation {
    constructor(collection, operations, options) {
        super(options);
        this.options = options;
        this.collection = collection;
        this.operations = operations;
    }
    execute(server, session, callback) {
        const coll = this.collection;
        const operations = this.operations;
        const options = Object.assign(Object.assign(Object.assign({}, this.options), this.bsonOptions), { readPreference: this.readPreference });
        // Create the bulk operation
        const bulk = options.ordered === false
            ? coll.initializeUnorderedBulkOp(options)
            : coll.initializeOrderedBulkOp(options);
        // for each op go through and add to the bulk
        try {
            for (let i = 0; i < operations.length; i++) {
                bulk.raw(operations[i]);
            }
        }
        catch (err) {
            return callback(err);
        }
        // Execute the bulk
        bulk.execute(Object.assign(Object.assign({}, options), { session }), (err, r) => {
            // We have connection level error
            if (!r && err) {
                return callback(err);
            }
            // Return the results
            callback(undefined, r);
        });
    }
}
defineAspects(BulkWriteOperation, [Aspect.WRITE_OPERATION]);
//# sourceMappingURL=bulk_write.js.map