export const SYSTEM_NAMESPACE_COLLECTION = 'system.namespaces';
export const SYSTEM_INDEX_COLLECTION = 'system.indexes';
export const SYSTEM_PROFILE_COLLECTION = 'system.profile';
export const SYSTEM_USER_COLLECTION = 'system.users';
export const SYSTEM_COMMAND_COLLECTION = '$cmd';
export const SYSTEM_JS_COLLECTION = 'system.js';
// events
export const ERROR = 'error';
export const TIMEOUT = 'timeout';
export const CLOSE = 'close';
export const OPEN = 'open';
export const CONNECT = 'connect';
export const CLOSED = 'closed';
export const ENDED = 'ended';
export const MESSAGE = 'message';
export const PINNED = 'pinned';
export const UNPINNED = 'unpinned';
export const DESCRIPTION_RECEIVED = 'descriptionReceived';
export const SERVER_OPENING = 'serverOpening';
export const SERVER_CLOSED = 'serverClosed';
export const SERVER_DESCRIPTION_CHANGED = 'serverDescriptionChanged';
export const TOPOLOGY_OPENING = 'topologyOpening';
export const TOPOLOGY_CLOSED = 'topologyClosed';
export const TOPOLOGY_DESCRIPTION_CHANGED = 'topologyDescriptionChanged';
export const CONNECTION_POOL_CREATED = 'connectionPoolCreated';
export const CONNECTION_POOL_CLOSED = 'connectionPoolClosed';
export const CONNECTION_POOL_CLEARED = 'connectionPoolCleared';
export const CONNECTION_CREATED = 'connectionCreated';
export const CONNECTION_READY = 'connectionReady';
export const CONNECTION_CLOSED = 'connectionClosed';
export const CONNECTION_CHECK_OUT_STARTED = 'connectionCheckOutStarted';
export const CONNECTION_CHECK_OUT_FAILED = 'connectionCheckOutFailed';
export const CONNECTION_CHECKED_OUT = 'connectionCheckedOut';
export const CONNECTION_CHECKED_IN = 'connectionCheckedIn';
export const CLUSTER_TIME_RECEIVED = 'clusterTimeReceived';
export const COMMAND_STARTED = 'commandStarted';
export const COMMAND_SUCCEEDED = 'commandSucceeded';
export const COMMAND_FAILED = 'commandFailed';
export const SERVER_HEARTBEAT_STARTED = 'serverHeartbeatStarted';
export const SERVER_HEARTBEAT_SUCCEEDED = 'serverHeartbeatSucceeded';
export const SERVER_HEARTBEAT_FAILED = 'serverHeartbeatFailed';
export const RESPONSE = 'response';
export const MORE = 'more';
export const INIT = 'init';
export const CHANGE = 'change';
export const END = 'end';
export const RESUME_TOKEN_CHANGED = 'resumeTokenChanged';
/** @public */
export const HEARTBEAT_EVENTS = Object.freeze([
    SERVER_HEARTBEAT_STARTED,
    SERVER_HEARTBEAT_SUCCEEDED,
    SERVER_HEARTBEAT_FAILED
]);
/** @public */
export const CMAP_EVENTS = Object.freeze([
    CONNECTION_POOL_CREATED,
    CONNECTION_POOL_CLOSED,
    CONNECTION_CREATED,
    CONNECTION_READY,
    CONNECTION_CLOSED,
    CONNECTION_CHECK_OUT_STARTED,
    CONNECTION_CHECK_OUT_FAILED,
    CONNECTION_CHECKED_OUT,
    CONNECTION_CHECKED_IN,
    CONNECTION_POOL_CLEARED
]);
/** @public */
export const TOPOLOGY_EVENTS = Object.freeze([
    SERVER_OPENING,
    SERVER_CLOSED,
    SERVER_DESCRIPTION_CHANGED,
    TOPOLOGY_OPENING,
    TOPOLOGY_CLOSED,
    TOPOLOGY_DESCRIPTION_CHANGED,
    ERROR,
    TIMEOUT,
    CLOSE
]);
/** @public */
export const APM_EVENTS = Object.freeze([
    COMMAND_STARTED,
    COMMAND_SUCCEEDED,
    COMMAND_FAILED
]);
/**
 * All events that we relay to the `Topology`
 * @internal
 */
export const SERVER_RELAY_EVENTS = Object.freeze([
    SERVER_HEARTBEAT_STARTED,
    SERVER_HEARTBEAT_SUCCEEDED,
    SERVER_HEARTBEAT_FAILED,
    COMMAND_STARTED,
    COMMAND_SUCCEEDED,
    COMMAND_FAILED,
    ...CMAP_EVENTS
]);
/**
 * All events we listen to from `Server` instances, but do not forward to the client
 * @internal
 */
export const LOCAL_SERVER_EVENTS = Object.freeze([
    CONNECT,
    DESCRIPTION_RECEIVED,
    CLOSED,
    ENDED
]);
/** @public */
export const MONGO_CLIENT_EVENTS = Object.freeze([
    ...CMAP_EVENTS,
    ...APM_EVENTS,
    ...TOPOLOGY_EVENTS,
    ...HEARTBEAT_EVENTS
]);
/**
 * @internal
 * The legacy hello command that was deprecated in MongoDB 5.0.
 */
export const LEGACY_HELLO_COMMAND = 'ismaster';
/**
 * @internal
 * The legacy hello command that was deprecated in MongoDB 5.0.
 */
export const LEGACY_HELLO_COMMAND_CAMEL_CASE = 'isMaster';
//# sourceMappingURL=constants.js.map