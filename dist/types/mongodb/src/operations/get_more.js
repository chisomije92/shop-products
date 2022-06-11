import { MongoRuntimeError } from '../error';
import { maxWireVersion } from '../utils';
import { AbstractOperation, Aspect, defineAspects } from './operation';
/** @internal */
export class GetMoreOperation extends AbstractOperation {
    constructor(ns, cursorId, server, options = {}) {
        super(options);
        this.options = options;
        // comment on getMore is only supported for server versions 4.4 and above
        if (maxWireVersion(server) < 9) {
            delete this.options.comment;
        }
        this.ns = ns;
        this.cursorId = cursorId;
        this.server = server;
    }
    /**
     * Although there is a server already associated with the get more operation, the signature
     * for execute passes a server so we will just use that one.
     */
    execute(server, session, callback) {
        if (server !== this.server) {
            return callback(new MongoRuntimeError('Getmore must run on the same server operation began on'));
        }
        server.getMore(this.ns, this.cursorId, this.options, callback);
    }
}
defineAspects(GetMoreOperation, [Aspect.READ_OPERATION, Aspect.CURSOR_ITERATING]);
//# sourceMappingURL=get_more.js.map