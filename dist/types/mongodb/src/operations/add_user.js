import * as crypto from 'crypto';
import { MongoInvalidArgumentError } from '../error';
import { emitWarningOnce, getTopology } from '../utils';
import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class AddUserOperation extends CommandOperation {
    constructor(db, username, password, options) {
        super(db, options);
        this.db = db;
        this.username = username;
        this.password = password;
        this.options = options !== null && options !== void 0 ? options : {};
    }
    execute(server, session, callback) {
        const db = this.db;
        const username = this.username;
        const password = this.password;
        const options = this.options;
        // Error out if digestPassword set
        if (options.digestPassword != null) {
            return callback(new MongoInvalidArgumentError('Option "digestPassword" not supported via addUser, use db.command(...) instead'));
        }
        let roles;
        if (!options.roles || (Array.isArray(options.roles) && options.roles.length === 0)) {
            emitWarningOnce('Creating a user without roles is deprecated. Defaults to "root" if db is "admin" or "dbOwner" otherwise');
            if (db.databaseName.toLowerCase() === 'admin') {
                roles = ['root'];
            }
            else {
                roles = ['dbOwner'];
            }
        }
        else {
            roles = Array.isArray(options.roles) ? options.roles : [options.roles];
        }
        let topology;
        try {
            topology = getTopology(db);
        }
        catch (error) {
            return callback(error);
        }
        const digestPassword = topology.lastHello().maxWireVersion >= 7;
        let userPassword = password;
        if (!digestPassword) {
            // Use node md5 generator
            const md5 = crypto.createHash('md5');
            // Generate keys used for authentication
            md5.update(`${username}:mongo:${password}`);
            userPassword = md5.digest('hex');
        }
        // Build the command to execute
        const command = {
            createUser: username,
            customData: options.customData || {},
            roles: roles,
            digestPassword
        };
        // No password
        if (typeof password === 'string') {
            command.pwd = userPassword;
        }
        super.executeCommand(server, session, command, callback);
    }
}
defineAspects(AddUserOperation, [Aspect.WRITE_OPERATION]);
//# sourceMappingURL=add_user.js.map