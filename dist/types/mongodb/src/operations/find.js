import { MongoCompatibilityError, MongoInvalidArgumentError } from '../error';
import { ReadConcern } from '../read_concern';
import { formatSort } from '../sort';
import { decorateWithExplain, maxWireVersion, normalizeHintField } from '../utils';
import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
const SUPPORTS_WRITE_CONCERN_AND_COLLATION = 5;
/** @internal */
export class FindOperation extends CommandOperation {
    constructor(collection, ns, filter = {}, options = {}) {
        super(collection, options);
        this.options = options;
        this.ns = ns;
        if (typeof filter !== 'object' || Array.isArray(filter)) {
            throw new MongoInvalidArgumentError('Query filter must be a plain object or ObjectId');
        }
        // If the filter is a buffer, validate that is a valid BSON document
        if (Buffer.isBuffer(filter)) {
            const objectSize = filter[0] | (filter[1] << 8) | (filter[2] << 16) | (filter[3] << 24);
            if (objectSize !== filter.length) {
                throw new MongoInvalidArgumentError(`Query filter raw message size does not match message header size [${filter.length}] != [${objectSize}]`);
            }
        }
        // special case passing in an ObjectId as a filter
        this.filter = filter != null && filter._bsontype === 'ObjectID' ? { _id: filter } : filter;
    }
    execute(server, session, callback) {
        this.server = server;
        const serverWireVersion = maxWireVersion(server);
        const options = this.options;
        if (options.allowDiskUse != null && serverWireVersion < 4) {
            callback(new MongoCompatibilityError('Option "allowDiskUse" is not supported on MongoDB < 3.2'));
            return;
        }
        if (options.collation && serverWireVersion < SUPPORTS_WRITE_CONCERN_AND_COLLATION) {
            callback(new MongoCompatibilityError(`Server ${server.name}, which reports wire version ${serverWireVersion}, does not support collation`));
            return;
        }
        let findCommand = makeFindCommand(this.ns, this.filter, options);
        if (this.explain) {
            findCommand = decorateWithExplain(findCommand, this.explain);
        }
        server.command(this.ns, findCommand, Object.assign(Object.assign(Object.assign({}, this.options), this.bsonOptions), { documentsReturnedIn: 'firstBatch', session }), callback);
    }
}
function makeFindCommand(ns, filter, options) {
    const findCommand = {
        find: ns.collection,
        filter
    };
    if (options.sort) {
        findCommand.sort = formatSort(options.sort);
    }
    if (options.projection) {
        let projection = options.projection;
        if (projection && Array.isArray(projection)) {
            projection = projection.length
                ? projection.reduce((result, field) => {
                    result[field] = 1;
                    return result;
                }, {})
                : { _id: 1 };
        }
        findCommand.projection = projection;
    }
    if (options.hint) {
        findCommand.hint = normalizeHintField(options.hint);
    }
    if (typeof options.skip === 'number') {
        findCommand.skip = options.skip;
    }
    if (typeof options.limit === 'number') {
        if (options.limit < 0) {
            findCommand.limit = -options.limit;
            findCommand.singleBatch = true;
        }
        else {
            findCommand.limit = options.limit;
        }
    }
    if (typeof options.batchSize === 'number') {
        if (options.batchSize < 0) {
            if (options.limit &&
                options.limit !== 0 &&
                Math.abs(options.batchSize) < Math.abs(options.limit)) {
                findCommand.limit = -options.batchSize;
            }
            findCommand.singleBatch = true;
        }
        else {
            findCommand.batchSize = options.batchSize;
        }
    }
    if (typeof options.singleBatch === 'boolean') {
        findCommand.singleBatch = options.singleBatch;
    }
    // we check for undefined specifically here to allow falsy values
    // eslint-disable-next-line no-restricted-syntax
    if (options.comment !== undefined) {
        findCommand.comment = options.comment;
    }
    if (typeof options.maxTimeMS === 'number') {
        findCommand.maxTimeMS = options.maxTimeMS;
    }
    const readConcern = ReadConcern.fromOptions(options);
    if (readConcern) {
        findCommand.readConcern = readConcern.toJSON();
    }
    if (options.max) {
        findCommand.max = options.max;
    }
    if (options.min) {
        findCommand.min = options.min;
    }
    if (typeof options.returnKey === 'boolean') {
        findCommand.returnKey = options.returnKey;
    }
    if (typeof options.showRecordId === 'boolean') {
        findCommand.showRecordId = options.showRecordId;
    }
    if (typeof options.tailable === 'boolean') {
        findCommand.tailable = options.tailable;
    }
    if (typeof options.timeout === 'boolean') {
        findCommand.noCursorTimeout = !options.timeout;
    }
    else if (typeof options.noCursorTimeout === 'boolean') {
        findCommand.noCursorTimeout = options.noCursorTimeout;
    }
    if (typeof options.awaitData === 'boolean') {
        findCommand.awaitData = options.awaitData;
    }
    if (typeof options.allowPartialResults === 'boolean') {
        findCommand.allowPartialResults = options.allowPartialResults;
    }
    if (options.collation) {
        findCommand.collation = options.collation;
    }
    if (typeof options.allowDiskUse === 'boolean') {
        findCommand.allowDiskUse = options.allowDiskUse;
    }
    if (options.let) {
        findCommand.let = options.let;
    }
    return findCommand;
}
defineAspects(FindOperation, [
    Aspect.READ_OPERATION,
    Aspect.RETRYABLE,
    Aspect.EXPLAINABLE,
    Aspect.CURSOR_CREATING
]);
//# sourceMappingURL=find.js.map