import { SiteAbstractionBase } from "../../site.abstractions.types.js";

export abstract class SiteCodeBundler extends SiteAbstractionBase {
    abstract bundleCodeFile(inputFilePath: string): Promise<{ bundledCode: string, success: true, error?: { type: string, message: string } } | { success: false, error: { type: string, message: string } }>;
}
