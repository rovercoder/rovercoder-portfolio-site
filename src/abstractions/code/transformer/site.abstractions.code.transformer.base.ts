import { SiteAbstractionBase } from "../../site.abstractions.types.js";

export abstract class SiteCodeTransformer extends SiteAbstractionBase {
    abstract parseCode(code: string): { instance: CodeTransformer, success: true } | { success: false, error: { type: string, message: string } };
}

export abstract class CodeTransformer {
    abstract parsedCode: any;
    abstract codePartTypeToNativeTypes: { [key in CodePartType]: any[] | null | undefined }
    constructor(code: string) {
        if (code == null) {
            throw Error('Parameter `code` is undefined!');
        }
    }

    abstract findAllImportDeclarations(): CodeTransformerImportDeclaration[];

    abstract findAllImportExpressions(): CodeTransformerImportExpression[];

    abstract findFirstGlobalVariableDeclaratorByName(name: string): CodeTransformerVariableDeclarator | undefined;
    
    abstract findFirstGlobalObjectVariableDeclaratorByName(name: string): CodeTransformerVariableDeclarator | undefined;

    abstract findFirstGlobalFunctionDeclarationByName(name: string): CodeTransformerFunctionDeclaration | undefined;

    abstract findFirstGlobalFunctionVariableDeclaratorByName(name: string): CodeTransformerVariableDeclarator | undefined;

    abstract findFirstGlobalExportNamedDeclarationByExportedName(exportedName: string): CodeTransformerExportNamedDeclaration | undefined;
    
    abstract findFirstGlobalExportNamedDeclarationSpecifierByExportedName(exportedName: string): CodeTransformerExportNamedDeclarationSpecifier | undefined;

    abstract removeGlobalObjectVariableDeclaratorByName(name: string): void;

    abstract removeGlobalVariableDeclaratorByName(name: string): void;

    abstract removeGlobalFunctionDeclarationByName(name: string): void;

    abstract removeGlobalFunctionVariableDeclaratorByName(name: string): void;

    abstract removeGlobalExportNamedDeclarationByExportedName(exportedName: string): void;

    abstract removeGlobalExportNamedDeclarationSpecifierByLocalName(localName: string): void;

    abstract removeGlobalExportNamedDeclarationSpecifierByExportedName(exportedName: string): void;

    abstract toSource(): string;

    compareCodePartType(codePartType: CodePartType, typesToCompareWith: CodePartType | CodePartType[]) {
        if (codePartType == null || typesToCompareWith == null) {
            return false;
        }

        var codePartTypeNativeTypes = this.codePartTypeToNativeTypes[codePartType];
        if (codePartTypeNativeTypes == null) {
            return false;
        }

        var typesToCompareWithArray = (Array.isArray(typesToCompareWith) ? typesToCompareWith : [typesToCompareWith]).filter(x => x != null);

        var typesToCompareWithNativeTypes = 
            typesToCompareWithArray
                .flatMap(x => this.codePartTypeToNativeTypes[x] ?? [])
                .filter(x => x != null);

        return typesToCompareWithNativeTypes.some(x => (codePartTypeNativeTypes ?? []).some(y => y == x)) || typesToCompareWithArray.some(x => x === codePartType);
    }
}

export enum CodePartType {
    Unknown,
    ImportDeclaration,
    ImportExpression,
    ImportSpecifier,
    ImportNamespaceSpecifier,
    ExportNamedDeclaration,
    ExportNamedDeclarationSpecifier,
    VariableDeclaration,
    VariableDeclarator,
    Identifier,
    Literal,
    UnaryExpression,
    ObjectExpression,
    ObjectKey,
    ObjectKeyValuePair,
    ArrayExpression,
    FunctionExpression,
    FunctionDeclaration
}

export abstract class CodeTransformerElement<T extends CodeTransformerElementParameters = any> {
    abstract readonly type: CodePartType;
    readonly elementParams: T;

    constructor(elementParams: T) {
        this.elementParams = elementParams;
    }

    abstract toValue(): any;

