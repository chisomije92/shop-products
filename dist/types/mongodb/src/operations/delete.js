import { MongoCompatibilityError, MongoServerError } from '../error';
import { collationNotSupported, maxWireVersion } from '../utils';
import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class DeleteOperation extends CommandOperation {
    constructor(ns, statements, options) {
        super(undefined, options);
        this.options = options;
        this.ns = ns;
        this.statements = statements;
    }
    get canRetryWrite() {
        if (super.canRetryWrite === false) {
            return false;
        }
        return this.statements.every(op => (op.limit != null ? op.limit > 0 : true));
    }
    execute(server, session, callback) {
        var _a;
        const options = (_a = this.options) !== null && _a !== void 0 ? _a : {};
        const ordered = typeof options.ordered === 'boolean' ? options.ordered : true;
        const command = {
            delete: this.ns.collection,
            deletes: this.statements,
            ordered
        };
        if (options.let) {
            command.let = options.let;
        }
        // we check for undefined specifically here to allow falsy values
        // eslint-disable-next-line no-restricted-syntax
        if (options.comment !== undefined) {
            command.comment = options.comment;
        }
        if (options.explain != null && maxWireVersion(server) < 3) {
            return callback
                ? callback(new MongoCompatibilityError(`Server ${server.name} does not support explain on delete`))
                : undefined;
        }
        const unacknowledgedWrite = this.writeConcern && this.writeConcern.w === 0;
        if (unacknowledgedWrite || maxWireVersion(server) < 5) {
            if (this.statements.find((o) => o.hint)) {
                callback(new MongoCompatibilityError(`Servers < 3.4 do not support hint on delete`));
                return;
            }
        }
        const statementWithCollation = this.statements.find(statement => !!statement.collation);
        if (statementWithCollation && collationNotSupported(server, statementWithCollation)) {
            callback(new MongoCompatibilityError(`Server ${server.name} does not support collation`));
            return;
        }
        super.executeCommand(server, session, command, callback);
    }
}
export class DeleteOneOperation extends DeleteOperation {
    constructor(collection, filter, options) {
        super(collection.s.namespace, [makeDeleteStatement(filter, Object.assign(Object.assign({}, options), { limit: 1 }))], options);
    }
    execute(server, session, callback) {
        super.execute(server, session, (err, res) => {
            var _a, _b;
            if (err || res == null)
                return callback(err);
            if (res.code)
                return callback(new MongoServerError(res));
            if (res.writeErrors)
                return callback(new MongoServerError(res.writeErrors[0]));
            if (this.explain)
                return callback(undefined, res);
            callback(undefined, {
                acknowledged: (_b = ((_a = this.writeConcern) === null || _a === void 0 ? void 0 : _a.w) !== 0) !== null && _b !== void 0 ? _b : true,
                deletedCount: res.n
            });
        });
    }
}
export class DeleteManyOperation extends DeleteOperation {
    constructor(collection, filter, options) {
        super(collection.s.namespace, [makeDeleteStatement(filter, options)], options);
    }
    execute(server, session, callback) {
        super.execute(server, session, (err, res) => {
            var _a, _b;
            if (err || res == null)
                return callback(err);
            if (res.code)
                return callback(new MongoServerError(res));
            if (res.writeErrors)
                return callback(new MongoServerError(res.writeErrors[0]));
            if (this.explain)
                return callback(undefined, res);
            callback(undefined, {
                acknowledged: (_b = ((_a = this.writeConcern) === null || _a === void 0 ? void 0 : _a.w) !== 0) !== null && _b !== void 0 ? _b : true,
                deletedCount: res.n
            });
        });
    }
}
export function makeDeleteStatement(filter, options) {
    const op = {
        q: filter,
        limit: typeof options.limit === 'number' ? options.limit : 0
    };
    if (options.single === true) {
        op.limit = 1;
    }
    if (options.collation) {
        op.collation = options.collation;
    }
    if (options.hint) {
        op.hint = options.hint;
    }
    return op;
}
defineAspects(DeleteOperation, [Aspect.RETRYABLE, Aspect.WRITE_OPERATION]);
defineAspects(DeleteOneOperation, [
    Aspect.RETRYABLE,
    Aspect.WRITE_OPERATION,
    Aspect.EXPLAINABLE,
    Aspect.SKIP_COLLATION
]);
defineAspects(DeleteManyOperation, [
    Aspect.WRITE_OPERATION,
    Aspect.EXPLAINABLE,
    Aspect.SKIP_COLLATION
]);
//# sourceMappingURL=delete.js.map