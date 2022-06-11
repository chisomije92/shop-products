import { MongoInvalidArgumentError } from '../../error';
import { ReadPreference } from '../../read_preference';
import { ServerType } from '../../sdam/common';
import { TopologyDescription } from '../../sdam/topology_description';
export function getReadPreference(cmd, options) {
    // Default to command version of the readPreference
    let readPreference = cmd.readPreference || ReadPreference.primary;
    // If we have an option readPreference override the command one
    if (options === null || options === void 0 ? void 0 : options.readPreference) {
        readPreference = options.readPreference;
    }
    if (typeof readPreference === 'string') {
        readPreference = ReadPreference.fromString(readPreference);
    }
    if (!(readPreference instanceof ReadPreference)) {
        throw new MongoInvalidArgumentError('Option "readPreference" must be a ReadPreference instance');
    }
    return readPreference;
}
export function applyCommonQueryOptions(queryOptions, options) {
    Object.assign(queryOptions, {
        raw: typeof options.raw === 'boolean' ? options.raw : false,
        promoteLongs: typeof options.promoteLongs === 'boolean' ? options.promoteLongs : true,
        promoteValues: typeof options.promoteValues === 'boolean' ? options.promoteValues : true,
        promoteBuffers: typeof options.promoteBuffers === 'boolean' ? options.promoteBuffers : false,
        bsonRegExp: typeof options.bsonRegExp === 'boolean' ? options.bsonRegExp : false,
        enableUtf8Validation: typeof options.enableUtf8Validation === 'boolean' ? options.enableUtf8Validation : true
    });
    if (options.session) {
        queryOptions.session = options.session;
    }
    return queryOptions;
}
export function isSharded(topologyOrServer) {
    if (topologyOrServer == null) {
        return false;
    }
    if (topologyOrServer.description && topologyOrServer.description.type === ServerType.Mongos) {
        return true;
    }
    // NOTE: This is incredibly inefficient, and should be removed once command construction
    //       happens based on `Server` not `Topology`.
    if (topologyOrServer.description && topologyOrServer.description instanceof TopologyDescription) {
        const servers = Array.from(topologyOrServer.description.servers.values());
        return servers.some((server) => server.type === ServerType.Mongos);
    }
    return false;
}
//# sourceMappingURL=shared.js.map