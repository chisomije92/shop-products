import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class EstimatedDocumentCountOperation extends CommandOperation {
    constructor(collection, options = {}) {
        super(collection, options);
        this.options = options;
        this.collectionName = collection.collectionName;
    }
    execute(server, session, callback) {
        const cmd = { count: this.collectionName };
        if (typeof this.options.maxTimeMS === 'number') {
            cmd.maxTimeMS = this.options.maxTimeMS;
        }
        super.executeCommand(server, session, cmd, (err, response) => {
            if (err) {
                callback(err);
                return;
            }
            callback(undefined, (response === null || response === void 0 ? void 0 : response.n) || 0);
        });
    }
}
defineAspects(EstimatedDocumentCountOperation, [
    Aspect.READ_OPERATION,
    Aspect.RETRYABLE,
    Aspect.CURSOR_CREATING
]);
//# sourceMappingURL=estimated_document_count.js.map