// eslint-disable-next-line @typescript-eslint/no-var-requires
let BSON = require('bson');
try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    BSON = require('bson-ext');
}
catch (_a) { } // eslint-disable-line
/** @internal */
export const deserialize = BSON.deserialize;
/** @internal */
export const serialize = BSON.serialize;
/** @internal */
export const calculateObjectSize = BSON.calculateObjectSize;
export { Binary, BSONRegExp, BSONSymbol, Code, DBRef, Decimal128, Document, Double, Int32, Long, Map, MaxKey, MinKey, ObjectId, Timestamp } from 'bson';
export function pluckBSONSerializeOptions(options) {
    const { fieldsAsRaw, promoteValues, promoteBuffers, promoteLongs, serializeFunctions, ignoreUndefined, bsonRegExp, raw, enableUtf8Validation } = options;
    return {
        fieldsAsRaw,
        promoteValues,
        promoteBuffers,
        promoteLongs,
        serializeFunctions,
        ignoreUndefined,
        bsonRegExp,
        raw,
        enableUtf8Validation
    };
}
/**
 * Merge the given BSONSerializeOptions, preferring options over the parent's options, and
 * substituting defaults for values not set.
 *
 * @internal
 */
export function resolveBSONOptions(options, parent) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const parentOptions = parent === null || parent === void 0 ? void 0 : parent.bsonOptions;
    return {
        raw: (_b = (_a = options === null || options === void 0 ? void 0 : options.raw) !== null && _a !== void 0 ? _a : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.raw) !== null && _b !== void 0 ? _b : false,
        promoteLongs: (_d = (_c = options === null || options === void 0 ? void 0 : options.promoteLongs) !== null && _c !== void 0 ? _c : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.promoteLongs) !== null && _d !== void 0 ? _d : true,
        promoteValues: (_f = (_e = options === null || options === void 0 ? void 0 : options.promoteValues) !== null && _e !== void 0 ? _e : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.promoteValues) !== null && _f !== void 0 ? _f : true,
        promoteBuffers: (_h = (_g = options === null || options === void 0 ? void 0 : options.promoteBuffers) !== null && _g !== void 0 ? _g : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.promoteBuffers) !== null && _h !== void 0 ? _h : false,
        ignoreUndefined: (_k = (_j = options === null || options === void 0 ? void 0 : options.ignoreUndefined) !== null && _j !== void 0 ? _j : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.ignoreUndefined) !== null && _k !== void 0 ? _k : false,
        bsonRegExp: (_m = (_l = options === null || options === void 0 ? void 0 : options.bsonRegExp) !== null && _l !== void 0 ? _l : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.bsonRegExp) !== null && _m !== void 0 ? _m : false,
        serializeFunctions: (_p = (_o = options === null || options === void 0 ? void 0 : options.serializeFunctions) !== null && _o !== void 0 ? _o : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.serializeFunctions) !== null && _p !== void 0 ? _p : false,
        fieldsAsRaw: (_r = (_q = options === null || options === void 0 ? void 0 : options.fieldsAsRaw) !== null && _q !== void 0 ? _q : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.fieldsAsRaw) !== null && _r !== void 0 ? _r : {},
        enableUtf8Validation: (_t = (_s = options === null || options === void 0 ? void 0 : options.enableUtf8Validation) !== null && _s !== void 0 ? _s : parentOptions === null || parentOptions === void 0 ? void 0 : parentOptions.enableUtf8Validation) !== null && _t !== void 0 ? _t : true
    };
}
//# sourceMappingURL=bson.js.map