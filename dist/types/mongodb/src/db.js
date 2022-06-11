import { Admin } from './admin';
import { resolveBSONOptions } from './bson';
import { ChangeStream } from './change_stream';
import { Collection } from './collection';
import * as CONSTANTS from './constants';
import { AggregationCursor } from './cursor/aggregation_cursor';
import { MongoAPIError, MongoInvalidArgumentError } from './error';
import { Logger } from './logger';
import { AddUserOperation } from './operations/add_user';
import { CollectionsOperation } from './operations/collections';
import { CreateCollectionOperation } from './operations/create_collection';
import { DropCollectionOperation, DropDatabaseOperation } from './operations/drop';
import { executeOperation } from './operations/execute_operation';
import { CreateIndexOperation, IndexInformationOperation } from './operations/indexes';
import { ListCollectionsCursor } from './operations/list_collections';
import { ProfilingLevelOperation } from './operations/profiling_level';
import { RemoveUserOperation } from './operations/remove_user';
import { RenameOperation } from './operations/rename';
import { RunCommandOperation } from './operations/run_command';
import { SetProfilingLevelOperation } from './operations/set_profiling_level';
import { DbStatsOperation } from './operations/stats';
import { ReadConcern } from './read_concern';
import { ReadPreference } from './read_preference';
import { DEFAULT_PK_FACTORY, filterOptions, getTopology, MongoDBNamespace, resolveOptions } from './utils';
import { WriteConcern } from './write_concern';
// Allowed parameters
const DB_OPTIONS_ALLOW_LIST = [
    'writeConcern',
    'readPreference',
    'readPreferenceTags',
    'native_parser',
    'forceServerObjectId',
    'pkFactory',
    'serializeFunctions',
    'raw',
    'authSource',
    'ignoreUndefined',
    'readConcern',
    'retryMiliSeconds',
    'numberOfRetries',
    'loggerLevel',
    'logger',
    'promoteBuffers',
    'promoteLongs',
    'bsonRegExp',
    'enableUtf8Validation',
    'promoteValues',
    'compression',
    'retryWrites'
];
/**
 * The **Db** class is a class that represents a MongoDB Database.
 * @public
 *
 * @example
 * ```js
 * const { MongoClient } = require('mongodb');
 * // Connection url
 * const url = 'mongodb://localhost:27017';
 * // Database Name
 * const dbName = 'test';
 * // Connect using MongoClient
 * MongoClient.connect(url, function(err, client) {
 *   // Select the database by name
 *   const testDb = client.db(dbName);
 *   client.close();
 * });
 * ```
 */
