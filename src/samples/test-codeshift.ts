import { nameOf } from '../helpers/helpers.general.js';
import { getFunctionDetails } from '../data/options/functions/site.data.options.functions.js';
import { codeMinifier } from '../abstractions/code/minifier/site.abstractions.code.minifier.js';
import { CodePartType, CodeTransformerElement, CodeTransformerFunctionExpression, CodeTransformerIdentifier, CodeTransformerObjectExpression, CodeTransformerVariableDeclaration, CodeTransformerVariableDeclarator } from '../abstractions/code/transformer/site.abstractions.code.transformer.js';
import { codeTransformer } from '../abstractions/code/transformer/site.abstractions.code.transformer.js';

var code = `
import { fileURLToPath } from "url";
import * as d from "test";

import('date-fns-2');

function _alert(d) {
    alert(d);
}

export function exportedFunction() {
}

function de(a, b, c) {
    import('date-fns');
    const _a = 123;
    _alert(_a);
    return 3;
}

const dfa = (d, e) => {
    let a = d;
    _alert(a);
}

export const t = 12345;

//let d = [t, , 334];//{ function: dfa, isCallableFromOtherFunctions: true };

const a = {
    'de': { function: de, isCallableFromOtherFunctions: true },
    'df': d,
    'ed': { function: () => { console.log('wow'); import('date-fns-3'); }, isCallableFromOtherFunctions: true },
};

export { a };
`;

const d = null;//{ function: null, isCallableFromOtherFunctions: true };

const a = {
    'de': { function: null, isCallableFromOtherFunctions: true },
    'df': d,
    'ed': { function: function() { console.log('wow'); }, isCallableFromOtherFunctions: true },
}

var constructedObject = a;

//var result = await codeBundler.bundle(code);

var originallyParsedCodeResult = codeTransformer.parseCode(code);

if (!originallyParsedCodeResult.success) {
    throw Error(`Bundled code not parsed successfully!\r\n${JSON.stringify(originallyParsedCodeResult.error)}`);
}

var originallyParsedCode = originallyParsedCodeResult.instance;

var importDeclarations = originallyParsedCode.findAllImportDeclarations();
if (importDeclarations.length > 0) {
    console.warn(`Warning: Import declarations found after bundling:\r\n${importDeclarations.map(x => x.toSource()).join('\r\n')}\r\n`);
}

var importExpressions = originallyParsedCode.findAllImportExpressions();
if (importExpressions.length > 0) {
    console.warn(`Warning: Import expressions found after bundling:\r\n${importExpressions.map(x => `Function: ${x.getFunctionSignature() ?? 'N/A (Possibly in global scope)'} | Code: "${x.toSource()}"`).join('\r\n')}\r\n`);
}

var minifiedCodeResult = codeMinifier.minifyCode(code);

if (!minifiedCodeResult.success) {
    throw Error(JSON.stringify(minifiedCodeResult.error));
}

var parsedCodeResult = codeTransformer.parseCode(minifiedCodeResult.minifiedCode);

if (!parsedCodeResult.success) {
    throw Error(JSON.stringify(parsedCodeResult.error));
}

var parsedCode = parsedCodeResult.instance;

const variableNameToTest = nameOf(() => a);


var globalObjectDeclarator: CodeTransformerVariableDeclarator | null | undefined;

const globalObjectDeclaration = parsedCode.findFirstGlobalExportNamedDeclarationByExportedName(variableNameToTest);
const globalObjectDeclarationSpecifier = parsedCode.findFirstGlobalExportNamedDeclarationSpecifierByExportedName(variableNameToTest);

if (globalObjectDeclaration !== null) {
    if (globalObjectDeclaration?.innerValue.type === CodePartType.VariableDeclaration) {
        globalObjectDeclarator = (globalObjectDeclaration?.innerValue as CodeTransformerVariableDeclaration).declarators.find(x => x.getName() === variableNameToTest);
    }
}

if (globalObjectDeclarationSpecifier != null) {
    globalObjectDeclarator = globalObjectDeclarationSpecifier.innerValue?.innerElement as CodeTransformerVariableDeclarator | null | undefined;
}

if (globalObjectDeclarator == null) {
    var errorMessage = `No global object '${variableNameToTest}' found`;
    console.log(errorMessage);
    throw Error(errorMessage);
} else {
    if (globalObjectDeclarator.initValue == null) {
        throw Error(`Global variable: '${variableNameToTest}' has no initial value.`);
    }
    
    if (globalObjectDeclarator.initValue.type !== CodePartType.ObjectExpression) {
        throw Error(`Global variable: '${variableNameToTest}' is not an object.`);
    }

    var objectExpression = globalObjectDeclarator.initValue as CodeTransformerObjectExpression;

    // Map to store extracted functions
    const extractedFunctions: { [name: string]: { name: string, nameInternal?: string, arguments: string, body: string, canBeCalledFromOtherFunctions: boolean } } = {};

    const jsObject: any = constructedObject;
    for (var key in jsObject) {
        var value: any = jsObject[key];
        if (!!value 
                && typeof value === 'object' 
                && /*TODO: fields<T>().function*/'function' in value
        ) {
            var functionValue = value.function;
            if (typeof functionValue === 'function') {
                var functionDetails = getFunctionDetails(functionValue);
                extractedFunctions[key] = { 
                    name: key, 
                    ...((functionDetails?.functionName != null && functionDetails?.functionName.toString().trim() != '') ? { nameInternal: functionDetails?.functionName } : {}),
                    arguments: functionDetails?.parameterNames.join(',') ?? '', 
                    body: functionDetails?.bodyMinified ?? functionDetails?.body ?? '', 
                    canBeCalledFromOtherFunctions: value['isCallableFromOtherFunctions'] 
                };
            }
        }
    }
    // next delete the whole (exported) variable by 'variableName' from parsedCode

     // Log extracted functions
    console.log('Extracted Functions:', Object.keys(extractedFunctions));

    // Step 2: Remove the function declarations
    for (var key in extractedFunctions) {
        const funcNameInternal = extractedFunctions[key]?.nameInternal;

        if (funcNameInternal != null && funcNameInternal.toString().trim().length > 0) {
            parsedCode.removeGlobalExportNamedDeclarationByExportedName(funcNameInternal);
            parsedCode.removeGlobalExportNamedDeclarationSpecifierByLocalName(funcNameInternal);
            parsedCode.removeGlobalFunctionDeclarationByName(funcNameInternal);
            parsedCode.removeGlobalFunctionVariableDeclaratorByName(funcNameInternal);
        }
    }

    parsedCode.removeGlobalExportNamedDeclarationByExportedName(variableNameToTest);
    parsedCode.removeGlobalExportNamedDeclarationSpecifierByExportedName(variableNameToTest);
    // remove filepath
    //parsedCode.removeGlobalVariableDeclaratorByName()
    // remove export statement

    const finalCode = codeMinifier.minifyCode(parsedCode.toSource().trim());
    if (!finalCode.success) {
        throw Error('Unsuccessful minification after amends!');
    }
    console.log('\n✅ Final Code:\n', finalCode.minifiedCode);
    console.log(`\nExtracted functions: \n${JSON.stringify(extractedFunctions)}\n`)

    var result = { codeContext: finalCode.minifiedCode, exportedObjectName: nameOf(() => a), functions: extractedFunctions };
}

console.log('Done!');