    abstract toSource(): string;
}

CodeTransformerElement.prototype.toString = function(): string {
    return this.toSource();
}

export interface CodeTransformerElementParameters {}

export abstract class CodeTransformerVariableDeclaration<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.VariableDeclaration;
    readonly declarators: CodeTransformerVariableDeclarator<T>[];

    constructor(elementParams: T, declarators: CodeTransformerVariableDeclarator<T>[]) {
        super(elementParams);
        this.declarators = declarators;
    }
}

export abstract class CodeTransformerVariableDeclarator<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.VariableDeclarator;
    readonly initValue: CodeTransformerLiteral<T> | CodeTransformerObjectExpression<T> | CodeTransformerArrayExpression<T> | CodeTransformerFunctionExpression<T> | CodeTransformerIdentifier<T> | null | undefined;

    constructor(elementParams: T, initValue: CodeTransformerObjectExpression<T> | CodeTransformerArrayExpression<T> | CodeTransformerFunctionExpression<T> | null | undefined) {
        super(elementParams);
        this.initValue = initValue;
    }

    abstract getName(): string;
}

export abstract class CodeTransformerLiteral<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.Literal;
}

export abstract class CodeTransformerUnaryExpression<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.UnaryExpression;
}

export abstract class CodeTransformerObjectExpression<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ObjectExpression;
    abstract readonly elements: CodeTransformerObjectKeyValuePair<T>[];
}

export abstract class CodeTransformerObjectKeyValuePair<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ObjectKeyValuePair;
    abstract readonly key: CodeTransformerObjectKey<T>;
    abstract readonly value: CodeTransformerElement<T> | null | undefined;
}

export abstract class CodeTransformerObjectKey<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ObjectKey;
}

export abstract class CodeTransformerArrayExpression<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ArrayExpression;
    abstract readonly elements: (CodeTransformerElement<T> | null | undefined)[];
}

export abstract class CodeTransformerIdentifier<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.Identifier;
    readonly innerElement: CodeTransformerVariableDeclarator<T> | CodeTransformerFunctionDeclaration<T>;

    constructor(elementParams: T, innerElement: CodeTransformerVariableDeclarator<T> | CodeTransformerFunctionDeclaration<T>) {
        super(elementParams);
        // if (innerElement == null) {
        //     throw Error('Invalid identifier\'s inner element!');
        // }
        this.innerElement = innerElement;
    }

    abstract getName(): string | undefined;
}

export abstract class CodeTransformerFunctionExpression<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.FunctionExpression;
}

export abstract class CodeTransformerFunctionDeclaration<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.FunctionDeclaration;
}

export abstract class CodeTransformerImportDeclaration<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ImportDeclaration;
}

export abstract class CodeTransformerImportExpression<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ImportExpression;
    abstract getFunctionSignature(): string | undefined;
}

export abstract class CodeTransformerImportSpecifier<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ImportSpecifier;
}

export abstract class CodeTransformerImportNamespaceSpecifier<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ImportNamespaceSpecifier;
}

export abstract class CodeTransformerExportNamedDeclaration<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ExportNamedDeclaration;
    readonly innerValue: CodeTransformerElement<T>;

    constructor(elementParams: T, innerValue: CodeTransformerElement<T>) {
        super(elementParams);
        if (innerValue == null) {
            throw Error('Invalid Export Named Declaration\'s inner value!');
        }
        this.innerValue = innerValue;
    }
}

export abstract class CodeTransformerExportNamedDeclarationSpecifier<T extends CodeTransformerElementParameters = any> extends CodeTransformerElement<T> {
    readonly type: CodePartType = CodePartType.ExportNamedDeclarationSpecifier;
    readonly innerValue: CodeTransformerIdentifier<T>;

    constructor(elementParams: T, innerValue: CodeTransformerIdentifier<T>) {
        super(elementParams);
        if (innerValue == null) {
            throw Error('Invalid Export Named Declaration Specifier\'s inner value!');
        }
        this.innerValue = innerValue;
    }
}
