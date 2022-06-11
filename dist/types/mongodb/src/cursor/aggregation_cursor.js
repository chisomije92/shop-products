import { AggregateOperation } from '../operations/aggregate';
import { executeOperation } from '../operations/execute_operation';
import { mergeOptions } from '../utils';
import { AbstractCursor, assertUninitialized } from './abstract_cursor';
/** @internal */
const kPipeline = Symbol('pipeline');
/** @internal */
const kOptions = Symbol('options');
/**
 * The **AggregationCursor** class is an internal class that embodies an aggregation cursor on MongoDB
 * allowing for iteration over the results returned from the underlying query. It supports
 * one by one document iteration, conversion to an array or can be iterated as a Node 4.X
 * or higher stream
 * @public
 */
export class AggregationCursor extends AbstractCursor {
    /** @internal */
    constructor(client, namespace, pipeline = [], options = {}) {
        super(client, namespace, options);
        this[kPipeline] = pipeline;
        this[kOptions] = options;
    }
    get pipeline() {
        return this[kPipeline];
    }
    clone() {
        const clonedOptions = mergeOptions({}, this[kOptions]);
        delete clonedOptions.session;
        return new AggregationCursor(this.client, this.namespace, this[kPipeline], Object.assign({}, clonedOptions));
    }
    map(transform) {
        return super.map(transform);
    }
    /** @internal */
    _initialize(session, callback) {
        const aggregateOperation = new AggregateOperation(this.namespace, this[kPipeline], Object.assign(Object.assign(Object.assign({}, this[kOptions]), this.cursorOptions), { session }));
        executeOperation(this.client, aggregateOperation, (err, response) => {
            if (err || response == null)
                return callback(err);
            // TODO: NODE-2882
            callback(undefined, { server: aggregateOperation.server, session, response });
        });
    }
    explain(verbosity, callback) {
        if (typeof verbosity === 'function')
            (callback = verbosity), (verbosity = true);
        if (verbosity == null)
            verbosity = true;
        return executeOperation(this.client, new AggregateOperation(this.namespace, this[kPipeline], Object.assign(Object.assign(Object.assign({}, this[kOptions]), this.cursorOptions), { explain: verbosity })), callback);
    }
    group($group) {
        assertUninitialized(this);
        this[kPipeline].push({ $group });
        return this;
    }
    /** Add a limit stage to the aggregation pipeline */
    limit($limit) {
        assertUninitialized(this);
        this[kPipeline].push({ $limit });
        return this;
    }
    /** Add a match stage to the aggregation pipeline */
    match($match) {
        assertUninitialized(this);
        this[kPipeline].push({ $match });
        return this;
    }
    /** Add an out stage to the aggregation pipeline */
    out($out) {
        assertUninitialized(this);
        this[kPipeline].push({ $out });
        return this;
    }
    /**
     * Add a project stage to the aggregation pipeline
     *
     * @remarks
     * In order to strictly type this function you must provide an interface
     * that represents the effect of your projection on the result documents.
     *
     * By default chaining a projection to your cursor changes the returned type to the generic {@link Document} type.
     * You should specify a parameterized type to have assertions on your final results.
     *
     * @example
     * ```typescript
     * // Best way
     * const docs: AggregationCursor<{ a: number }> = cursor.project<{ a: number }>({ _id: 0, a: true });
     * // Flexible way
     * const docs: AggregationCursor<Document> = cursor.project({ _id: 0, a: true });
     * ```
     *
     * @remarks
     * In order to strictly type this function you must provide an interface
     * that represents the effect of your projection on the result documents.
     *
     * **Note for Typescript Users:** adding a transform changes the return type of the iteration of this cursor,
     * it **does not** return a new instance of a cursor. This means when calling project,
     * you should always assign the result to a new variable in order to get a correctly typed cursor variable.
     * Take note of the following example:
     *
     * @example
     * ```typescript
     * const cursor: AggregationCursor<{ a: number; b: string }> = coll.aggregate([]);
     * const projectCursor = cursor.project<{ a: number }>({ _id: 0, a: true });
     * const aPropOnlyArray: {a: number}[] = await projectCursor.toArray();
     *
     * // or always use chaining and save the final cursor
     *
     * const cursor = coll.aggregate().project<{ a: string }>({
     *   _id: 0,
     *   a: { $convert: { input: '$a', to: 'string' }
     * }});
     * ```
     */
    project($project) {
        assertUninitialized(this);
        this[kPipeline].push({ $project });
        return this;
    }
    /** Add a lookup stage to the aggregation pipeline */
    lookup($lookup) {
        assertUninitialized(this);
        this[kPipeline].push({ $lookup });
        return this;
    }
    /** Add a redact stage to the aggregation pipeline */
    redact($redact) {
        assertUninitialized(this);
        this[kPipeline].push({ $redact });
        return this;
    }
    /** Add a skip stage to the aggregation pipeline */
    skip($skip) {
        assertUninitialized(this);
        this[kPipeline].push({ $skip });
        return this;
    }
    /** Add a sort stage to the aggregation pipeline */
    sort($sort) {
        assertUninitialized(this);
        this[kPipeline].push({ $sort });
        return this;
    }
    /** Add a unwind stage to the aggregation pipeline */
    unwind($unwind) {
        assertUninitialized(this);
        this[kPipeline].push({ $unwind });
        return this;
    }
    // deprecated methods
    /** @deprecated Add a geoNear stage to the aggregation pipeline */
    geoNear($geoNear) {
        assertUninitialized(this);
        this[kPipeline].push({ $geoNear });
        return this;
    }
}
//# sourceMappingURL=aggregation_cursor.js.map