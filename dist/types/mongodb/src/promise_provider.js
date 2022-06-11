import { MongoInvalidArgumentError } from './error';
/** @internal */
const kPromise = Symbol('promise');
const store = {
    [kPromise]: undefined
};
/**
 * Global promise store allowing user-provided promises
 * @public
 */
export class PromiseProvider {
    /** Validates the passed in promise library */
    static validate(lib) {
        if (typeof lib !== 'function')
            throw new MongoInvalidArgumentError(`Promise must be a function, got ${lib}`);
        return !!lib;
    }
    /** Sets the promise library */
    static set(lib) {
        if (!PromiseProvider.validate(lib)) {
            // validate
            return;
        }
        store[kPromise] = lib;
    }
    /** Get the stored promise library, or resolves passed in */
    static get() {
        return store[kPromise];
    }
}
PromiseProvider.set(global.Promise);
//# sourceMappingURL=promise_provider.js.map