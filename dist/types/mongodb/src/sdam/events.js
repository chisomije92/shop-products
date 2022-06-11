/**
 * Emitted when server description changes, but does NOT include changes to the RTT.
 * @public
 * @category Event
 */
export class ServerDescriptionChangedEvent {
    /** @internal */
    constructor(topologyId, address, previousDescription, newDescription) {
        this.topologyId = topologyId;
        this.address = address;
        this.previousDescription = previousDescription;
        this.newDescription = newDescription;
    }
}
/**
 * Emitted when server is initialized.
 * @public
 * @category Event
 */
export class ServerOpeningEvent {
    /** @internal */
    constructor(topologyId, address) {
        this.topologyId = topologyId;
        this.address = address;
    }
}
/**
 * Emitted when server is closed.
 * @public
 * @category Event
 */
export class ServerClosedEvent {
    /** @internal */
    constructor(topologyId, address) {
        this.topologyId = topologyId;
        this.address = address;
    }
}
/**
 * Emitted when topology description changes.
 * @public
 * @category Event
 */
export class TopologyDescriptionChangedEvent {
    /** @internal */
    constructor(topologyId, previousDescription, newDescription) {
        this.topologyId = topologyId;
        this.previousDescription = previousDescription;
        this.newDescription = newDescription;
    }
}
/**
 * Emitted when topology is initialized.
 * @public
 * @category Event
 */
export class TopologyOpeningEvent {
    /** @internal */
    constructor(topologyId) {
        this.topologyId = topologyId;
    }
}
/**
 * Emitted when topology is closed.
 * @public
 * @category Event
 */
export class TopologyClosedEvent {
    /** @internal */
    constructor(topologyId) {
        this.topologyId = topologyId;
    }
}
/**
 * Emitted when the server monitor’s hello command is started - immediately before
 * the hello command is serialized into raw BSON and written to the socket.
 *
 * @public
 * @category Event
 */
export class ServerHeartbeatStartedEvent {
    /** @internal */
    constructor(connectionId) {
        this.connectionId = connectionId;
    }
}
/**
 * Emitted when the server monitor’s hello succeeds.
 * @public
 * @category Event
 */
export class ServerHeartbeatSucceededEvent {
    /** @internal */
    constructor(connectionId, duration, reply) {
        this.connectionId = connectionId;
        this.duration = duration;
        this.reply = reply !== null && reply !== void 0 ? reply : {};
    }
}
/**
 * Emitted when the server monitor’s hello fails, either with an “ok: 0” or a socket exception.
 * @public
 * @category Event
 */
export class ServerHeartbeatFailedEvent {
    /** @internal */
    constructor(connectionId, duration, failure) {
        this.connectionId = connectionId;
        this.duration = duration;
        this.failure = failure;
    }
}
//# sourceMappingURL=events.js.map