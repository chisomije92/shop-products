// shared state names
export const STATE_CLOSING = 'closing';
export const STATE_CLOSED = 'closed';
export const STATE_CONNECTING = 'connecting';
export const STATE_CONNECTED = 'connected';
/**
 * An enumeration of topology types we know about
 * @public
 */
export const TopologyType = Object.freeze({
    Single: 'Single',
    ReplicaSetNoPrimary: 'ReplicaSetNoPrimary',
    ReplicaSetWithPrimary: 'ReplicaSetWithPrimary',
    Sharded: 'Sharded',
    Unknown: 'Unknown',
    LoadBalanced: 'LoadBalanced'
});
/**
 * An enumeration of server types we know about
 * @public
 */
export const ServerType = Object.freeze({
    Standalone: 'Standalone',
    Mongos: 'Mongos',
    PossiblePrimary: 'PossiblePrimary',
    RSPrimary: 'RSPrimary',
    RSSecondary: 'RSSecondary',
    RSArbiter: 'RSArbiter',
    RSOther: 'RSOther',
    RSGhost: 'RSGhost',
    Unknown: 'Unknown',
    LoadBalancer: 'LoadBalancer'
});
/** @internal */
export function drainTimerQueue(queue) {
    queue.forEach(clearTimeout);
    queue.clear();
}
/** Shared function to determine clusterTime for a given topology or session */
export function _advanceClusterTime(entity, $clusterTime) {
    if (entity.clusterTime == null) {
        entity.clusterTime = $clusterTime;
    }
    else {
        if ($clusterTime.clusterTime.greaterThan(entity.clusterTime.clusterTime)) {
            entity.clusterTime = $clusterTime;
        }
    }
}
//# sourceMappingURL=common.js.map