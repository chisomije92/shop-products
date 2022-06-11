import { AbstractCursor } from '../cursor/abstract_cursor';
import { MongoCompatibilityError, MONGODB_ERROR_CODES } from '../error';
import { ReadPreference } from '../read_preference';
import { maxWireVersion, parseIndexOptions } from '../utils';
import { CommandOperation } from './command';
import { indexInformation } from './common_functions';
import { executeOperation } from './execute_operation';
import { AbstractOperation, Aspect, defineAspects } from './operation';
const VALID_INDEX_OPTIONS = new Set([
    'background',
    'unique',
    'name',
    'partialFilterExpression',
    'sparse',
    'hidden',
    'expireAfterSeconds',
    'storageEngine',
    'collation',
    'version',
    // text indexes
    'weights',
    'default_language',
    'language_override',
    'textIndexVersion',
    // 2d-sphere indexes
    '2dsphereIndexVersion',
    // 2d indexes
    'bits',
    'min',
    'max',
    // geoHaystack Indexes
    'bucketSize',
    // wildcard indexes
    'wildcardProjection'
]);
function makeIndexSpec(indexSpec, options) {
    const indexParameters = parseIndexOptions(indexSpec);
    // Generate the index name
    const name = typeof options.name === 'string' ? options.name : indexParameters.name;
    // Set up the index
    const finalIndexSpec = { name, key: indexParameters.fieldHash };
    // merge valid index options into the index spec
    for (const optionName in options) {
        if (VALID_INDEX_OPTIONS.has(optionName)) {
            finalIndexSpec[optionName] = options[optionName];
        }
    }
    return finalIndexSpec;
}
/** @internal */
export class IndexesOperation extends AbstractOperation {
    constructor(collection, options) {
        super(options);
        this.options = options;
        this.collection = collection;
    }
    execute(server, session, callback) {
        const coll = this.collection;
        const options = this.options;
        indexInformation(coll.s.db, coll.collectionName, Object.assign(Object.assign({ full: true }, options), { readPreference: this.readPreference, session }), callback);
    }
}
/** @internal */
export class CreateIndexesOperation extends CommandOperation {
    constructor(parent, collectionName, indexes, options) {
        super(parent, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.collectionName = collectionName;
        this.indexes = indexes;
    }
    execute(server, session, callback) {
        const options = this.options;
        const indexes = this.indexes;
        const serverWireVersion = maxWireVersion(server);
        // Ensure we generate the correct name if the parameter is not set
        for (let i = 0; i < indexes.length; i++) {
            // Did the user pass in a collation, check if our write server supports it
            if (indexes[i].collation && serverWireVersion < 5) {
                callback(new MongoCompatibilityError(`Server ${server.name}, which reports wire version ${serverWireVersion}, ` +
                    'does not support collation'));
                return;
            }
            if (indexes[i].name == null) {
                const keys = [];
                for (const name in indexes[i].key) {
                    keys.push(`${name}_${indexes[i].key[name]}`);
                }
                // Set the name
                indexes[i].name = keys.join('_');
            }
        }
        const cmd = { createIndexes: this.collectionName, indexes };
        if (options.commitQuorum != null) {
            if (serverWireVersion < 9) {
                callback(new MongoCompatibilityError('Option `commitQuorum` for `createIndexes` not supported on servers < 4.4'));
                return;
            }
            cmd.commitQuorum = options.commitQuorum;
        }
        // collation is set on each index, it should not be defined at the root
        this.options.collation = undefined;
        super.executeCommand(server, session, cmd, err => {
            if (err) {
                callback(err);
                return;
            }
            const indexNames = indexes.map(index => index.name || '');
            callback(undefined, indexNames);
        });
    }
}
/** @internal */
export class CreateIndexOperation extends CreateIndexesOperation {
    constructor(parent, collectionName, indexSpec, options) {
        // createIndex can be called with a variety of styles:
        //   coll.createIndex('a');
        //   coll.createIndex({ a: 1 });
        //   coll.createIndex([['a', 1]]);
        // createIndexes is always called with an array of index spec objects
        super(parent, collectionName, [makeIndexSpec(indexSpec, options)], options);
    }
    execute(server, session, callback) {
        super.execute(server, session, (err, indexNames) => {
            if (err || !indexNames)
                return callback(err);
            return callback(undefined, indexNames[0]);
        });
    }
}
/** @internal */
export class EnsureIndexOperation extends CreateIndexOperation {
    constructor(db, collectionName, indexSpec, options) {
        super(db, collectionName, indexSpec, options);
        this.readPreference = ReadPreference.primary;
        this.db = db;
        this.collectionName = collectionName;
    }
    execute(server, session, callback) {
        const indexName = this.indexes[0].name;
        const cursor = this.db.collection(this.collectionName).listIndexes({ session });
        cursor.toArray((err, indexes) => {
            /// ignore "NamespaceNotFound" errors
            if (err && err.code !== MONGODB_ERROR_CODES.NamespaceNotFound) {
                return callback(err);
            }
            if (indexes) {
                indexes = Array.isArray(indexes) ? indexes : [indexes];
                if (indexes.some(index => index.name === indexName)) {
                    callback(undefined, indexName);
                    return;
                }
            }
            super.execute(server, session, callback);
        });
    }
}
/** @internal */
export class DropIndexOperation extends CommandOperation {
    constructor(collection, indexName, options) {
        super(collection, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.collection = collection;
        this.indexName = indexName;
    }
    execute(server, session, callback) {
        const cmd = { dropIndexes: this.collection.collectionName, index: this.indexName };
        super.executeCommand(server, session, cmd, callback);
    }
}
/** @internal */
export class DropIndexesOperation extends DropIndexOperation {
    constructor(collection, options) {
        super(collection, '*', options);
    }
    execute(server, session, callback) {
        super.execute(server, session, err => {
            if (err)
                return callback(err, false);
            callback(undefined, true);
        });
    }
}
/** @internal */
export class ListIndexesOperation extends CommandOperation {
    constructor(collection, options) {
        super(collection, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.collectionNamespace = collection.s.namespace;
    }
    execute(server, session, callback) {
        const serverWireVersion = maxWireVersion(server);
        const cursor = this.options.batchSize ? { batchSize: this.options.batchSize } : {};
        const command = { listIndexes: this.collectionNamespace.collection, cursor };
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (serverWireVersion >= 9 && this.options.comment !== undefined) {
            command.comment = this.options.comment;
        }
        super.executeCommand(server, session, command, callback);
    }
}
/** @public */
export class ListIndexesCursor extends AbstractCursor {
    constructor(collection, options) {
        super(collection.s.db.s.client, collection.s.namespace, options);
        this.parent = collection;
        this.options = options;
    }
    clone() {
        return new ListIndexesCursor(this.parent, Object.assign(Object.assign({}, this.options), this.cursorOptions));
    }
    /** @internal */
    _initialize(session, callback) {
        const operation = new ListIndexesOperation(this.parent, Object.assign(Object.assign(Object.assign({}, this.cursorOptions), this.options), { session }));
        executeOperation(this.parent.s.db.s.client, operation, (err, response) => {
            if (err || response == null)
                return callback(err);
            // TODO: NODE-2882
            callback(undefined, { server: operation.server, session, response });
        });
    }
}
/** @internal */
export class IndexExistsOperation extends AbstractOperation {
    constructor(collection, indexes, options) {
        super(options);
        this.options = options;
        this.collection = collection;
        this.indexes = indexes;
    }
    execute(server, session, callback) {
        const coll = this.collection;
        const indexes = this.indexes;
        indexInformation(coll.s.db, coll.collectionName, Object.assign(Object.assign({}, this.options), { readPreference: this.readPreference, session }), (err, indexInformation) => {
            // If we have an error return
            if (err != null)
                return callback(err);
            // Let's check for the index names
            if (!Array.isArray(indexes))
                return callback(undefined, indexInformation[indexes] != null);
            // Check in list of indexes
            for (let i = 0; i < indexes.length; i++) {
                if (indexInformation[indexes[i]] == null) {
                    return callback(undefined, false);
                }
            }
            // All keys found return true
            return callback(undefined, true);
        });
    }
}
/** @internal */
export class IndexInformationOperation extends AbstractOperation {
    constructor(db, name, options) {
        super(options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.db = db;
        this.name = name;
    }
    execute(server, session, callback) {
        const db = this.db;
        const name = this.name;
        indexInformation(db, name, Object.assign(Object.assign({}, this.options), { readPreference: this.readPreference, session }), callback);
    }
}
defineAspects(ListIndexesOperation, [
    Aspect.READ_OPERATION,
    Aspect.RETRYABLE,
    Aspect.CURSOR_CREATING
]);
defineAspects(CreateIndexesOperation, [Aspect.WRITE_OPERATION]);
defineAspects(CreateIndexOperation, [Aspect.WRITE_OPERATION]);
defineAspects(EnsureIndexOperation, [Aspect.WRITE_OPERATION]);
defineAspects(DropIndexOperation, [Aspect.WRITE_OPERATION]);
defineAspects(DropIndexesOperation, [Aspect.WRITE_OPERATION]);
//# sourceMappingURL=indexes.js.map