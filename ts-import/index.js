import * as mod from "node:module";
import { pathToFileURL } from "node:url";

export function register() {
    mod.register("./ts-loader.js", pathToFileURL(import.meta.dirname+'/'));
}