import * as zlib from 'zlib';
import { LEGACY_HELLO_COMMAND } from '../../constants';
import { PKG_VERSION, Snappy, ZStandard } from '../../deps';
import { MongoDecompressionError, MongoInvalidArgumentError } from '../../error';
/** @public */
export const Compressor = Object.freeze({
    none: 0,
    snappy: 1,
    zlib: 2,
    zstd: 3
});
export const uncompressibleCommands = new Set([
    LEGACY_HELLO_COMMAND,
    'saslStart',
    'saslContinue',
    'getnonce',
    'authenticate',
    'createUser',
    'updateUser',
    'copydbSaslStart',
    'copydbgetnonce',
    'copydb'
]);
const MAX_COMPRESSOR_ID = 3;
const ZSTD_COMPRESSION_LEVEL = 3;
// Facilitate compressing a message using an agreed compressor
export function compress(self, dataToBeCompressed, callback) {
    const zlibOptions = {};
    switch (self.options.agreedCompressor) {
        case 'snappy': {
            if ('kModuleError' in Snappy) {
                return callback(Snappy['kModuleError']);
            }
            if (Snappy[PKG_VERSION].major <= 6) {
                Snappy.compress(dataToBeCompressed, callback);
            }
            else {
                Snappy.compress(dataToBeCompressed)
                    .then(buffer => callback(undefined, buffer))
                    .catch(error => callback(error));
            }
            break;
        }
        case 'zlib':
            // Determine zlibCompressionLevel
            if (self.options.zlibCompressionLevel) {
                zlibOptions.level = self.options.zlibCompressionLevel;
            }
            zlib.deflate(dataToBeCompressed, zlibOptions, callback);
            break;
        case 'zstd':
            if ('kModuleError' in ZStandard) {
                return callback(ZStandard['kModuleError']);
            }
            ZStandard.compress(dataToBeCompressed, ZSTD_COMPRESSION_LEVEL).then(buffer => callback(undefined, buffer), error => callback(error));
            break;
        default:
            throw new MongoInvalidArgumentError(`Unknown compressor ${self.options.agreedCompressor} failed to compress`);
    }
}
// Decompress a message using the given compressor
export function decompress(compressorID, compressedData, callback) {
    if (compressorID < 0 || compressorID > MAX_COMPRESSOR_ID) {
        throw new MongoDecompressionError(`Server sent message compressed using an unsupported compressor. (Received compressor ID ${compressorID})`);
    }
    switch (compressorID) {
        case Compressor.snappy: {
            if ('kModuleError' in Snappy) {
                return callback(Snappy['kModuleError']);
            }
            if (Snappy[PKG_VERSION].major <= 6) {
                Snappy.uncompress(compressedData, { asBuffer: true }, callback);
            }
            else {
                Snappy.uncompress(compressedData, { asBuffer: true })
                    .then(buffer => callback(undefined, buffer))
                    .catch(error => callback(error));
            }
            break;
        }
        case Compressor.zstd: {
            if ('kModuleError' in ZStandard) {
                return callback(ZStandard['kModuleError']);
            }
            ZStandard.decompress(compressedData).then(buffer => callback(undefined, buffer), error => callback(error));
            break;
        }
        case Compressor.zlib:
            zlib.inflate(compressedData, callback);
            break;
        default:
            callback(undefined, compressedData);
    }
}
//# sourceMappingURL=compression.js.map