export class Db {
    /**
     * Creates a new Db instance
     *
     * @param client - The MongoClient for the database.
     * @param databaseName - The name of the database this instance represents.
     * @param options - Optional settings for Db construction
     */
    constructor(client, databaseName, options) {
        var _a;
        options = options !== null && options !== void 0 ? options : {};
        // Filter the options
        options = filterOptions(options, DB_OPTIONS_ALLOW_LIST);
        // Ensure we have a valid db name
        validateDatabaseName(databaseName);
        // Internal state of the db object
        this.s = {
            // Client
            client,
            // Options
            options,
            // Logger instance
            logger: new Logger('Db', options),
            // Unpack read preference
            readPreference: ReadPreference.fromOptions(options),
            // Merge bson options
            bsonOptions: resolveBSONOptions(options, client),
            // Set up the primary key factory or fallback to ObjectId
            pkFactory: (_a = options === null || options === void 0 ? void 0 : options.pkFactory) !== null && _a !== void 0 ? _a : DEFAULT_PK_FACTORY,
            // ReadConcern
            readConcern: ReadConcern.fromOptions(options),
            writeConcern: WriteConcern.fromOptions(options),
            // Namespace
            namespace: new MongoDBNamespace(databaseName)
        };
    }
    get databaseName() {
        return this.s.namespace.db;
    }
    // Options
    get options() {
        return this.s.options;
    }
    /**
     * slaveOk specified
     * @deprecated Use secondaryOk instead
     */
    get slaveOk() {
        return this.secondaryOk;
    }
    /**
     * Check if a secondary can be used (because the read preference is *not* set to primary)
     */
    get secondaryOk() {
        var _a;
        return ((_a = this.s.readPreference) === null || _a === void 0 ? void 0 : _a.preference) !== 'primary' || false;
    }
    get readConcern() {
        return this.s.readConcern;
    }
    /**
     * The current readPreference of the Db. If not explicitly defined for
     * this Db, will be inherited from the parent MongoClient
     */
    get readPreference() {
        if (this.s.readPreference == null) {
            return this.s.client.readPreference;
        }
        return this.s.readPreference;
    }
    get bsonOptions() {
        return this.s.bsonOptions;
    }
    // get the write Concern
    get writeConcern() {
        return this.s.writeConcern;
    }
    get namespace() {
        return this.s.namespace.toString();
    }
    createCollection(name, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new CreateCollectionOperation(this, name, resolveOptions(this, options)), callback);
    }
    command(command, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        // Intentionally, we do not inherit options from parent for this operation.
        return executeOperation(this.s.client, new RunCommandOperation(this, command, options !== null && options !== void 0 ? options : {}), callback);
    }
    /**
     * Execute an aggregation framework pipeline against the database, needs MongoDB \>= 3.6
     *
     * @param pipeline - An array of aggregation stages to be executed
     * @param options - Optional settings for the command
     */
    aggregate(pipeline = [], options) {
        if (arguments.length > 2) {
            throw new MongoInvalidArgumentError('Method "db.aggregate()" accepts at most two arguments');
        }
        if (typeof pipeline === 'function') {
            throw new MongoInvalidArgumentError('Argument "pipeline" must not be function');
        }
        if (typeof options === 'function') {
            throw new MongoInvalidArgumentError('Argument "options" must not be function');
        }
        return new AggregationCursor(this.s.client, this.s.namespace, pipeline, resolveOptions(this, options));
    }
    /** Return the Admin db instance */
    admin() {
        return new Admin(this);
    }
    /**
     * Returns a reference to a MongoDB Collection. If it does not exist it will be created implicitly.
     *
     * @param name - the collection name we wish to access.
     * @returns return the new Collection instance
     */
    collection(name, options = {}) {
        if (typeof options === 'function') {
            throw new MongoInvalidArgumentError('The callback form of this helper has been removed.');
        }
        const finalOptions = resolveOptions(this, options);
        return new Collection(this, name, finalOptions);
    }
    stats(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new DbStatsOperation(this, resolveOptions(this, options)), callback);
    }
    listCollections(filter = {}, options = {}) {
        return new ListCollectionsCursor(this, filter, resolveOptions(this, options));
    }
    renameCollection(fromCollection, toCollection, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        // Intentionally, we do not inherit options from parent for this operation.
        options = Object.assign(Object.assign({}, options), { readPreference: ReadPreference.PRIMARY });
        // Add return new collection
        options.new_collection = true;
        return executeOperation(this.s.client, new RenameOperation(this.collection(fromCollection), toCollection, options), callback);
    }
    dropCollection(name, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new DropCollectionOperation(this, name, resolveOptions(this, options)), callback);
    }
    dropDatabase(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new DropDatabaseOperation(this, resolveOptions(this, options)), callback);
    }
    collections(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new CollectionsOperation(this, resolveOptions(this, options)), callback);
    }
    createIndex(name, indexSpec, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new CreateIndexOperation(this, name, indexSpec, resolveOptions(this, options)), callback);
    }
    addUser(username, password, options, callback) {
        if (typeof password === 'function') {
            (callback = password), (password = undefined), (options = {});
        }
        else if (typeof password !== 'string') {
            if (typeof options === 'function') {
                (callback = options), (options = password), (password = undefined);
            }
            else {
                (options = password), (callback = undefined), (password = undefined);
            }
        }
        else {
            if (typeof options === 'function')
                (callback = options), (options = {});
        }
        return executeOperation(this.s.client, new AddUserOperation(this, username, password, resolveOptions(this, options)), callback);
    }
    removeUser(username, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new RemoveUserOperation(this, username, resolveOptions(this, options)), callback);
    }
    setProfilingLevel(level, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new SetProfilingLevelOperation(this, level, resolveOptions(this, options)), callback);
    }
    profilingLevel(options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new ProfilingLevelOperation(this, resolveOptions(this, options)), callback);
    }
    indexInformation(name, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        return executeOperation(this.s.client, new IndexInformationOperation(this, name, resolveOptions(this, options)), callback);
    }
    /**
     * Unref all sockets
     * @deprecated This function is deprecated and will be removed in the next major version.
     */
    unref() {
        getTopology(this).unref();
    }
    /**
     * Create a new Change Stream, watching for new changes (insertions, updates,
     * replacements, deletions, and invalidations) in this database. Will ignore all
     * changes to system collections.
     *
     * @remarks
     * watch() accepts two generic arguments for distinct usecases:
     * - The first is to provide the schema that may be defined for all the collections within this database
     * - The second is to override the shape of the change stream document entirely, if it is not provided the type will default to ChangeStreamDocument of the first argument
     *
     * @param pipeline - An array of {@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/|aggregation pipeline stages} through which to pass change stream documents. This allows for filtering (using $match) and manipulating the change stream documents.
     * @param options - Optional settings for the command
     * @typeParam TSchema - Type of the data being detected by the change stream
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
    /** Return the db logger */
    getLogger() {
        return this.s.logger;
    }
    get logger() {
        return this.s.logger;
    }
}
Db.SYSTEM_NAMESPACE_COLLECTION = CONSTANTS.SYSTEM_NAMESPACE_COLLECTION;
Db.SYSTEM_INDEX_COLLECTION = CONSTANTS.SYSTEM_INDEX_COLLECTION;
Db.SYSTEM_PROFILE_COLLECTION = CONSTANTS.SYSTEM_PROFILE_COLLECTION;
Db.SYSTEM_USER_COLLECTION = CONSTANTS.SYSTEM_USER_COLLECTION;
Db.SYSTEM_COMMAND_COLLECTION = CONSTANTS.SYSTEM_COMMAND_COLLECTION;
Db.SYSTEM_JS_COLLECTION = CONSTANTS.SYSTEM_JS_COLLECTION;
// TODO(NODE-3484): Refactor into MongoDBNamespace
// Validate the database name
function validateDatabaseName(databaseName) {
    if (typeof databaseName !== 'string')
        throw new MongoInvalidArgumentError('Database name must be a string');
    if (databaseName.length === 0)
        throw new MongoInvalidArgumentError('Database name cannot be the empty string');
    if (databaseName === '$external')
        return;
    const invalidChars = [' ', '.', '$', '/', '\\'];
    for (let i = 0; i < invalidChars.length; i++) {
        if (databaseName.indexOf(invalidChars[i]) !== -1)
            throw new MongoAPIError(`database names cannot contain the character '${invalidChars[i]}'`);
    }
}
//# sourceMappingURL=db.js.map