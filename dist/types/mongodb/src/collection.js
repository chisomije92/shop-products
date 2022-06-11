import { resolveBSONOptions } from './bson';
import { OrderedBulkOperation } from './bulk/ordered';
import { UnorderedBulkOperation } from './bulk/unordered';
import { ChangeStream } from './change_stream';
import { AggregationCursor } from './cursor/aggregation_cursor';
import { FindCursor } from './cursor/find_cursor';
import { MongoInvalidArgumentError } from './error';
import { BulkWriteOperation } from './operations/bulk_write';
import { CountOperation } from './operations/count';
import { CountDocumentsOperation } from './operations/count_documents';
import { DeleteManyOperation, DeleteOneOperation } from './operations/delete';
import { DistinctOperation } from './operations/distinct';
import { DropCollectionOperation } from './operations/drop';
import { EstimatedDocumentCountOperation } from './operations/estimated_document_count';
import { executeOperation } from './operations/execute_operation';
import { FindOneAndDeleteOperation, FindOneAndReplaceOperation, FindOneAndUpdateOperation } from './operations/find_and_modify';
import { CreateIndexesOperation, CreateIndexOperation, DropIndexesOperation, DropIndexOperation, IndexesOperation, IndexExistsOperation, IndexInformationOperation, ListIndexesCursor } from './operations/indexes';
import { InsertManyOperation, InsertOneOperation } from './operations/insert';
import { IsCappedOperation } from './operations/is_capped';
import { MapReduceOperation } from './operations/map_reduce';
import { OptionsOperation } from './operations/options_operation';
import { RenameOperation } from './operations/rename';
import { CollStatsOperation } from './operations/stats';
import { ReplaceOneOperation, UpdateManyOperation, UpdateOneOperation } from './operations/update';
import { ReadConcern } from './read_concern';
import { ReadPreference } from './read_preference';
import { checkCollectionName, DEFAULT_PK_FACTORY, emitWarningOnce, MongoDBNamespace, normalizeHintField, resolveOptions } from './utils';
import { WriteConcern } from './write_concern';
/**
 * The **Collection** class is an internal class that embodies a MongoDB collection
 * allowing for insert/update/remove/find and other command operation on that MongoDB collection.
 *
 * **COLLECTION Cannot directly be instantiated**
 * @public
 *
 * @example
 * ```js
 * const MongoClient = require('mongodb').MongoClient;
 * const test = require('assert');
 * // Connection url
 * const url = 'mongodb://localhost:27017';
 * // Database Name
 * const dbName = 'test';
 * // Connect using MongoClient
 * MongoClient.connect(url, function(err, client) {
 *   // Create a collection we want to drop later
 *   const col = client.db(dbName).collection('createIndexExample1');
 *   // Show that duplicate records got dropped
 *   col.find({}).toArray(function(err, items) {
 *     expect(err).to.not.exist;
 *     test.equal(4, items.length);
 *     client.close();
 *   });
 * });
 * ```
 */
