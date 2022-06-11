import { Collection } from '../collection';
import { AbstractOperation } from './operation';
/** @internal */
export class CollectionsOperation extends AbstractOperation {
    constructor(db, options) {
        super(options);
        this.options = options;
        this.db = db;
    }
    execute(server, session, callback) {
        const db = this.db;
        // Let's get the collection names
        db.listCollections({}, Object.assign(Object.assign({}, this.options), { nameOnly: true, readPreference: this.readPreference, session })).toArray((err, documents) => {
            if (err || !documents)
                return callback(err);
            // Filter collections removing any illegal ones
            documents = documents.filter(doc => doc.name.indexOf('$') === -1);
            // Return the collection objects
            callback(undefined, documents.map(d => {
                return new Collection(db, d.name, db.s.options);
            }));
        });
    }
}
//# sourceMappingURL=collections.js.map