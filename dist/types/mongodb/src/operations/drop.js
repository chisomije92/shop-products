var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MONGODB_ERROR_CODES, MongoServerError } from '../error';
import { CommandOperation } from './command';
import { Aspect, defineAspects } from './operation';
/** @internal */
export class DropCollectionOperation extends CommandOperation {
    constructor(db, name, options = {}) {
        super(db, options);
        this.db = db;
        this.options = options;
        this.name = name;
    }
    execute(server, session, callback) {
        (() => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const db = this.db;
            const options = this.options;
            const name = this.name;
            const encryptedFieldsMap = (_a = db.s.client.options.autoEncryption) === null || _a === void 0 ? void 0 : _a.encryptedFieldsMap;
            let encryptedFields = (_b = options.encryptedFields) !== null && _b !== void 0 ? _b : encryptedFieldsMap === null || encryptedFieldsMap === void 0 ? void 0 : encryptedFieldsMap[`${db.databaseName}.${name}`];
            if (!encryptedFields && encryptedFieldsMap) {
                // If the MongoClient was configued with an encryptedFieldsMap,
                // and no encryptedFields config was available in it or explicitly
                // passed as an argument, the spec tells us to look one up using
                // listCollections().
                const listCollectionsResult = yield db
                    .listCollections({ name }, { nameOnly: false })
                    .toArray();
                encryptedFields = (_d = (_c = listCollectionsResult === null || listCollectionsResult === void 0 ? void 0 : listCollectionsResult[0]) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.encryptedFields;
            }
            if (encryptedFields) {
                const escCollection = encryptedFields.escCollection || `enxcol_.${name}.esc`;
                const eccCollection = encryptedFields.eccCollection || `enxcol_.${name}.ecc`;
                const ecocCollection = encryptedFields.ecocCollection || `enxcol_.${name}.ecoc`;
                for (const collectionName of [escCollection, eccCollection, ecocCollection]) {
                    // Drop auxilliary collections, ignoring potential NamespaceNotFound errors.
                    const dropOp = new DropCollectionOperation(db, collectionName);
                    try {
                        yield dropOp.executeWithoutEncryptedFieldsCheck(server, session);
                    }
                    catch (err) {
                        if (!(err instanceof MongoServerError) ||
                            err.code !== MONGODB_ERROR_CODES.NamespaceNotFound) {
                            throw err;
                        }
                    }
                }
            }
            return yield this.executeWithoutEncryptedFieldsCheck(server, session);
        }))().then(result => callback(undefined, result), err => callback(err));
    }
    executeWithoutEncryptedFieldsCheck(server, session) {
        return new Promise((resolve, reject) => {
            super.executeCommand(server, session, { drop: this.name }, (err, result) => {
                if (err)
                    return reject(err);
                resolve(!!result.ok);
            });
        });
    }
}
/** @internal */
export class DropDatabaseOperation extends CommandOperation {
    constructor(db, options) {
        super(db, options);
        this.options = options;
    }
    execute(server, session, callback) {
        super.executeCommand(server, session, { dropDatabase: 1 }, (err, result) => {
            if (err)
                return callback(err);
            if (result.ok)
                return callback(undefined, true);
            callback(undefined, false);
        });
    }
}
defineAspects(DropCollectionOperation, [Aspect.WRITE_OPERATION]);
defineAspects(DropDatabaseOperation, [Aspect.WRITE_OPERATION]);
//# sourceMappingURL=drop.js.map