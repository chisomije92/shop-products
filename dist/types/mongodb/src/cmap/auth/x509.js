import { MongoMissingCredentialsError } from '../../error';
import { ns } from '../../utils';
import { AuthProvider } from './auth_provider';
export class X509 extends AuthProvider {
    prepare(handshakeDoc, authContext, callback) {
        const { credentials } = authContext;
        if (!credentials) {
            return callback(new MongoMissingCredentialsError('AuthContext must provide credentials.'));
        }
        Object.assign(handshakeDoc, {
            speculativeAuthenticate: x509AuthenticateCommand(credentials)
        });
        callback(undefined, handshakeDoc);
    }
    auth(authContext, callback) {
        const connection = authContext.connection;
        const credentials = authContext.credentials;
        if (!credentials) {
            return callback(new MongoMissingCredentialsError('AuthContext must provide credentials.'));
        }
        const response = authContext.response;
        if (response && response.speculativeAuthenticate) {
            return callback();
        }
        connection.command(ns('$external.$cmd'), x509AuthenticateCommand(credentials), undefined, callback);
    }
}
function x509AuthenticateCommand(credentials) {
    const command = { authenticate: 1, mechanism: 'MONGODB-X509' };
    if (credentials.username) {
        command.user = credentials.username;
    }
    return command;
}
//# sourceMappingURL=x509.js.map