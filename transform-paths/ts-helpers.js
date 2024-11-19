"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainBundle = exports.isImportCall = exports.isRequireCall = void 0;
const ts = require("typescript");
function isRequireCall(node, checkArgumentIsStringLiteralLike) {
    if (!ts.isCallExpression(node)) {
        return false;
    }
    const { expression, arguments: args } = node;
    if (!ts.isIdentifier(expression) || expression.escapedText !== "require") {
        return false;
    }
    if (args.length !== 1) {
        return false;
    }
    const [arg] = args;
    return !checkArgumentIsStringLiteralLike || ts.isStringLiteralLike(arg);
}
exports.isRequireCall = isRequireCall;
function isImportCall(node) {
    return (ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword);
}
exports.isImportCall = isImportCall;
function chainBundle(transformSourceFile) {
    function transformBundle(node) {
        return ts.factory.createBundle(node.sourceFiles.map(transformSourceFile), node.prepends);
    }
    return function transformSourceFileOrBundle(node) {
        return ts.isSourceFile(node)
            ? transformSourceFile(node)
            : transformBundle(node);
    };
}
exports.chainBundle = chainBundle;
