import { MongoInvalidArgumentError, MongoServerError } from '../error';
import { WriteConcern } from '../write_concern';
import { BulkWriteOperation } from './bulk_write';
import { CommandOperation } from './command';
import { prepareDocs } from './common_functions';
import { AbstractOperation, Aspect, defineAspects } from './operation';
/** @internal */
export class InsertOperation extends CommandOperation {
    constructor(ns, documents, options) {
        var _a;
        super(undefined, options);
        this.options = Object.assign(Object.assign({}, options), { checkKeys: (_a = options.checkKeys) !== null && _a !== void 0 ? _a : false });
        this.ns = ns;
        this.documents = documents;
    }
    execute(server, session, callback) {
        var _a;
        const options = (_a = this.options) !== null && _a !== void 0 ? _a : {};
        const ordered = typeof options.ordered === 'boolean' ? options.ordered : true;
        const command = {
            insert: this.ns.collection,
            documents: this.documents,
            ordered
        };
        if (typeof options.bypassDocumentValidation === 'boolean') {
            command.bypassDocumentValidation = options.bypassDocumentValidation;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        super.executeCommand(server, session, command, callback);
    }
}
export class InsertOneOperation extends InsertOperation {
    constructor(collection, doc, options) {
        super(collection.s.namespace, prepareDocs(collection, [doc], options), options);
    }
    execute(server, session, callback) {
        super.execute(server, session, (err, res) => {
            var _a, _b;
            if (err || res == null)
                return callback(err);
            if (res.code)
                return callback(new MongoServerError(res));
            if (res.writeErrors) {
                // This should be a WriteError but we can't change it now because of error hierarchy
                return callback(new MongoServerError(res.writeErrors[0]));
            }
            callback(undefined, {
                acknowledged: (_b = ((_a = this.writeConcern) === null || _a === void 0 ? void 0 : _a.w) !== 0) !== null && _b !== void 0 ? _b : true,
                insertedId: this.documents[0]._id
            });
        });
    }
}
/** @internal */
export class InsertManyOperation extends AbstractOperation {
    constructor(collection, docs, options) {
        super(options);
        if (!Array.isArray(docs)) {
            throw new MongoInvalidArgumentError('Argument "docs" must be an array of documents');
        }
        this.options = options;
        this.collection = collection;
        this.docs = docs;
    }
    execute(server, session, callback) {
        const coll = this.collection;
        const options = Object.assign(Object.assign(Object.assign({}, this.options), this.bsonOptions), { readPreference: this.readPreference });
        const writeConcern = WriteConcern.fromOptions(options);
        const bulkWriteOperation = new BulkWriteOperation(coll, prepareDocs(coll, this.docs, options).map(document => ({ insertOne: { document } })), options);
        bulkWriteOperation.execute(server, session, (err, res) => {
            var _a;
            if (err || res == null) {
                if (err && err.message === 'Operation must be an object with an operation key') {
                    err = new MongoInvalidArgumentError('Collection.insertMany() cannot be called with an array that has null/undefined values');
                }
                return callback(err);
            }
            callback(undefined, {
                acknowledged: (_a = (writeConcern === null || writeConcern === void 0 ? void 0 : writeConcern.w) !== 0) !== null && _a !== void 0 ? _a : true,
                insertedCount: res.insertedCount,
                insertedIds: res.insertedIds
            });
        });
    }
}
defineAspects(InsertOperation, [Aspect.RETRYABLE, Aspect.WRITE_OPERATION]);
defineAspects(InsertOneOperation, [Aspect.RETRYABLE, Aspect.WRITE_OPERATION]);
defineAspects(InsertManyOperation, [Aspect.WRITE_OPERATION]);
//# sourceMappingURL=insert.js.map