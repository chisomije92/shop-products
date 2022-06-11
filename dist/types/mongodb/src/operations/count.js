import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class CountOperation extends CommandOperation {
    constructor(namespace, filter, options) {
        super({ s: { namespace: namespace } }, options);
        this.options = options;
        this.collectionName = namespace.collection;
        this.query = filter;
    }
    execute(server, session, callback) {
        const options = this.options;
        const cmd = {
            count: this.collectionName,
            query: this.query
        };
        if (typeof options.limit === 'number') {
            cmd.limit = options.limit;
        }
        if (typeof options.skip === 'number') {
            cmd.skip = options.skip;
        }
        if (options.hint != null) {
            cmd.hint = options.hint;
        }
        if (typeof options.maxTimeMS === 'number') {
            cmd.maxTimeMS = options.maxTimeMS;
        }
        super.executeCommand(server, session, cmd, (err, result) => {
            callback(err, result ? result.n : 0);
        });
    }
}
defineAspects(CountOperation, [Aspect.READ_OPERATION, Aspect.RETRYABLE]);
//# sourceMappingURL=count.js.map