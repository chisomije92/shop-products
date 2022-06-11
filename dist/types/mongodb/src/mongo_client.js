import { resolveBSONOptions } from './bson';
import { ChangeStream } from './change_stream';
import { parseOptions } from './connection_string';
import { Db } from './db';
import { MongoInvalidArgumentError, MongoNotConnectedError } from './error';
import { TypedEventEmitter } from './mongo_types';
import { connect } from './operations/connect';
import { PromiseProvider } from './promise_provider';
import { maybePromise, ns, resolveOptions } from './utils';
/** @public */
export const ServerApiVersion = Object.freeze({
    v1: '1'
});
/** @internal */
const kOptions = Symbol('options');
/**
 * The **MongoClient** class is a class that allows for making Connections to MongoDB.
 * @public
 *
 * @remarks
 * The programmatically provided options take precedent over the URI options.
 *
 * @example
 * ```js
 * // Connect using a MongoClient instance
 * const MongoClient = require('mongodb').MongoClient;
 * const test = require('assert');
 * // Connection url
 * const url = 'mongodb://localhost:27017';
 * // Database Name
 * const dbName = 'test';
 * // Connect using MongoClient
 * const mongoClient = new MongoClient(url);
 * mongoClient.connect(function(err, client) {
 *   const db = client.db(dbName);
 *   client.close();
 * });
 * ```
 *
 * @example
 * ```js
 * // Connect using the MongoClient.connect static method
 * const MongoClient = require('mongodb').MongoClient;
 * const test = require('assert');
 * // Connection url
 * const url = 'mongodb://localhost:27017';
 * // Database Name
 * const dbName = 'test';
 * // Connect using MongoClient
 * MongoClient.connect(url, function(err, client) {
 *   const db = client.db(dbName);
 *   client.close();
 * });
 * ```
 */
export class MongoClient extends TypedEventEmitter {
    constructor(url, options) {
        super();
        this[kOptions] = parseOptions(url, this, options);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const client = this;
        // The internal state
        this.s = {
            url,
            sessions: new Set(),
            bsonOptions: resolveBSONOptions(this[kOptions]),
            namespace: ns('admin'),
            hasBeenClosed: false,
            get options() {
                return client[kOptions];
            },
            get readConcern() {
                return client[kOptions].readConcern;
            },
            get writeConcern() {
                return client[kOptions].writeConcern;
            },
            get readPreference() {
                return client[kOptions].readPreference;
            },
            get logger() {
                return client[kOptions].logger;
            },
            get isMongoClient() {
                return true;
            }
        };
    }
    get options() {
        return Object.freeze(Object.assign({}, this[kOptions]));
    }
    get serverApi() {
        return this[kOptions].serverApi && Object.freeze(Object.assign({}, this[kOptions].serverApi));
    }
    /**
     * Intended for APM use only
     * @internal
     */
    get monitorCommands() {
        return this[kOptions].monitorCommands;
    }
    set monitorCommands(value) {
        this[kOptions].monitorCommands = value;
    }
    get autoEncrypter() {
        return this[kOptions].autoEncrypter;
    }
    get readConcern() {
        return this.s.readConcern;
    }
    get writeConcern() {
        return this.s.writeConcern;
    }
    get readPreference() {
        return this.s.readPreference;
    }
    get bsonOptions() {
        return this.s.bsonOptions;
    }
    get logger() {
        return this.s.logger;
    }
    connect(callback) {
        if (callback && typeof callback !== 'function') {
            throw new MongoInvalidArgumentError('Method `connect` only accepts a callback');
        }
        return maybePromise(callback, cb => {
            connect(this, this[kOptions], err => {
                if (err)
                    return cb(err);
                cb(undefined, this);
            });
        });
    }
    close(forceOrCallback, callback) {
        // There's no way to set hasBeenClosed back to false
        Object.defineProperty(this.s, 'hasBeenClosed', {
            value: true,
            enumerable: true,
            configurable: false,
            writable: false
        });
        if (typeof forceOrCallback === 'function') {
            callback = forceOrCallback;
        }
        const force = typeof forceOrCallback === 'boolean' ? forceOrCallback : false;
        return maybePromise(callback, callback => {
            if (this.topology == null) {
                return callback();
            }
            // clear out references to old topology
            const topology = this.topology;
            this.topology = undefined;
            topology.close({ force }, error => {
                if (error)
                    return callback(error);
                const { encrypter } = this[kOptions];
                if (encrypter) {
                    return encrypter.close(this, force, error => {
                        callback(error);
                    });
                }
                callback();
            });
        });
    }
    /**
     * Create a new Db instance sharing the current socket connections.
     *
     * @param dbName - The name of the database we want to use. If not provided, use database name from connection string.
     * @param options - Optional settings for Db construction
     */
    db(dbName, options) {
        options = options !== null && options !== void 0 ? options : {};
        // Default to db from connection string if not provided
        if (!dbName) {
            dbName = this.options.dbName;
        }
        // Copy the options and add out internal override of the not shared flag
        const finalOptions = Object.assign({}, this[kOptions], options);
        // Return the db object
        const db = new Db(this, dbName, finalOptions);
        // Return the database
        return db;
    }
    static connect(url, options, callback) {
        if (typeof options === 'function')
            (callback = options), (options = {});
        options = options !== null && options !== void 0 ? options : {};
        try {
            // Create client
            const mongoClient = new MongoClient(url, options);
            // Execute the connect method
            if (callback) {
                return mongoClient.connect(callback);
            }
            else {
                return mongoClient.connect();
            }
        }
        catch (error) {
            if (callback)
                return callback(error);
            else
                return PromiseProvider.get().reject(error);
        }
    }
    startSession(options) {
        options = Object.assign({ explicit: true }, options);
        if (!this.topology) {
            throw new MongoNotConnectedError('MongoClient must be connected to start a session');
        }
        return this.topology.startSession(options, this.s.options);
    }
    withSession(optionsOrOperation, callback) {
        const options = Object.assign({ 
            // Always define an owner
            owner: Symbol() }, (typeof optionsOrOperation === 'object' ? optionsOrOperation : {}));
        const withSessionCallback = typeof optionsOrOperation === 'function' ? optionsOrOperation : callback;
        if (withSessionCallback == null) {
            throw new MongoInvalidArgumentError('Missing required callback parameter');
        }
        const session = this.startSession(options);
        const Promise = PromiseProvider.get();
        return Promise.resolve()
            .then(() => withSessionCallback(session))
            .then(() => {
            // Do not return the result of callback
        })
            .finally(() => session.endSession());
    }
    /**
     * Create a new Change Stream, watching for new changes (insertions, updates,
     * replacements, deletions, and invalidations) in this cluster. Will ignore all
     * changes to system collections, as well as the local, admin, and config databases.
     *
     * @remarks
     * watch() accepts two generic arguments for distinct usecases:
     * - The first is to provide the schema that may be defined for all the data within the current cluster
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
    /** Return the mongo client logger */
    getLogger() {
        return this.s.logger;
    }
}
//# sourceMappingURL=mongo_client.js.map