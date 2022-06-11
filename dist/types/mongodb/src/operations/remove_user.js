import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class RemoveUserOperation extends CommandOperation {
    constructor(db, username, options) {
        super(db, options);
        this.options = options;
        this.username = username;
    }
    execute(server, session, callback) {
        super.executeCommand(server, session, { dropUser: this.username }, err => {
            callback(err, err ? false : true);
        });
    }
}
defineAspects(RemoveUserOperation, [Aspect.WRITE_OPERATION]);
//# sourceMappingURL=remove_user.js.map