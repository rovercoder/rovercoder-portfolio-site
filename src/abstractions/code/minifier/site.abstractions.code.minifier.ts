import type { SiteCodeMinifier } from "./site.abstractions.code.minifier.base.js";
import { UglifyJsSiteCodeMinifier } from "./site.abstractions.code.minifier.uglifyjs.js";

export const codeMinifier: SiteCodeMinifier = new UglifyJsSiteCodeMinifier();
await codeMinifier.initialize();

export * from "./site.abstractions.code.minifier.base.js";
