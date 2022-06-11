import { MongoRuntimeError } from '../../error';
/** Context used during authentication */
export class AuthContext {
    constructor(connection, credentials, options) {
        this.connection = connection;
        this.credentials = credentials;
        this.options = options;
    }
}
export class AuthProvider {
    /**
     * Prepare the handshake document before the initial handshake.
     *
     * @param handshakeDoc - The document used for the initial handshake on a connection
     * @param authContext - Context for authentication flow
     */
    prepare(handshakeDoc, authContext, callback) {
        callback(undefined, handshakeDoc);
    }
    /**
     * Authenticate
     *
     * @param context - A shared context for authentication flow
     * @param callback - The callback to return the result from the authentication
     */
    auth(context, callback) {
        // TODO(NODE-3483): Replace this with MongoMethodOverrideError
        callback(new MongoRuntimeError('`auth` method must be overridden by subclass'));
    }
}
//# sourceMappingURL=auth_provider.js.map