import { MongoInvalidArgumentError } from './error';
/** @public */
export const ExplainVerbosity = Object.freeze({
    queryPlanner: 'queryPlanner',
    queryPlannerExtended: 'queryPlannerExtended',
    executionStats: 'executionStats',
    allPlansExecution: 'allPlansExecution'
});
/** @internal */
export class Explain {
    constructor(verbosity) {
        if (typeof verbosity === 'boolean') {
            this.verbosity = verbosity
                ? ExplainVerbosity.allPlansExecution
                : ExplainVerbosity.queryPlanner;
        }
        else {
            this.verbosity = verbosity;
        }
    }
    static fromOptions(options) {
        if ((options === null || options === void 0 ? void 0 : options.explain) == null)
            return;
        const explain = options.explain;
        if (typeof explain === 'boolean' || typeof explain === 'string') {
            return new Explain(explain);
        }
        throw new MongoInvalidArgumentError('Field "explain" must be a string or a boolean');
    }
}
//# sourceMappingURL=explain.js.map