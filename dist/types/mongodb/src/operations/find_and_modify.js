import { MongoCompatibilityError, MongoInvalidArgumentError } from '../error';
import { ReadPreference } from '../read_preference';
import { formatSort } from '../sort';
import { decorateWithCollation, hasAtomicOperators, maxWireVersion } from '../utils';
import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @public */
export const ReturnDocument = Object.freeze({
    BEFORE: 'before',
    AFTER: 'after'
});
function configureFindAndModifyCmdBaseUpdateOpts(cmdBase, options) {
    cmdBase.new = options.returnDocument === ReturnDocument.AFTER;
    cmdBase.upsert = options.upsert === true;
    if (options.bypassDocumentValidation === true) {
        cmdBase.bypassDocumentValidation = options.bypassDocumentValidation;
    }
    return cmdBase;
}
/** @internal */
class FindAndModifyOperation extends CommandOperation {
    constructor(collection, query, options) {
        super(collection, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.cmdBase = {
            remove: false,
            new: false,
            upsert: false
        };
        const sort = formatSort(options.sort);
        if (sort) {
            this.cmdBase.sort = sort;
        }
        if (options.projection) {
            this.cmdBase.fields = options.projection;
        }
        if (options.maxTimeMS) {
            this.cmdBase.maxTimeMS = options.maxTimeMS;
        }
        // Decorate the findAndModify command with the write Concern
        if (options.writeConcern) {
            this.cmdBase.writeConcern = options.writeConcern;
        }
        if (options.let) {
            this.cmdBase.let = options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            this.cmdBase.comment = options.comment;
        }
        // force primary read preference
        this.readPreference = ReadPreference.primary;
        this.collection = collection;
        this.query = query;
    }
    execute(server, session, callback) {
        var _a;
        const coll = this.collection;
        const query = this.query;
        const options = Object.assign(Object.assign({}, this.options), this.bsonOptions);
        // Create findAndModify command object
        const cmd = Object.assign({ findAndModify: coll.collectionName, query: query }, this.cmdBase);
        // Have we specified collation
        try {
            decorateWithCollation(cmd, coll, options);
        }
        catch (err) {
            return callback(err);
        }
        if (options.hint) {
            // TODO: once this method becomes a CommandOperation we will have the server
            // in place to check.
            const unacknowledgedWrite = ((_a = this.writeConcern) === null || _a === void 0 ? void 0 : _a.w) === 0;
            if (unacknowledgedWrite || maxWireVersion(server) < 8) {
                callback(new MongoCompatibilityError('The current topology does not support a hint on findAndModify commands'));
                return;
            }
            cmd.hint = options.hint;
        }
        if (this.explain && maxWireVersion(server) < 4) {
            callback(new MongoCompatibilityError(`Server ${server.name} does not support explain on findAndModify`));
            return;
        }
        // Execute the command
        super.executeCommand(server, session, cmd, (err, result) => {
            if (err)
                return callback(err);
            return callback(undefined, result);
        });
    }
}
/** @internal */
export class FindOneAndDeleteOperation extends FindAndModifyOperation {
    constructor(collection, filter, options) {
        // Basic validation
        if (filter == null || typeof filter !== 'object') {
            throw new MongoInvalidArgumentError('Argument "filter" must be an object');
        }
        super(collection, filter, options);
        this.cmdBase.remove = true;
    }
}
/** @internal */
export class FindOneAndReplaceOperation extends FindAndModifyOperation {
    constructor(collection, filter, replacement, options) {
        if (filter == null || typeof filter !== 'object') {
            throw new MongoInvalidArgumentError('Argument "filter" must be an object');
        }
        if (replacement == null || typeof replacement !== 'object') {
            throw new MongoInvalidArgumentError('Argument "replacement" must be an object');
        }
        if (hasAtomicOperators(replacement)) {
            throw new MongoInvalidArgumentError('Replacement document must not contain atomic operators');
        }
        super(collection, filter, options);
        this.cmdBase.update = replacement;
        configureFindAndModifyCmdBaseUpdateOpts(this.cmdBase, options);
    }
}
/** @internal */
export class FindOneAndUpdateOperation extends FindAndModifyOperation {
    constructor(collection, filter, update, options) {
        if (filter == null || typeof filter !== 'object') {
            throw new MongoInvalidArgumentError('Argument "filter" must be an object');
        }
        if (update == null || typeof update !== 'object') {
            throw new MongoInvalidArgumentError('Argument "update" must be an object');
        }
        if (!hasAtomicOperators(update)) {
            throw new MongoInvalidArgumentError('Update document requires atomic operators');
        }
        super(collection, filter, options);
        this.cmdBase.update = update;
        configureFindAndModifyCmdBaseUpdateOpts(this.cmdBase, options);
        if (options.arrayFilters) {
            this.cmdBase.arrayFilters = options.arrayFilters;
        }
    }
}
defineAspects(FindAndModifyOperation, [
    Aspect.WRITE_OPERATION,
    Aspect.RETRYABLE,
    Aspect.EXPLAINABLE
]);
//# sourceMappingURL=find_and_modify.js.map