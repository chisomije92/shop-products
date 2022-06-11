import { Binary } from '../../bson';
import { MongoMissingCredentialsError } from '../../error';
import { ns } from '../../utils';
import { AuthProvider } from './auth_provider';
export class Plain extends AuthProvider {
    auth(authContext, callback) {
        const { connection, credentials } = authContext;
        if (!credentials) {
            return callback(new MongoMissingCredentialsError('AuthContext must provide credentials.'));
        }
        const username = credentials.username;
        const password = credentials.password;
        const payload = new Binary(Buffer.from(`\x00${username}\x00${password}`));
        const command = {
            saslStart: 1,
            mechanism: 'PLAIN',
            payload: payload,
            autoAuthorize: 1
        };
        connection.command(ns('$external.$cmd'), command, undefined, callback);
    }
}
//# sourceMappingURL=plain.js.map