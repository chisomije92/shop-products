import { MongoDBNamespace } from '../utils';
import { CommandOperation } from './command';
/** @internal */
export class RunCommandOperation extends CommandOperation {
    constructor(parent, command, options) {
        super(parent, options);
        this.options = options !== null && options !== void 0 ? options : {};
        this.command = command;
    }
    execute(server, session, callback) {
        const command = this.command;
        this.executeCommand(server, session, command, callback);
    }
}
export class RunAdminCommandOperation extends RunCommandOperation {
    constructor(parent, command, options) {
        super(parent, command, options);
        this.ns = new MongoDBNamespace('admin');
    }
}
//# sourceMappingURL=run_command.js.map