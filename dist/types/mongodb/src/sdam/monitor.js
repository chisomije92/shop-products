import { setTimeout } from 'timers';
import { Long } from '../bson';
import { connect } from '../cmap/connect';
import { Connection } from '../cmap/connection';
import { LEGACY_HELLO_COMMAND } from '../constants';
import { MongoNetworkError } from '../error';
import { CancellationToken, TypedEventEmitter } from '../mongo_types';
import { calculateDurationInMs, makeInterruptibleAsyncInterval, makeStateMachine, now, ns } from '../utils';
import { ServerType, STATE_CLOSED, STATE_CLOSING } from './common';
import { ServerHeartbeatFailedEvent, ServerHeartbeatStartedEvent, ServerHeartbeatSucceededEvent } from './events';
import { Server } from './server';
/** @internal */
const kServer = Symbol('server');
/** @internal */
const kMonitorId = Symbol('monitorId');
/** @internal */
const kConnection = Symbol('connection');
/** @internal */
const kCancellationToken = Symbol('cancellationToken');
/** @internal */
const kRTTPinger = Symbol('rttPinger');
/** @internal */
const kRoundTripTime = Symbol('roundTripTime');
const STATE_IDLE = 'idle';
const STATE_MONITORING = 'monitoring';
const stateTransition = makeStateMachine({
    [STATE_CLOSING]: [STATE_CLOSING, STATE_IDLE, STATE_CLOSED],
    [STATE_CLOSED]: [STATE_CLOSED, STATE_MONITORING],
    [STATE_IDLE]: [STATE_IDLE, STATE_MONITORING, STATE_CLOSING],
    [STATE_MONITORING]: [STATE_MONITORING, STATE_IDLE, STATE_CLOSING]
});
const INVALID_REQUEST_CHECK_STATES = new Set([STATE_CLOSING, STATE_CLOSED, STATE_MONITORING]);
function isInCloseState(monitor) {
    return monitor.s.state === STATE_CLOSED || monitor.s.state === STATE_CLOSING;
}
/** @internal */
export class Monitor extends TypedEventEmitter {
    constructor(server, options) {
        var _a, _b, _c;
        super();
        this[kServer] = server;
        this[kConnection] = undefined;
        this[kCancellationToken] = new CancellationToken();
        this[kCancellationToken].setMaxListeners(Infinity);
        this[kMonitorId] = undefined;
        this.s = {
            state: STATE_CLOSED
        };
        this.address = server.description.address;
        this.options = Object.freeze({
            connectTimeoutMS: (_a = options.connectTimeoutMS) !== null && _a !== void 0 ? _a : 10000,
            heartbeatFrequencyMS: (_b = options.heartbeatFrequencyMS) !== null && _b !== void 0 ? _b : 10000,
            minHeartbeatFrequencyMS: (_c = options.minHeartbeatFrequencyMS) !== null && _c !== void 0 ? _c : 500
        });
        const cancellationToken = this[kCancellationToken];
        // TODO: refactor this to pull it directly from the pool, requires new ConnectionPool integration
        const connectOptions = Object.assign({
            id: '<monitor>',
            generation: server.s.pool.generation,
            connectionType: Connection,
            cancellationToken,
            hostAddress: server.description.hostAddress
        }, options, 
        // force BSON serialization options
        {
            raw: false,
            promoteLongs: true,
            promoteValues: true,
            promoteBuffers: true
        });
        // ensure no authentication is used for monitoring
        delete connectOptions.credentials;
        if (connectOptions.autoEncrypter) {
            delete connectOptions.autoEncrypter;
        }
        this.connectOptions = Object.freeze(connectOptions);
    }
    get connection() {
        return this[kConnection];
    }
    connect() {
        if (this.s.state !== STATE_CLOSED) {
            return;
        }
        // start
        const heartbeatFrequencyMS = this.options.heartbeatFrequencyMS;
        const minHeartbeatFrequencyMS = this.options.minHeartbeatFrequencyMS;
        this[kMonitorId] = makeInterruptibleAsyncInterval(monitorServer(this), {
            interval: heartbeatFrequencyMS,
            minInterval: minHeartbeatFrequencyMS,
            immediate: true
        });
    }
    requestCheck() {
        var _a;
        if (INVALID_REQUEST_CHECK_STATES.has(this.s.state)) {
            return;
        }
        (_a = this[kMonitorId]) === null || _a === void 0 ? void 0 : _a.wake();
    }
    reset() {
        const topologyVersion = this[kServer].description.topologyVersion;
        if (isInCloseState(this) || topologyVersion == null) {
            return;
        }
        stateTransition(this, STATE_CLOSING);
        resetMonitorState(this);
        // restart monitor
        stateTransition(this, STATE_IDLE);
        // restart monitoring
        const heartbeatFrequencyMS = this.options.heartbeatFrequencyMS;
        const minHeartbeatFrequencyMS = this.options.minHeartbeatFrequencyMS;
        this[kMonitorId] = makeInterruptibleAsyncInterval(monitorServer(this), {
            interval: heartbeatFrequencyMS,
            minInterval: minHeartbeatFrequencyMS
        });
    }
    close() {
        if (isInCloseState(this)) {
            return;
        }
        stateTransition(this, STATE_CLOSING);
        resetMonitorState(this);
        // close monitor
        this.emit('close');
        stateTransition(this, STATE_CLOSED);
    }
}
function resetMonitorState(monitor) {
    var _a, _b, _c;
    (_a = monitor[kMonitorId]) === null || _a === void 0 ? void 0 : _a.stop();
    monitor[kMonitorId] = undefined;
    (_b = monitor[kRTTPinger]) === null || _b === void 0 ? void 0 : _b.close();
    monitor[kRTTPinger] = undefined;
    monitor[kCancellationToken].emit('cancel');
    (_c = monitor[kConnection]) === null || _c === void 0 ? void 0 : _c.destroy({ force: true });
    monitor[kConnection] = undefined;
}
function checkServer(monitor, callback) {
    let start = now();
    monitor.emit(Server.SERVER_HEARTBEAT_STARTED, new ServerHeartbeatStartedEvent(monitor.address));
    function failureHandler(err) {
        var _a;
        (_a = monitor[kConnection]) === null || _a === void 0 ? void 0 : _a.destroy({ force: true });
        monitor[kConnection] = undefined;
        monitor.emit(Server.SERVER_HEARTBEAT_FAILED, new ServerHeartbeatFailedEvent(monitor.address, calculateDurationInMs(start), err));
        monitor.emit('resetServer', err);
        monitor.emit('resetConnectionPool');
        callback(err);
    }
    const connection = monitor[kConnection];
    if (connection && !connection.closed) {
        const { serverApi, helloOk } = connection;
        const connectTimeoutMS = monitor.options.connectTimeoutMS;
        const maxAwaitTimeMS = monitor.options.heartbeatFrequencyMS;
        const topologyVersion = monitor[kServer].description.topologyVersion;
        const isAwaitable = topologyVersion != null;
        const cmd = Object.assign({ [(serverApi === null || serverApi === void 0 ? void 0 : serverApi.version) || helloOk ? 'hello' : LEGACY_HELLO_COMMAND]: true }, (isAwaitable && topologyVersion
            ? { maxAwaitTimeMS, topologyVersion: makeTopologyVersion(topologyVersion) }
            : {}));
        const options = isAwaitable
            ? {
                socketTimeoutMS: connectTimeoutMS ? connectTimeoutMS + maxAwaitTimeMS : 0,
                exhaustAllowed: true
            }
            : { socketTimeoutMS: connectTimeoutMS };
        if (isAwaitable && monitor[kRTTPinger] == null) {
            monitor[kRTTPinger] = new RTTPinger(monitor[kCancellationToken], Object.assign({ heartbeatFrequencyMS: monitor.options.heartbeatFrequencyMS }, monitor.connectOptions));
        }
        connection.command(ns('admin.$cmd'), cmd, options, (err, hello) => {
            var _a;
            if (err) {
                return failureHandler(err);
            }
            if (!('isWritablePrimary' in hello)) {
                // Provide hello-style response document.
                hello.isWritablePrimary = hello[LEGACY_HELLO_COMMAND];
            }
            const rttPinger = monitor[kRTTPinger];
            const duration = isAwaitable && rttPinger ? rttPinger.roundTripTime : calculateDurationInMs(start);
            monitor.emit(Server.SERVER_HEARTBEAT_SUCCEEDED, new ServerHeartbeatSucceededEvent(monitor.address, duration, hello));
            // if we are using the streaming protocol then we immediately issue another `started`
            // event, otherwise the "check" is complete and return to the main monitor loop
            if (isAwaitable && hello.topologyVersion) {
                monitor.emit(Server.SERVER_HEARTBEAT_STARTED, new ServerHeartbeatStartedEvent(monitor.address));
                start = now();
            }
            else {
                (_a = monitor[kRTTPinger]) === null || _a === void 0 ? void 0 : _a.close();
                monitor[kRTTPinger] = undefined;
                callback(undefined, hello);
            }
        });
        return;
    }
    // connecting does an implicit `hello`
    connect(monitor.connectOptions, (err, conn) => {
        if (err) {
            monitor[kConnection] = undefined;
            // we already reset the connection pool on network errors in all cases
            if (!(err instanceof MongoNetworkError)) {
                monitor.emit('resetConnectionPool');
            }
            failureHandler(err);
            return;
        }
        if (conn) {
            // Tell the connection that we are using the streaming protocol so that the
            // connection's message stream will only read the last hello on the buffer.
            conn.isMonitoringConnection = true;
            if (isInCloseState(monitor)) {
                conn.destroy({ force: true });
                return;
            }
            monitor[kConnection] = conn;
            monitor.emit(Server.SERVER_HEARTBEAT_SUCCEEDED, new ServerHeartbeatSucceededEvent(monitor.address, calculateDurationInMs(start), conn.hello));
            callback(undefined, conn.hello);
        }
    });
}
function monitorServer(monitor) {
    return (callback) => {
        stateTransition(monitor, STATE_MONITORING);
        function done() {
            if (!isInCloseState(monitor)) {
                stateTransition(monitor, STATE_IDLE);
            }
            callback();
        }
        checkServer(monitor, (err, hello) => {
            if (err) {
                // otherwise an error occurred on initial discovery, also bail
                if (monitor[kServer].description.type === ServerType.Unknown) {
                    monitor.emit('resetServer', err);
                    return done();
                }
            }
            // if the check indicates streaming is supported, immediately reschedule monitoring
            if (hello && hello.topologyVersion) {
                setTimeout(() => {
                    var _a;
                    if (!isInCloseState(monitor)) {
                        (_a = monitor[kMonitorId]) === null || _a === void 0 ? void 0 : _a.wake();
                    }
                }, 0);
            }
            done();
        });
    };
}
function makeTopologyVersion(tv) {
    return {
        processId: tv.processId,
        // tests mock counter as just number, but in a real situation counter should always be a Long
        counter: Long.isLong(tv.counter) ? tv.counter : Long.fromNumber(tv.counter)
    };
}
/** @internal */
export class RTTPinger {
    constructor(cancellationToken, options) {
        this[kConnection] = undefined;
        this[kCancellationToken] = cancellationToken;
        this[kRoundTripTime] = 0;
        this.closed = false;
        const heartbeatFrequencyMS = options.heartbeatFrequencyMS;
        this[kMonitorId] = setTimeout(() => measureRoundTripTime(this, options), heartbeatFrequencyMS);
    }
    get roundTripTime() {
        return this[kRoundTripTime];
    }
    close() {
        var _a;
        this.closed = true;
        clearTimeout(this[kMonitorId]);
        (_a = this[kConnection]) === null || _a === void 0 ? void 0 : _a.destroy({ force: true });
        this[kConnection] = undefined;
    }
}
function measureRoundTripTime(rttPinger, options) {
    const start = now();
    options.cancellationToken = rttPinger[kCancellationToken];
    const heartbeatFrequencyMS = options.heartbeatFrequencyMS;
    if (rttPinger.closed) {
        return;
    }
    function measureAndReschedule(conn) {
        if (rttPinger.closed) {
            conn === null || conn === void 0 ? void 0 : conn.destroy({ force: true });
            return;
        }
        if (rttPinger[kConnection] == null) {
            rttPinger[kConnection] = conn;
        }
        rttPinger[kRoundTripTime] = calculateDurationInMs(start);
        rttPinger[kMonitorId] = setTimeout(() => measureRoundTripTime(rttPinger, options), heartbeatFrequencyMS);
    }
    const connection = rttPinger[kConnection];
    if (connection == null) {
        connect(options, (err, conn) => {
            if (err) {
                rttPinger[kConnection] = undefined;
                rttPinger[kRoundTripTime] = 0;
                return;
            }
            measureAndReschedule(conn);
        });
        return;
    }
    connection.command(ns('admin.$cmd'), { [LEGACY_HELLO_COMMAND]: 1 }, undefined, err => {
        if (err) {
            rttPinger[kConnection] = undefined;
            rttPinger[kRoundTripTime] = 0;
            return;
        }
        measureAndReschedule();
    });
}
//# sourceMappingURL=monitor.js.map