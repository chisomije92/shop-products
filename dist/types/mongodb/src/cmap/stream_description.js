import { ServerType } from '../sdam/common';
import { parseServerType } from '../sdam/server_description';
const RESPONSE_FIELDS = [
    'minWireVersion',
    'maxWireVersion',
    'maxBsonObjectSize',
    'maxMessageSizeBytes',
    'maxWriteBatchSize',
    'logicalSessionTimeoutMinutes'
];
/** @public */
export class StreamDescription {
    constructor(address, options) {
        this.address = address;
        this.type = ServerType.Unknown;
        this.minWireVersion = undefined;
        this.maxWireVersion = undefined;
        this.maxBsonObjectSize = 16777216;
        this.maxMessageSizeBytes = 48000000;
        this.maxWriteBatchSize = 100000;
        this.logicalSessionTimeoutMinutes = options === null || options === void 0 ? void 0 : options.logicalSessionTimeoutMinutes;
        this.loadBalanced = !!(options === null || options === void 0 ? void 0 : options.loadBalanced);
        this.compressors =
            options && options.compressors && Array.isArray(options.compressors)
                ? options.compressors
                : [];
    }
    receiveResponse(response) {
        if (response == null) {
            return;
        }
        this.type = parseServerType(response);
        for (const field of RESPONSE_FIELDS) {
            if (response[field] != null) {
                this[field] = response[field];
            }
            // testing case
            if ('__nodejs_mock_server__' in response) {
                this.__nodejs_mock_server__ = response['__nodejs_mock_server__'];
            }
        }
        if (response.compression) {
            this.compressor = this.compressors.filter(c => { var _a; return (_a = response.compression) === null || _a === void 0 ? void 0 : _a.includes(c); })[0];
        }
    }
}
//# sourceMappingURL=stream_description.js.map