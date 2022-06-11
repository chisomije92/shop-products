import { MongoRuntimeError } from '../error';
import { CommandOperation } from './command';
/** @internal */
export class ProfilingLevelOperation extends CommandOperation {
    constructor(db, options) {
        super(db, options);
        this.options = options;
    }
    execute(server, session, callback) {
        super.executeCommand(server, session, { profile: -1 }, (err, doc) => {
            if (err == null && doc.ok === 1) {
                const was = doc.was;
                if (was === 0)
                    return callback(undefined, 'off');
                if (was === 1)
                    return callback(undefined, 'slow_only');
                if (was === 2)
                    return callback(undefined, 'all');
                // TODO(NODE-3483)
                return callback(new MongoRuntimeError(`Illegal profiling level value ${was}`));
            }
            else {
                // TODO(NODE-3483): Consider MongoUnexpectedServerResponseError
                err != null ? callback(err) : callback(new MongoRuntimeError('Error with profile command'));
            }
        });
    }
}
//# sourceMappingURL=profiling_level.js.map