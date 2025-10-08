import type { SiteCodeBundler } from "./site.abstractions.code.bundler.base.js";
import { RollupWithPluginsSiteCodeBundler } from "./site.abstractions.code.bundler.rollupwithplugins.js";

export const codeBundler: SiteCodeBundler = new RollupWithPluginsSiteCodeBundler();
await codeBundler.initialize();

export * from "./site.abstractions.code.bundler.base.js";
