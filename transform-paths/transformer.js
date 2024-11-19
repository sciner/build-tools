"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformerFactory = void 0;
const ts = require("typescript");
const alias_resolver_1 = require("./alias-resolver");
const ts_helpers_1 = require("./ts-helpers");
function transformer(program, options) {
    function optionsFactory(context) {
        return transformerFactory(context, options);
    }
    return {
        after: [optionsFactory],
        afterDeclarations: [optionsFactory]
    };
}
exports.default = transformer;
function transformerFactory(context, options) {
    const aliasResolver = new alias_resolver_1.default(context.getCompilerOptions());
    function transformSourceFile(sourceFile) {
        function getResolvedPathNode(node) {
            const resolvedPath = aliasResolver.resolve(sourceFile.fileName, node.text);
            return resolvedPath !== node.text
                ? ts.factory.createStringLiteral(resolvedPath)
                : null;
        }
        function pathReplacer(node) {
            if (ts.isStringLiteral(node)) {
                return getResolvedPathNode(node) || node;
            }
            return ts.visitEachChild(node, pathReplacer, context);
        }
        function visitor(node) {
            /**
             * e.g.
             * - const x = require('path');
             * - const x = import('path');
             */
            if ((0, ts_helpers_1.isRequireCall)(node, false) || (0, ts_helpers_1.isImportCall)(node)) {
                return ts.visitEachChild(node, pathReplacer, context);
            }
            /**
             * e.g.
             * - type Foo = import('path').Foo;
             */
            if (ts.isImportTypeNode(node)) {
                return ts.visitEachChild(node, pathReplacer, context);
            }
            /**
             * e.g.
             * - import * as x from 'path';
             * - import { x } from 'path';
             */
            if (ts.isImportDeclaration(node) &&
                ts.isStringLiteral(node.moduleSpecifier)) {
                return ts.visitEachChild(node, pathReplacer, context);
            }
            /**
             * e.g.
             * - export { x } from 'path';
             */
            if (ts.isExportDeclaration(node) &&
                node.moduleSpecifier &&
                ts.isStringLiteral(node.moduleSpecifier)) {
                return ts.visitEachChild(node, pathReplacer, context);
            }
            return ts.visitEachChild(node, visitor, context);
        }
        return ts.visitEachChild(sourceFile, visitor, context);
    }
    return (0, ts_helpers_1.chainBundle)(transformSourceFile);
}
exports.transformerFactory = transformerFactory;
