"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlias = exports.ensureTrailingPathDelimiter = exports.replaceDoubleSlashes = exports.stripWildcard = void 0;
const path = require("path");
const SEPARATORS = ["\\", "/"];
const WILDCARDS = ["\\*", "/*"];
function stripWildcard(path) {
    if (WILDCARDS.indexOf(path.slice(-2)) > -1) {
        return path.substring(0, path.length - 2);
    }
    return path;
}
exports.stripWildcard = stripWildcard;
function replaceDoubleSlashes(filePath) {
    return path.normalize(filePath);
}
exports.replaceDoubleSlashes = replaceDoubleSlashes;
function ensureTrailingPathDelimiter(searchPath) {
    if (!searchPath) {
        return "";
    }
    if (SEPARATORS.indexOf(searchPath.charAt(searchPath.length - 1)) < 0) {
        return searchPath + path.sep;
    }
    return searchPath;
}
exports.ensureTrailingPathDelimiter = ensureTrailingPathDelimiter;
function getAlias(requestedModule) {
    for (let i = 0; i < requestedModule.length; i++) {
        if (SEPARATORS.indexOf(requestedModule[i]) > -1) {
            return requestedModule.substring(0, i);
        }
    }
    return requestedModule;
}
exports.getAlias = getAlias;
