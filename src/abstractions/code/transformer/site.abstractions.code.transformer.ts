import type { SiteCodeTransformer } from "./site.abstractions.code.transformer.base.js";
import { JsCodeShiftSiteCodeTransformer } from "./site.abstractions.code.transformer.jscodeshift.js";

export const codeTransformer: SiteCodeTransformer = new JsCodeShiftSiteCodeTransformer();
await codeTransformer.initialize();

export * from "./site.abstractions.code.transformer.base.js";