export class Collection {
    /**
     * Create a new Collection instance
     * @internal
     */
    constructor(db, name, options) {
        var _a, _b;
        checkCollectionName(name);
        // Internal state
        this.s = {
            db,
            options,
            namespace: new MongoDBNamespace(db.databaseName, name),
            pkFactory: (_b = (_a = db.options) === null || _a === void 0 ? void 0 : _a.pkFactory) !== null && _b !== void 0 ? _b : DEFAULT_PK_FACTORY,
            readPreference: ReadPreference.fromOptions(options),
            bsonOptions: resolveBSONOptions(options, db),
            readConcern: ReadConcern.fromOptions(options),
            writeConcern: WriteConcern.fromOptions(options)
        };
    }
    /**
     * The name of the database this collection belongs to
     */
    get dbName() {
        return this.s.namespace.db;
    }
    /**
     * The name of this collection
     */
    get collectionName() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.s.namespace.collection;
    }
    /**
     * The namespace of this collection, in the format `${this.dbName}.${this.collectionName}`
     */
    get namespace() {
        return this.s.namespace.toString();
    }
    /**
     * The current readConcern of the collection. If not explicitly defined for
     * this collection, will be inherited from the parent DB
     */
    get readConcern() {
        if (this.s.readConcern == null) {
            return this.s.db.readConcern;
        }
        return this.s.readConcern;
    }
    /**
     * The current readPreference of the collection. If not explicitly defined for
     * this collection, will be inherited from the parent DB
     */
    get readPreference() {
        if (this.s.readPreference == null) {
            return this.s.db.readPreference;
        }
        return this.s.readPreference;
    }
    get bsonOptions() {
        return this.s.bsonOptions;
    }
    /**
     * The current writeConcern of the collection. If not explicitly defined for
     * this collection, will be inherited from the parent DB
     */
    get writeConcern() {
        if (this.s.writeConcern == null) {
            return this.s.db.writeConcern;
        }
        return this.s.writeConcern;
    }
    /** The current index hint for the collection */
    get hint() {
        return this.s.collectionHint;
    }
    set hint(v) {
        this.s.collectionHint = normalizeHintField(v);
    }
    insertOne(doc, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        // CSFLE passes in { w: 'majority' } to ensure the lib works in both 3.x and 4.x
        // we support that option style here only
        if (options && Reflect.get(options, 'w')) {
            options.writeConcern = WriteConcern.fromOptions(Reflect.get(options, 'w'));
        }
        return executeOperation(this.s.db.s.client, new InsertOneOperation(this, doc, resolveOptions(this, options)), callback);
    }
    insertMany(docs, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options ? Object.assign({}, options) : { ordered: true };
        return executeOperation(this.s.db.s.client, new InsertManyOperation(this, docs, resolveOptions(this, options)), callback);
    }
    bulkWrite(operations, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options || { ordered: true };
        if (!Array.isArray(operations)) {
            throw new MongoInvalidArgumentError('Argument "operations" must be an array of documents');
        }
        return executeOperation(this.s.db.s.client, new BulkWriteOperation(this, operations, resolveOptions(this, options)), callback);
    }
    updateOne(filter, update, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new UpdateOneOperation(this, filter, update, resolveOptions(this, options)), callback);
    }
    replaceOne(filter, replacement, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new ReplaceOneOperation(this, filter, replacement, resolveOptions(this, options)), callback);
    }
    updateMany(filter, update, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new UpdateManyOperation(this, filter, update, resolveOptions(this, options)), callback);
    }
    deleteOne(filter, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new DeleteOneOperation(this, filter, resolveOptions(this, options)), callback);
    }
    deleteMany(filter, options, callback) {
        if (filter == null) {
            filter = {};
            options = {};
            callback = undefined;
        }
        else if (typeof filter === 'function') {
            callback = filter;
            filter = {};
            options = {};
        }
        else if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        return executeOperation(this.s.db.s.client, new DeleteManyOperation(this, filter, resolveOptions(this, options)), callback);
    }
    rename(newName, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        // Intentionally, we do not inherit options from parent for this operation.
        return executeOperation(this.s.db.s.client, new RenameOperation(this, newName, Object.assign(Object.assign({}, options), { readPreference: ReadPreference.PRIMARY })), callback);
    }
    drop(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options !== null && options !== void 0 ? options : {};
        return executeOperation(this.s.db.s.client, new DropCollectionOperation(this.s.db, this.collectionName, options), callback);
    }
    findOne(filter, options, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new MongoInvalidArgumentError('Third parameter to `findOne()` must be a callback or undefined');
        }
        if (typeof filter === 'function') {
            callback = filter;
            filter = {};
            options = {};
        }
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        const finalFilter = filter !== null && filter !== void 0 ? filter : {};
        const finalOptions = options !== null && options !== void 0 ? options : {};
        return this.find(finalFilter, finalOptions).limit(-1).batchSize(1).next(callback);
    }
    find(filter, options) {
        if (arguments.length > 2) {
            throw new MongoInvalidArgumentError('Method "collection.find()" accepts at most two arguments');
        }
        if (typeof options === 'function') {
            throw new MongoInvalidArgumentError('Argument "options" must not be function');
        }
        return new FindCursor(this.s.db.s.client, this.s.namespace, filter, resolveOptions(this, options));
    }
    options(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new OptionsOperation(this, resolveOptions(this, options)), callback);
    }
    isCapped(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new IsCappedOperation(this, resolveOptions(this, options)), callback);
    }
    createIndex(indexSpec, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new CreateIndexOperation(this, this.collectionName, indexSpec, resolveOptions(this, options)), callback);
    }
    createIndexes(indexSpecs, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options ? Object.assign({}, options) : {};
        if (typeof options.maxTimeMS !== 'number')
            delete options.maxTimeMS;
        return executeOperation(this.s.db.s.client, new CreateIndexesOperation(this, this.collectionName, indexSpecs, resolveOptions(this, options)), callback);
    }
    dropIndex(indexName, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = resolveOptions(this, options);
        // Run only against primary
        options.readPreference = ReadPreference.primary;
        return executeOperation(this.s.db.s.client, new DropIndexOperation(this, indexName, options), callback);
    }
    dropIndexes(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new DropIndexesOperation(this, resolveOptions(this, options)), callback);
    }
    /**
     * Get the list of all indexes information for the collection.
     *
     * @param options - Optional settings for the command
     */
    listIndexes(options) {
        return new ListIndexesCursor(this, resolveOptions(this, options));
    }
    indexExists(indexes, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new IndexExistsOperation(this, indexes, resolveOptions(this, options)), callback);
    }
    indexInformation(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new IndexInformationOperation(this.s.db, this.collectionName, resolveOptions(this, options)), callback);
    }
    estimatedDocumentCount(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new EstimatedDocumentCountOperation(this, resolveOptions(this, options)), callback);
    }
    countDocuments(filter, options, callback) {
        if (filter == null) {
            (filter = {}), (options = {}), (callback = undefined);
        }
        else if (typeof filter === 'function') {
            (callback = filter), (filter = {}), (options = {});
        }
        else {
            if (arguments.length === 2) {
                if (typeof options === 'function')
                    (callback = options), (options = {});
            }
        }
        filter !== null && filter !== void 0 ? filter : (filter = {});
        return executeOperation(this.s.db.s.client, new CountDocumentsOperation(this, filter, resolveOptions(this, options)), callback);
    }
    // Implementation
    distinct(key, filter, options, callback) {
        if (typeof filter === 'function') {
            (callback = filter), (filter = {}), (options = {});
        }
        else {
            if (arguments.length === 3 && typeof options === 'function') {
                (callback = options), (options = {});
            }
        }
        filter !== null && filter !== void 0 ? filter : (filter = {});
        return executeOperation(this.s.db.s.client, new DistinctOperation(this, key, filter, resolveOptions(this, options)), callback);
    }
    indexes(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new IndexesOperation(this, resolveOptions(this, options)), callback);
    }
    stats(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options !== null && options !== void 0 ? options : {};
        return executeOperation(this.s.db.s.client, new CollStatsOperation(this, options), callback);
    }
    findOneAndDelete(filter, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new FindOneAndDeleteOperation(this, filter, resolveOptions(this, options)), callback);
    }
    findOneAndReplace(filter, replacement, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new FindOneAndReplaceOperation(this, filter, replacement, resolveOptions(this, options)), callback);
    }
    findOneAndUpdate(filter, update, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.db.s.client, new FindOneAndUpdateOperation(this, filter, update, resolveOptions(this, options)), callback);
    }
    /**
     * Execute an aggregation framework pipeline against the collection, needs MongoDB \>= 2.2
     *
     * @param pipeline - An array of aggregation pipelines to execute
     * @param options - Optional settings for the command
     */
    aggregate(pipeline = [], options) {
        if (arguments.length > 2) {
            throw new MongoInvalidArgumentError('Method "collection.aggregate()" accepts at most two arguments');
        }
        if (!Array.isArray(pipeline)) {
            throw new MongoInvalidArgumentError('Argument "pipeline" must be an array of aggregation stages');
        }
        if (typeof options === 'function') {
            throw new MongoInvalidArgumentError('Argument "options" must not be function');
        }
        return new AggregationCursor(this.s.db.s.client, this.s.namespace, pipeline, resolveOptions(this, options));
    }
    /**
     * Create a new Change Stream, watching for new changes (insertions, updates, replacements, deletions, and invalidations) in this collection.
     *
     * @remarks
     * watch() accepts two generic arguments for distinct usecases:
     * - The first is to override the schema that may be defined for this specific collection
     * - The second is to override the shape of the change stream document entirely, if it is not provided the type will default to ChangeStreamDocument of the first argument
     * @example
     * By just providing the first argument I can type the change to be `ChangeStreamDocument<{ _id: number }>`
     * ```ts
     * collection.watch<{ _id: number }>()
     *   .on('change', change => console.log(change._id.toFixed(4)));
     * ```
     *
     * @example
     * Passing a second argument provides a way to reflect the type changes caused by an advanced pipeline.
     * Here, we are using a pipeline to have MongoDB filter for insert changes only and add a comment.
     * No need start from scratch on the ChangeStreamInsertDocument type!
     * By using an intersection we can save time and ensure defaults remain the same type!
     * ```ts
     * collection
     *   .watch<Schema, ChangeStreamInsertDocument<Schema> & { comment: string }>([
     *     { $addFields: { comment: 'big changes' } },
     *     { $match: { operationType: 'insert' } }
     *   ])
     *   .on('change', change => {
     *     change.comment.startsWith('big');
     *     change.operationType === 'insert';
     *     // No need to narrow in code because the generics did that for us!
     *     expectType<Schema>(change.fullDocument);
     *   });
     * ```
     *
     * @param pipeline - An array of {@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/|aggregation pipeline stages} through which to pass change stream documents. This allows for filtering (using $match) and manipulating the change stream documents.
     * @param options - Optional settings for the command
     * @typeParam TLocal - Type of the data being detected by the change stream
     * @typeParam TChange - Type of the whole change stream document emitted
     */
    watch(pipeline = [], options = {}) {
        // Allow optionally not specifying a pipeline
        if (!Array.isArray(pipeline)) {
            options = pipeline;
            pipeline = [];
        }
        return new ChangeStream(this, pipeline, resolveOptions(this, options));
    }
    mapReduce(map, reduce, options, callback) {
        emitWarningOnce('collection.mapReduce is deprecated. Use the aggregation pipeline instead. Visit https://docs.mongodb.com/manual/reference/map-reduce-to-aggregation-pipeline for more information on how to translate map-reduce operations to the aggregation pipeline.');
        if ('function' === typeof options)
            (callback = options), (options = {});
        // Out must always be defined (make sure we don't break weirdly on pre 1.8+ servers)
        // TODO NODE-3339: Figure out if this is still necessary given we no longer officially support pre-1.8
        if ((options === null || options === void 0 ? void 0 : options.out) == null) {
            throw new MongoInvalidArgumentError('Option "out" must be defined, see mongodb docs for possible values');
        }
        if ('function' === typeof map) {
            map = map.toString();
        }
        if ('function' === typeof reduce) {
            reduce = reduce.toString();
        }
        if ('function' === typeof options.finalize) {
            options.finalize = options.finalize.toString();
        }
        return executeOperation(this.s.db.s.client, new MapReduceOperation(this, map, reduce, resolveOptions(this, options)), callback);
    }
    /** Initiate an Out of order batch write operation. All operations will be buffered into insert/update/remove commands executed out of order. */
    initializeUnorderedBulkOp(options) {
        return new UnorderedBulkOperation(this, resolveOptions(this, options));
    }
    /** Initiate an In order bulk write operation. Operations will be serially executed in the order they are added, creating a new operation for each switch in types. */
    initializeOrderedBulkOp(options) {
        return new OrderedBulkOperation(this, resolveOptions(this, options));
    }
    /** Get the db scoped logger */
    getLogger() {
        return this.s.db.s.logger;
    }
    get logger() {
        return this.s.db.s.logger;
    }
    /**
     * Inserts a single document or a an array of documents into MongoDB. If documents passed in do not contain the **_id** field,
     * one will be added to each of the documents missing it by the driver, mutating the document. This behavior
     * can be overridden by setting the **forceServerObjectId** flag.
     *
     * @deprecated Use insertOne, insertMany or bulkWrite instead.
     * @param docs - The documents to insert
     * @param options - Optional settings for the command
     * @param callback - An optional callback, a Promise will be returned if none is provided
     */
    insert(docs, options, callback) {
        emitWarningOnce('collection.insert is deprecated. Use insertOne, insertMany or bulkWrite instead.');
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options || { ordered: false };
        docs = !Array.isArray(docs) ? [docs] : docs;
        if (options.keepGoing === true) {
            options.ordered = false;
        }
        return this.insertMany(docs, options, callback);
    }
    /**
     * Updates documents.
     *
     * @deprecated use updateOne, updateMany or bulkWrite
     * @param selector - The selector for the update operation.
     * @param update - The update operations to be applied to the documents
     * @param options - Optional settings for the command
     * @param callback - An optional callback, a Promise will be returned if none is provided
     */
    update(selector, update, options, callback) {
        emitWarningOnce('collection.update is deprecated. Use updateOne, updateMany, or bulkWrite instead.');
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options !== null && options !== void 0 ? options : {};
        return this.updateMany(selector, update, options, callback);
    }
    /**
     * Remove documents.
     *
     * @deprecated use deleteOne, deleteMany or bulkWrite
     * @param selector - The selector for the update operation.
     * @param options - Optional settings for the command
     * @param callback - An optional callback, a Promise will be returned if none is provided
     */
    remove(selector, options, callback) {
        emitWarningOnce('collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.');
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options !== null && options !== void 0 ? options : {};
        return this.deleteMany(selector, options, callback);
    }
    count(filter, options, callback) {
        if (typeof filter === 'function') {
            (callback = filter), (filter = {}), (options = {});
        }
        else {
            if (typeof options === 'function')
                (callback = options), (options = {});
        }
        filter !== null && filter !== void 0 ? filter : (filter = {});
        return executeOperation(this.s.db.s.client, new CountOperation(MongoDBNamespace.fromString(this.namespace), filter, resolveOptions(this, options)), callback);
    }
}
//# sourceMappingURL=collection.js.map