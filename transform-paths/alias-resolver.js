"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const utils_1 = require("./utils");
const REGEXP_ALL_BACKSLASH = /\\/g;
class ProjectOptions {
    constructor(compilerOptions) {
        this.aliases = [];
        this.paths = [];
        this.baseUrl = compilerOptions.baseUrl || __dirname;
        this.outDir = compilerOptions.outDir || this.baseUrl;
        this.processMappings(compilerOptions.paths || {});
    }
    getMapping(requestedModule) {
        const alias = (0, utils_1.getAlias)(requestedModule);
        const index = this.aliases.indexOf(alias);
        if (index < 0) {
            return null;
        }
        let mapping = this.paths[index];
        mapping = requestedModule.replace(alias, mapping);
        mapping = (0, utils_1.replaceDoubleSlashes)(mapping);
        mapping = (0, utils_1.ensureTrailingPathDelimiter)(mapping);
        return mapping;
    }
    processMappings(paths) {
        for (const alias in paths) {
            this.aliases.push((0, utils_1.stripWildcard)(alias));
            this.paths.push((0, utils_1.stripWildcard)(paths[alias][0]));
        }
    }
}
class AliasResolver {
    constructor(compilerOptions) {
        const projectPath = process.cwd();
        this.options = new ProjectOptions(compilerOptions);
        this.srcPath = path.normalize(path.resolve(projectPath, this.options.baseUrl || "."));
        this.outPath = path.normalize(path.resolve(projectPath, this.options.outDir || "."));
    }
    resolve(fileName, requestedModule) {
        const mapping = this.options.getMapping(requestedModule);
        if (mapping) {
            const absoluteJsRequire = path.join(this.srcPath, mapping);
            const sourceDir = path.dirname(fileName);
            let relativePath = path.relative(sourceDir, absoluteJsRequire);
            /* If the path does not start with .. it´ not a sub directory
             * as in ../ or ..\ so assume it´ the same dir...
             */
            if (relativePath[0] != ".") {
                relativePath = "." + path.sep + relativePath;
            }

            // this is Tesera hack to get correct module names for tsx
            if (!relativePath.endsWith('.js')) {
                if (relativePath.indexOf('@sciner') >= 0) {
                    relativePath = relativePath + '\\index.mjs'
                } else {
                    // for pako
                    relativePath = relativePath + '\\index.js'
                }
            }

            // console.log(`REPLACED: ${relativePath}, mapping = ${mapping}`)
            return relativePath = relativePath.replace(REGEXP_ALL_BACKSLASH, "/")
        }
        else {
            if (this.srcPath != this.outPath && requestedModule[0] == ".") {
                const normalizedFileName = path.normalize(fileName);
                let relativeModulePath = normalizedFileName.replace(this.srcPath, "");
                let lookupFile = requestedModule;
                if (!lookupFile.endsWith(".js")) {
                    lookupFile = `${requestedModule}.js`;
                }
                const relativeSrcModulePath = path.join(this.srcPath, path.dirname(relativeModulePath), lookupFile);
                if (fs.existsSync(relativeSrcModulePath)) {
                    // if a JS file exists in path within src directory, assume it will not be transpiled
                    return path
                        .relative(normalizedFileName.replace(this.srcPath, this.outPath), relativeSrcModulePath)
                        .replace(REGEXP_ALL_BACKSLASH, "/") // force win32 paths to be POSIX
                        .replace(/^\.\.\//g, "");
                }
            }
            return requestedModule;
        }
    }
}
exports.default = AliasResolver;
