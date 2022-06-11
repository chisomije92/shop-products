import { MongoAPIError } from '../error';
import { AbstractOperation } from './operation';
/** @internal */
export class OptionsOperation extends AbstractOperation {
    constructor(collection, options) {
        super(options);
        this.options = options;
        this.collection = collection;
    }
    execute(server, session, callback) {
        const coll = this.collection;
        coll.s.db
            .listCollections({ name: coll.collectionName }, Object.assign(Object.assign({}, this.options), { nameOnly: false, readPreference: this.readPreference, session }))
            .toArray((err, collections) => {
            if (err || !collections)
                return callback(err);
            if (collections.length === 0) {
                // TODO(NODE-3485)
                return callback(new MongoAPIError(`collection ${coll.namespace} not found`));
            }
            callback(err, collections[0].options);
        });
    }
}
//# sourceMappingURL=options_operation.js.map