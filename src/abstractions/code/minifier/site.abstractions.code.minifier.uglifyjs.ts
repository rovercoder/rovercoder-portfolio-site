import { minify } from "uglify-js";
import { SiteCodeMinifier } from "./site.abstractions.code.minifier.base.js";

export class UglifyJsSiteCodeMinifier extends SiteCodeMinifier {
    protected onInit() {};
    protected onDestroy() {};
    minifyCode(code: string): { minifiedCode: string, success: true, error?: { type: string, message: string } } | { success: false, error: { type: string, message: string } } {
        try {
            var result = minify(code, { /*keep_fnames: true,*/ keep_fargs: true } as any);
            if (!!result.error) {
                return { success: false, error: { type: 'internal-error', message: JSON.stringify(result.error) } };
            }
            return { success: true, minifiedCode: result.code, ...(!!result.warnings ? { error: { type: 'internal-warning', message: JSON.stringify(result.warnings) } } : {}) };
        } catch (e) {
            return { success: false, error: { type: 'exception', message: e?.toString() ?? '' } };
        }
    }
}
