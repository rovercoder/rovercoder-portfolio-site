import { SiteAbstractionBase } from "../../site.abstractions.types.js";

export abstract class SiteCodeMinifier extends SiteAbstractionBase {
    abstract minifyCode(code: string): { minifiedCode: string, success: true, error?: { type: string, message: string } } | { success: false, error: { type: string, message: string } };
}
