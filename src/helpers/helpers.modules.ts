import { writeFileSync, existsSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { isNodeJS } from "./helpers.environment.js";
import { pathToFileURL } from "url";

// works only in browsers not in node js
export async function createModule(code: string): Promise<any | undefined> {
    if (isNodeJS()) {
        return await createDynamicModuleWithImports(code);
    } else {
        const url = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
        try {
            return await import(url);
        } catch (e) {
            console.error(e);
            return;
        } finally {
            URL.revokeObjectURL(url);
        }
    }
}

async function createDynamicModuleWithImports(code: string): Promise<any | undefined> {
    var fileName;
    try {
        do {
            const id = Date.now() + Math.random().toString(36);
            fileName = join(tmpdir(), `${id}.mjs`);
        }
        while (existsSync(fileName));
    } catch (e) {
        console.error(e);
        return;
    }
    
    try {
        writeFileSync(fileName, code, { flag: "wx" });

        // Now use native import() → uses full Node.js ESM loader chain
        const mod = await import(pathToFileURL(fileName).toString());
        return mod;
    } catch (e) {
        console.error(e);
    } finally {
        try {
            unlinkSync(fileName);
        } catch (e) {
            console.error(e);
            return;
        }
    }
}

// NOT RECOMMENDED (even in NodeJS due to limitations)
// async function createDynamicModuleForNodeJsDeprecated(code: string): Promise<any | undefined> {
//     try {
//         return await import("data:text/javascript;base64," + btoa(code));
//     } catch (e) {
//         console.error(e);
//         return;
//     }
// }
