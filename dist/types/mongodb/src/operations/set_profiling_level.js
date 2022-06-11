import { MongoInvalidArgumentError, MongoRuntimeError } from '../error';
import { enumToString } from '../utils';
import { CommandOperation } from './command';
const levelValues = new Set(['off', 'slow_only', 'all']);
/** @public */
export const ProfilingLevel = Object.freeze({
    off: 'off',
    slowOnly: 'slow_only',
    all: 'all'
});
/** @internal */
export class SetProfilingLevelOperation extends CommandOperation {
    constructor(db, level, options) {
        super(db, options);
        this.options = options;
        switch (level) {
            case ProfilingLevel.off:
                this.profile = 0;
                break;
            case ProfilingLevel.slowOnly:
                this.profile = 1;
                break;
            case ProfilingLevel.all:
                this.profile = 2;
                break;
            default:
                this.profile = 0;
                break;
        }
        this.level = level;
    }
    execute(server, session, callback) {
        const level = this.level;
        if (!levelValues.has(level)) {
            return callback(new MongoInvalidArgumentError(`Profiling level must be one of "${enumToString(ProfilingLevel)}"`));
        }
        // TODO(NODE-3483): Determine error to put here
        super.executeCommand(server, session, { profile: this.profile }, (err, doc) => {
            if (err == null && doc.ok === 1)
                return callback(undefined, level);
            return err != null
                ? callback(err)
                : callback(new MongoRuntimeError('Error with profile command'));
        });
    }
}
//# sourceMappingURL=set_profiling_level.js.map