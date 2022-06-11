import { Collection } from '../collection';
import { MongoServerError } from '../error';
import { checkCollectionName } from '../utils';
import { Aspect, defineAspects } from './operation';
import { RunAdminCommandOperation } from './run_command';
/** @internal */
export class RenameOperation extends RunAdminCommandOperation {
    constructor(collection, newName, options) {
        // Check the collection name
        checkCollectionName(newName);
        // Build the command
        const renameCollection = collection.namespace;
        const toCollection = collection.s.namespace.withCollection(newName).toString();
        const dropTarget = typeof options.dropTarget === 'boolean' ? options.dropTarget : false;
        const cmd = { renameCollection: renameCollection, to: toCollection, dropTarget: dropTarget };
        super(collection, cmd, options);
        this.options = options;
        this.collection = collection;
        this.newName = newName;
    }
    execute(server, session, callback) {
        const coll = this.collection;
        super.execute(server, session, (err, doc) => {
            if (err)
                return callback(err);
            // We have an error
            if (doc === null || doc === void 0 ? void 0 : doc.errmsg) {
                return callback(new MongoServerError(doc));
            }
            let newColl;
            try {
                newColl = new Collection(coll.s.db, this.newName, coll.s.options);
            }
            catch (err) {
                return callback(err);
            }
            return callback(undefined, newColl);
        });
    }
}
defineAspects(RenameOperation, [Aspect.WRITE_OPERATION]);
//# sourceMappingURL=rename.js.map