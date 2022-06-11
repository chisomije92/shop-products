var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Collection } from '../collection';
import { CommandOperation } from './command';
import { CreateIndexOperation } from './indexes';
import { Aspect, defineAspects } from './operation';
const ILLEGAL_COMMAND_FIELDS = new Set([
    'w',
    'wtimeout',
    'j',
    'fsync',
    'autoIndexId',
    'pkFactory',
    'raw',
    'readPreference',
    'session',
    'readConcern',
    'writeConcern',
    'raw',
    'fieldsAsRaw',
    'promoteLongs',
    'promoteValues',
    'promoteBuffers',
    'bsonRegExp',
    'serializeFunctions',
    'ignoreUndefined',
    'enableUtf8Validation'
]);
/** @internal */
export class CreateCollectionOperation extends CommandOperation {
    constructor(db, name, options = {}) {
        super(db, options);
        this.options = options;
        this.db = db;
        this.name = name;
    }
    execute(server, session, callback) {
        (() => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const db = this.db;
            const name = this.name;
            const options = this.options;
            const encryptedFields = (_a = options.encryptedFields) !== null && _a !== void 0 ? _a : (_c = (_b = db.s.client.options.autoEncryption) === null || _b === void 0 ? void 0 : _b.encryptedFieldsMap) === null || _c === void 0 ? void 0 : _c[`${db.databaseName}.${name}`];
            if (encryptedFields) {
                // Create auxilliary collections for queryable encryption support.
                const escCollection = (_d = encryptedFields.escCollection) !== null && _d !== void 0 ? _d : `enxcol_.${name}.esc`;
                const eccCollection = (_e = encryptedFields.eccCollection) !== null && _e !== void 0 ? _e : `enxcol_.${name}.ecc`;
                const ecocCollection = (_f = encryptedFields.ecocCollection) !== null && _f !== void 0 ? _f : `enxcol_.${name}.ecoc`;
                for (const collectionName of [escCollection, eccCollection, ecocCollection]) {
                    const createOp = new CreateCollectionOperation(db, collectionName, {
                        clusteredIndex: {
                            key: { _id: 1 },
                            unique: true
                        }
                    });
                    yield createOp.executeWithoutEncryptedFieldsCheck(server, session);
                }
                if (!options.encryptedFields) {
                    this.options = Object.assign(Object.assign({}, this.options), { encryptedFields });
                }
            }
            const coll = yield this.executeWithoutEncryptedFieldsCheck(server, session);
            if (encryptedFields) {
                // Create the required index for queryable encryption support.
                const createIndexOp = new CreateIndexOperation(db, name, { __safeContent__: 1 }, {});
                yield new Promise((resolve, reject) => {
                    createIndexOp.execute(server, session, err => (err ? reject(err) : resolve()));
                });
            }
            return coll;
        }))().then(coll => callback(undefined, coll), err => callback(err));
    }
    executeWithoutEncryptedFieldsCheck(server, session) {
        return new Promise((resolve, reject) => {
            const db = this.db;
            const name = this.name;
            const options = this.options;
            const done = err => {
                if (err) {
                    return reject(err);
                }
                resolve(new Collection(db, name, options));
            };
            const cmd = { create: name };
            for (const n in options) {
                if (options[n] != null &&
                    typeof options[n] !== 'function' &&
                    !ILLEGAL_COMMAND_FIELDS.has(n)) {
                    cmd[n] = options[n];
                }
            }
            // otherwise just execute the command
            super.executeCommand(server, session, cmd, done);
        });
    }
}
defineAspects(CreateCollectionOperation, [Aspect.WRITE_OPERATION]);
//# sourceMappingURL=create_collection.js.map