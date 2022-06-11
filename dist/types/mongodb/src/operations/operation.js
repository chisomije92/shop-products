import { resolveBSONOptions } from '../bson';
import { ReadPreference } from '../read_preference';
export const Aspect = {
    READ_OPERATION: Symbol('READ_OPERATION'),
    WRITE_OPERATION: Symbol('WRITE_OPERATION'),
    RETRYABLE: Symbol('RETRYABLE'),
    EXPLAINABLE: Symbol('EXPLAINABLE'),
    SKIP_COLLATION: Symbol('SKIP_COLLATION'),
    CURSOR_CREATING: Symbol('CURSOR_CREATING'),
    CURSOR_ITERATING: Symbol('CURSOR_ITERATING')
};
/** @internal */
const kSession = Symbol('session');
/**
 * This class acts as a parent class for any operation and is responsible for setting this.options,
 * as well as setting and getting a session.
 * Additionally, this class implements `hasAspect`, which determines whether an operation has
 * a specific aspect.
 * @internal
 */
export class AbstractOperation {
    constructor(options = {}) {
        var _a;
        this.readPreference = this.hasAspect(Aspect.WRITE_OPERATION)
            ? ReadPreference.primary
            : (_a = ReadPreference.fromOptions(options)) !== null && _a !== void 0 ? _a : ReadPreference.primary;
        // Pull the BSON serialize options from the already-resolved options
        this.bsonOptions = resolveBSONOptions(options);
        this[kSession] = options.session != null ? options.session : undefined;
        this.options = options;
        this.bypassPinningCheck = !!options.bypassPinningCheck;
        this.trySecondaryWrite = false;
    }
    hasAspect(aspect) {
        const ctor = this.constructor;
        if (ctor.aspects == null) {
            return false;
        }
        return ctor.aspects.has(aspect);
    }
    get session() {
        return this[kSession];
    }
    get canRetryRead() {
        return true;
    }
    get canRetryWrite() {
        return true;
    }
}
export function defineAspects(operation, aspects) {
    if (!Array.isArray(aspects) && !(aspects instanceof Set)) {
        aspects = [aspects];
    }
    aspects = new Set(aspects);
    Object.defineProperty(operation, 'aspects', {
        value: aspects,
        writable: false
    });
    return aspects;
}
//# sourceMappingURL=operation.js.map