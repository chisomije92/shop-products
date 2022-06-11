import { MongoMissingDependencyError } from './error';
import { parsePackageVersion } from './utils';
export const PKG_VERSION = Symbol('kPkgVersion');
function makeErrorModule(error) {
    const props = error ? { kModuleError: error } : {};
    return new Proxy(props, {
        get: (_, key) => {
            if (key === 'kModuleError') {
                return error;
            }
            throw error;
        },
        set: () => {
            throw error;
        }
    });
}
export let Kerberos = makeErrorModule(new MongoMissingDependencyError('Optional module `kerberos` not found. Please install it to enable kerberos authentication'));
try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    Kerberos = require('kerberos');
}
catch (_a) { } // eslint-disable-line
export let ZStandard = makeErrorModule(new MongoMissingDependencyError('Optional module `@mongodb-js/zstd` not found. Please install it to enable zstd compression'));
try {
    ZStandard = require('@mongodb-js/zstd');
}
catch (_b) { } // eslint-disable-line
export let Snappy = makeErrorModule(new MongoMissingDependencyError('Optional module `snappy` not found. Please install it to enable snappy compression'));
try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    Snappy = require('snappy');
    try {
        Snappy[PKG_VERSION] = parsePackageVersion(require('snappy/package.json'));
    }
    catch (_c) { } // eslint-disable-line
}
catch (_d) { } // eslint-disable-line
export let saslprep = makeErrorModule(new MongoMissingDependencyError('Optional module `saslprep` not found.' +
    ' Please install it to enable Stringprep Profile for User Names and Passwords'));
try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    saslprep = require('saslprep');
}
catch (_e) { } // eslint-disable-line
export let aws4 = makeErrorModule(new MongoMissingDependencyError('Optional module `aws4` not found. Please install it to enable AWS authentication'));
try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    aws4 = require('aws4');
}
catch (_f) { } // eslint-disable-line
/** @public */
export const AutoEncryptionLoggerLevel = Object.freeze({
    FatalError: 0,
    Error: 1,
    Warning: 2,
    Info: 3,
    Trace: 4
});
//# sourceMappingURL=deps.js.map