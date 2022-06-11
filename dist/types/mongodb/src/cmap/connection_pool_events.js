/**
 * The base export class for all monitoring events published from the connection pool
 * @public
 * @category Event
 */
export class ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool) {
        this.time = new Date();
        this.address = pool.address;
    }
}
/**
 * An event published when a connection pool is created
 * @public
 * @category Event
 */
export class ConnectionPoolCreatedEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool) {
        super(pool);
        this.options = pool.options;
    }
}
/**
 * An event published when a connection pool is closed
 * @public
 * @category Event
 */
export class ConnectionPoolClosedEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool) {
        super(pool);
    }
}
/**
 * An event published when a connection pool creates a new connection
 * @public
 * @category Event
 */
export class ConnectionCreatedEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool, connection) {
        super(pool);
        this.connectionId = connection.id;
    }
}
/**
 * An event published when a connection is ready for use
 * @public
 * @category Event
 */
export class ConnectionReadyEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool, connection) {
        super(pool);
        this.connectionId = connection.id;
    }
}
/**
 * An event published when a connection is closed
 * @public
 * @category Event
 */
export class ConnectionClosedEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool, connection, reason) {
        super(pool);
        this.connectionId = connection.id;
        this.reason = reason || 'unknown';
        this.serviceId = connection.serviceId;
    }
}
/**
 * An event published when a request to check a connection out begins
 * @public
 * @category Event
 */
export class ConnectionCheckOutStartedEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool) {
        super(pool);
    }
}
/**
 * An event published when a request to check a connection out fails
 * @public
 * @category Event
 */
export class ConnectionCheckOutFailedEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool, reason) {
        super(pool);
        this.reason = reason;
    }
}
/**
 * An event published when a connection is checked out of the connection pool
 * @public
 * @category Event
 */
export class ConnectionCheckedOutEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool, connection) {
        super(pool);
        this.connectionId = connection.id;
    }
}
/**
 * An event published when a connection is checked into the connection pool
 * @public
 * @category Event
 */
export class ConnectionCheckedInEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool, connection) {
        super(pool);
        this.connectionId = connection.id;
    }
}
/**
 * An event published when a connection pool is cleared
 * @public
 * @category Event
 */
export class ConnectionPoolClearedEvent extends ConnectionPoolMonitoringEvent {
    /** @internal */
    constructor(pool, serviceId) {
        super(pool);
        this.serviceId = serviceId;
    }
}
//# sourceMappingURL=connection_pool_events.js.map