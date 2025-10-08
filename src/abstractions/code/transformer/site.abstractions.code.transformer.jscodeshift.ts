import jscodeshift, { type ASTPath } from 'jscodeshift';
import astTypes from 'ast-types/types';
import { CodePartType, CodeTransformer, CodeTransformerArrayExpression, CodeTransformerElement, CodeTransformerExportNamedDeclaration, CodeTransformerExportNamedDeclarationSpecifier, CodeTransformerFunctionDeclaration, CodeTransformerFunctionExpression, CodeTransformerIdentifier, CodeTransformerImportDeclaration, CodeTransformerImportExpression, CodeTransformerImportNamespaceSpecifier, CodeTransformerImportSpecifier, CodeTransformerLiteral, CodeTransformerObjectExpression, CodeTransformerObjectKey, CodeTransformerObjectKeyValuePair, CodeTransformerUnaryExpression, CodeTransformerVariableDeclaration, CodeTransformerVariableDeclarator, SiteCodeTransformer, type CodeTransformerElementParameters } from './site.abstractions.code.transformer.base.js';

// TODO
// TO VALUE
// - ADD: Ability to get function (even inside other functions), examine their requirements (variables + other functions), build a module meeting all requirements and return the function to be called in regular JS
// - ADD: Ability to process Identifiers (especially global ones), create a module and export the identifier with random export name and retrieve the computed value

export class JsCodeShiftSiteCodeTransformer extends SiteCodeTransformer {
    protected onInit() {};
    protected onDestroy() {};
    parseCode(code: string): { instance: CodeTransformer; success: true; } | { success: false; error: { type: string; message: string; }; } {
        try {
            var instance = new JsCodeShiftCodeTransformer(code);
            return { instance, success: true };
        } catch (e) {
            return { success: false, error: { type: 'exception', message: e != null ? JSON.stringify(e) : '' } }
        }
    }
}

class JsCodeShiftCodeTransformer extends CodeTransformer {
    parsedCode: jscodeshift.Collection;
    codePartTypeToNativeTypes: { [key in CodePartType]: astTypes.Type<any>[] | null | undefined } = codePartTypeToNativeTypes;

    constructor(code: string) {
        super(code);
        this.parsedCode = jscodeshift(code ?? '');
    }

    findAllImportDeclarations(): CodeTransformerImportDeclaration[] {
        var results = _findImportDeclarations(this.parsedCode);
        
        var allResults = _getResultsFromCollection(results);

        if (!allResults) {
            return [];
        }

        return allResults.map(x => new JsCodeShiftCodeTransformerImportDeclaration({ 
            instance: this,
            node: x.node, 
            path: x.path, 
            collectionWithSingleElement: x.collectionWithSingleElement 
        }));
    }

    findAllImportExpressions(): CodeTransformerImportExpression[] {
        var results = _findImportExpressions(this.parsedCode);
        
        var allResults = _getResultsFromCollection(results);

        if (!allResults) {
            return [];
        }

        return allResults.map(x => new JsCodeShiftCodeTransformerImportExpression({ 
            instance: this,
            node: x.node, 
            path: x.path, 
            collectionWithSingleElement: x.collectionWithSingleElement 
        }));
    }

    findFirstGlobalVariableDeclaratorByName(name: string): CodeTransformerVariableDeclarator | undefined {
        var results = _filterGlobalVariableDeclarators(
            _findVariableDeclarators(this.parsedCode, name)
        );

        var firstResult = _getFirstResultFromCollection(results);

        if (!firstResult) {
            return;
        }

        return new JsCodeShiftCodeTransformerVariableDeclarator({ 
            instance: this,
            node: firstResult.node, 
            path: firstResult.path, 
            collectionWithSingleElement: firstResult.collectionWithSingleElement 
        });
    }

    findFirstGlobalObjectVariableDeclaratorByName(name: string): CodeTransformerVariableDeclarator | undefined {
        var results = _filterGlobalVariableDeclarators(
            _filterObjectVariableDeclarators(
                _findVariableDeclarators(this.parsedCode, name)
            )
        );

        var firstResult = _getFirstResultFromCollection(results);

        if (!firstResult) {
            return;
        }

        return new JsCodeShiftCodeTransformerVariableDeclarator({ 
            instance: this,
            node: firstResult.node, 
            path: firstResult.path, 
            collectionWithSingleElement: firstResult.collectionWithSingleElement 
        });
    }

    findFirstGlobalFunctionDeclarationByName(name: string): CodeTransformerFunctionDeclaration | undefined {
        var results = _filterGlobalFunctionDeclarations(
            _findFunctionDeclarations(this.parsedCode, name)
        );

        var firstResult = _getFirstResultFromCollection(results);

        if (!firstResult) {
            return;
        }

        return new JsCodeShiftCodeTransformerFunctionDeclaration({ 
            instance: this,
            node: firstResult.node, 
            path: firstResult.path, 
            collectionWithSingleElement: firstResult.collectionWithSingleElement 
        });
    }

    findFirstGlobalFunctionVariableDeclaratorByName(name: string): CodeTransformerVariableDeclarator | undefined {
        var results = _filterGlobalVariableDeclarators(
            _filterFunctionVariableDeclarators(
                _findVariableDeclarators(this.parsedCode, name)
            )
        );

        var firstResult = _getFirstResultFromCollection(results);

        if (!firstResult) {
            return;
        }

        return new JsCodeShiftCodeTransformerVariableDeclarator({ 
            instance: this,
            node: firstResult.node, 
            path: firstResult.path, 
            collectionWithSingleElement: firstResult.collectionWithSingleElement 
        });
    }

    findFirstGlobalExportNamedDeclarationByExportedName(exportedName: string): CodeTransformerExportNamedDeclaration | undefined {
        var results = _filterGlobalExportNamedDeclaration(
            _findNamedExportDeclarationByExportedName(this.parsedCode, exportedName)
        );

        var firstResult = _getFirstResultFromCollection(results);

        if (!firstResult) {
            return;
        }

        return new JsCodeShiftCodeTransformerExportNamedDeclaration({ 
            instance: this,
            node: firstResult.node, 
            path: firstResult.path, 
            collectionWithSingleElement: firstResult.collectionWithSingleElement 
        });
    }

    findFirstGlobalExportNamedDeclarationSpecifierByExportedName(exportedName: string): CodeTransformerExportNamedDeclarationSpecifier | undefined {
        var results = _filterGlobalExportNamedDeclarationSpecifiers(
            _findNamedExportDeclarationSpecifierByExportedName(this.parsedCode, exportedName)
        );

        var firstResult = _getFirstResultFromCollection(results);

        if (!firstResult) {
            return;
        }

        return new JsCodeShiftCodeTransformerExportNamedDeclarationSpecifier({ 
            instance: this,
            node: firstResult.node, 
            path: firstResult.path, 
            collectionWithSingleElement: firstResult.collectionWithSingleElement 
        });
    }

    removeGlobalObjectVariableDeclaratorByName(name: string): void {
        var results = _filterGlobalVariableDeclarators(
            _filterObjectVariableDeclarators(
                _findVariableDeclarators(this.parsedCode, name)
            )
        );

        results.remove();
    }

    removeGlobalVariableDeclaratorByName(name: string): void {
        var results = _filterGlobalVariableDeclarators(
            _findVariableDeclarators(this.parsedCode, name)
        );

        results.remove();
    }

    removeGlobalFunctionDeclarationByName(name: string): void {
        var results = _filterGlobalFunctionDeclarations(
            _findFunctionDeclarations(this.parsedCode, name)
        );

        results.remove();
    }

    removeGlobalFunctionVariableDeclaratorByName(name: string): void {
        var results = _filterGlobalVariableDeclarators(
            _filterFunctionVariableDeclarators(
                _findVariableDeclarators(this.parsedCode, name)
            )
        );

        results.remove();
    }

    removeGlobalExportNamedDeclarationByExportedName(exportedName: string): void {
        var results = _filterGlobalExportNamedDeclaration(
            _findNamedExportDeclarationByExportedName(this.parsedCode, exportedName)
        );

        // if function declaration move internal declaration outside of export declaration
        // if variable declaration move declarator outside export declaration
        // -> if export declaration is now empty remove
        results.forEach((path) => {
            const { declaration, specifiers } = path.node;

            if (declaration) {
                // Case 1: export function test() {...}
                if (declaration.id && declaration.id.name === exportedName) {
                    // Move function declaration outside the export
                    jscodeshift(path).insertBefore(declaration);
                    // Remove the export declaration
                    jscodeshift(path).remove();
                }
                // Case 2: export const testVar = 0
                else if (_compareNativeType(declaration.type, jscodeshift.VariableDeclaration)) {
                    // Find the matching declarator
                    const matchingDeclarators = declaration.declarations.filter(
                        (decl: any) => decl.id.name === exportedName
                    );

                    if (matchingDeclarators.length > 0) {
                        // Create new variable declaration with only matching declarators
                        const newVarDecl = jscodeshift.variableDeclaration(
                            declaration.kind,
                            matchingDeclarators
                        );

                        // Insert before export
                        jscodeshift(path).insertBefore(newVarDecl);

                        // Remove matching declarators from original declaration
                        declaration.declarations = declaration.declarations.filter(
                            (decl: any) => decl.id.name !== exportedName
                        );

                        // If no declarators left, remove the export
                        if (declaration.declarations.length === 0) {
                            jscodeshift(path).remove();
                        }
                    }
                }
            }
        });
    }

    removeGlobalExportNamedDeclarationSpecifierByLocalName(localName: string): void {
        var results = _filterGlobalExportNamedDeclarationSpecifiers(
            _findNamedExportDeclarationSpecifierByLocalName(this.parsedCode, localName)
        );

        results.forEach((path) => {
            const parent = path?.parent.node;

            if (!!parent && _compareNativeType(parent.type, jscodeshift.ExportNamedDeclaration)) {
                const specifiers = parent.specifiers;

                if (specifiers.length === 1) {
                    // Only one specifier -> remove entire export line
                    jscodeshift(path.parent).remove();
                } else {
                    // Multiple exports: just remove this specifier
                    jscodeshift(path).remove();
                }
            }
        });
    }

    removeGlobalExportNamedDeclarationSpecifierByExportedName(exportedName: string): void {
        var results = _filterGlobalExportNamedDeclarationSpecifiers(
            _findNamedExportDeclarationSpecifierByExportedName(this.parsedCode, exportedName)
        );

        results.forEach((path) => {
            const parent = path?.parent.node;

            if (!!parent && _compareNativeType(parent.type, jscodeshift.ExportNamedDeclaration)) {
                const specifiers = parent.specifiers;

                if (specifiers.length === 1) {
                    // Only one specifier -> remove entire export line
                    jscodeshift(path.parent).remove();
                } else {
                    // Multiple exports: just remove this specifier
                    jscodeshift(path).remove();
                }
            }
        });
    }

    toSource(): string {
        return this.parsedCode.toSource({ quote: 'single' });
    }
}

function _compareNativeType(nativeType: astTypes.Type<any> | string | null | undefined, typesToCompareWith: astTypes.Type<any> | string | (astTypes.Type<any> | string)[]) {
    if (nativeType == null) {
        return false;
    }
    var _typesToCompareWith = Array.isArray(typesToCompareWith) ? typesToCompareWith : [typesToCompareWith];
    return _typesToCompareWith.map(x => x.toString().toLowerCase()).includes(nativeType.toString().toLowerCase());
}

function _getFirstResultFromCollection(collection: jscodeshift.Collection<any>): { node: any, path: ASTPath<any>, collectionWithSingleElement: jscodeshift.Collection<any> } | undefined {
    if (!collection || collection.length === 0) {
        return;
    }

    var results = _getResultsFromCollection(collection.at(0));

    if (!results || results.length === 0) {
        return;
    }

    return results[0];
}

function _getResultsFromCollection(collection: jscodeshift.Collection<any>): { node: any, path: ASTPath<any>, collectionWithSingleElement: jscodeshift.Collection<any> }[] | undefined {
    if (!collection) {
        return;
    }

    var results: { node: any, path: ASTPath<any>, collectionWithSingleElement: jscodeshift.Collection<any> }[] = [];
    for (var i = 0; i < collection.length; i++) {
        var collectionWithSingleElement = collection.at(i);

        var nodes = collectionWithSingleElement.nodes();
        var paths = collectionWithSingleElement.paths();

        var firstNode = nodes.length > 0 ? nodes[0] : undefined;
        var firstPath = paths.length > 0 ? paths[0] : undefined;

        if (firstNode == null || firstPath == null) {
            throw Error('Invalid node and/or path results!');
        }

        results.push({
            node: firstNode,
            path: firstPath,
            collectionWithSingleElement
        });
    }
    return results;
}

function _filterGlobalVariableDeclarators(declarators: jscodeshift.Collection): jscodeshift.Collection {
    return declarators.filter(path => {
        const statement = path.parent;
        const parent = statement.parent;
        return _compareNativeType(statement.node?.type, jscodeshift.VariableDeclaration) 
            && parent 
            && (_compareNativeType(parent.node?.type, jscodeshift.Program)
                || (_compareNativeType(parent.node?.type, jscodeshift.ExportNamedDeclaration)
                    && _compareNativeType(parent.parent.node?.type, jscodeshift.Program)
                    )
                );
    });
}

function _filterGlobalFunctionDeclarations(declarators: jscodeshift.Collection): jscodeshift.Collection {
    return declarators.filter(path => {
        const parent = path.parent;
        return _compareNativeType(path.node?.type, jscodeshift.FunctionDeclaration)
            && parent 
            && (_compareNativeType(parent.node?.type, jscodeshift.Program)
                || (_compareNativeType(parent.node?.type, jscodeshift.ExportNamedDeclaration)
                    && _compareNativeType(parent.parent.node?.type, jscodeshift.Program)
                    )
                );
    });
}

function _filterGlobalExportNamedDeclaration(declarators: jscodeshift.Collection): jscodeshift.Collection {
    return declarators.filter(path => {
        const parent = path.parent;
        return _compareNativeType(path.node?.type, jscodeshift.ExportNamedDeclaration)
            && parent 
            && _compareNativeType(parent.node?.type, jscodeshift.Program);
    });
}

function _filterGlobalExportNamedDeclarationSpecifiers(declarators: jscodeshift.Collection): jscodeshift.Collection {
    return declarators.filter(path => {
        const statement = path.parent;
        const parent = statement.parent;
        return _compareNativeType(statement.node?.type, jscodeshift.ExportNamedDeclaration) 
            && parent 
            && _compareNativeType(parent.node?.type, jscodeshift.Program);
    });
}

function _filterObjectVariableDeclarators(declarators: jscodeshift.Collection): jscodeshift.Collection {
    return declarators.filter((path) => _compareNativeType(path.value.init?.type, jscodeshift.ObjectExpression));
}

function _filterFunctionVariableDeclarators(declarators: jscodeshift.Collection): jscodeshift.Collection {
    return declarators.filter((path) => _compareNativeType(path.value.init?.type, _functionExpressionNativeTypes));
}

interface GetInternalElementDeclaratorDeclarationOrSpecifierParams { 
    path: ASTPath<any>, 
    elementParams: JsCodeShiftCodeTransformerElementParameters
};

interface GetInternalElementParams { 
    valuePath: ASTPath<any>, 
    elementParams: JsCodeShiftCodeTransformerElementParameters
};

function _getInternalDeclaratorDeclarationOrSpecifier(params: GetInternalElementDeclaratorDeclarationOrSpecifierParams) {
    const { path, elementParams } = params;

    if (path == null) {
        throw Error('Value path is not specified!');
    }
    if (elementParams == null) {
        throw Error('Element parameters are not specified!');
    }

    var node = ('value' in path) ? path.value : (path as any)?.node;

    function _getUsualElementParamsForInstanciation(params: GetInternalElementDeclaratorDeclarationOrSpecifierParams) {
        const { path, elementParams } = params;
        return { instance: elementParams.instance, node: node, path: jscodeshift(path).paths()[0]!, collectionWithSingleElement: jscodeshift(path) };
    }

    if (node == null || typeof node !== 'object' || !('type' in node)) {
        return node;
    } else if (_compareNativeType(node.type, jscodeshift.VariableDeclaration)) {
        return new JsCodeShiftCodeTransformerVariableDeclaration(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(node.type, jscodeshift.VariableDeclarator)) {
        return new JsCodeShiftCodeTransformerVariableDeclarator(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(node.type, jscodeshift.FunctionDeclaration)) {
        return new JsCodeShiftCodeTransformerFunctionDeclaration(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(node.type, jscodeshift.ImportSpecifier)) {
        return new JsCodeShiftCodeTransformerImportSpecifier(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(node.type, jscodeshift.ImportNamespaceSpecifier)) {
        return new JsCodeShiftCodeTransformerImportNamespaceSpecifier(_getUsualElementParamsForInstanciation(params));
    } else {
        console.warn(`Unhandled type '${node.type}' whilst detecting declarator, declaration or specifier!`);
        return new JsCodeShiftCodeTransformerUnknownElement(_getUsualElementParamsForInstanciation(params));
    }
}

function _getInternalElement(params: GetInternalElementParams) {
    const { valuePath, elementParams } = params;

    if (valuePath == null) {
        throw Error('Value path is not specified!');
    }
    if (elementParams == null) {
        throw Error('Element parameters are not specified!');
    }

    var valueNode = ('value' in valuePath) ? valuePath.value : (valuePath as any)?.node;

    function _getUsualElementParamsForInstanciation(params: GetInternalElementParams) {
        const { valuePath, elementParams } = params;
        return { instance: elementParams.instance, node: valueNode, path: jscodeshift(valuePath).paths()[0]!, collectionWithSingleElement: jscodeshift(valuePath) };
    }

    if (valueNode == null || typeof valueNode !== 'object' || !('type' in valueNode)) {
        return valueNode;
    } else if (_compareNativeType(valueNode.type, jscodeshift.ObjectExpression)) {
        return new JsCodeShiftCodeTransformerObjectExpression(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(valueNode.type, jscodeshift.ArrayExpression)) {
        return new JsCodeShiftCodeTransformerArrayExpression(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(valueNode.type, jscodeshift.Literal)) {
        return new JsCodeShiftCodeTransformerLiteral(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(valueNode.type, jscodeshift.Identifier)) {
        return new JsCodeShiftCodeTransformerIdentifier(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(valueNode.type, _functionExpressionNativeTypes)) {
        return new JsCodeShiftCodeTransformerFunctionExpression(_getUsualElementParamsForInstanciation(params));
    } else if (_compareNativeType(valueNode.type, jscodeshift.UnaryExpression)) {
        return new JsCodeShiftCodeTransformerUnaryExpression(_getUsualElementParamsForInstanciation(params));
    } else {
        console.warn(`Unhandled type '${valueNode.type}' in object or array!`);
        return new JsCodeShiftCodeTransformerUnknownElement(_getUsualElementParamsForInstanciation(params));
    }
}

function _findImportDeclarations(root: jscodeshift.Collection<any>): jscodeshift.Collection<jscodeshift.ImportDeclaration> {
    return root
        .find(jscodeshift.ImportDeclaration, {

        });
}

function _findImportExpressions(root: jscodeshift.Collection<any>): jscodeshift.Collection<jscodeshift.ImportExpression> {
    return root
        .find(jscodeshift.ImportExpression, {

        });
}

function _findVariableDeclarators(root: jscodeshift.Collection<any>, name: string): jscodeshift.Collection<jscodeshift.VariableDeclarator> {
    return root
        .find(jscodeshift.VariableDeclarator, {
            id: { name },
        });
}

function _findFunctionDeclarations(root: jscodeshift.Collection<any>, name: string): jscodeshift.Collection<jscodeshift.FunctionDeclaration> {
    return root
        .find(jscodeshift.FunctionDeclaration, {
            id: { name }
        });
}

function _findNamedExportDeclarationSpecifierByLocalName(root: jscodeshift.Collection<any>, localName: string): jscodeshift.Collection<jscodeshift.ExportSpecifier> {
    return root
        .find(jscodeshift.ExportSpecifier, {
            local: { name: localName }
        });
}

function _findNamedExportDeclarationByExportedName(root: jscodeshift.Collection<any>, exportedName: string): jscodeshift.Collection<jscodeshift.ExportNamedDeclaration> {
    return root
        .find(jscodeshift.ExportNamedDeclaration, {})
        .filter(x => {
            if (typeof x === 'object' && x.value != null && typeof x.value === 'object' && x.value.declaration != null && typeof x.value.declaration === 'object') {
                if ('id' in x.value.declaration 
                        && x.value.declaration.id != null 
                        && typeof x.value.declaration.id === 'object' 
                        && (x.value.declaration.id as any).name === exportedName
                    ) {
                    return true;
                }
                if ('declarations' in x.value.declaration 
                        && x.value.declaration.declarations != null 
                        && Array.isArray(x.value.declaration.declarations) 
                        && x.value.declaration.declarations.some(y => 
                            typeof y === 'object' 
                            && 'id' in y 
                            && y.id != null 
                            && typeof y.id === 'object' 
                            && (y.id as any).name === exportedName
                        )
                    ) {
                    return true;
                }
            }
            return false;
        });
}

function _findNamedExportDeclarationSpecifierByExportedName(root: jscodeshift.Collection<any>, exportedName: string): jscodeshift.Collection<jscodeshift.ExportSpecifier> {
    return root
        .find(jscodeshift.ExportSpecifier, {
            exported: { name: exportedName }
        });
}

function _findNamedImportByLocalName(root: jscodeshift.Collection<any>, localName: string): jscodeshift.Collection<jscodeshift.ImportSpecifier> {
    return root
        .find(jscodeshift.ImportSpecifier, {
            type: 'ImportSpecifier',
            local: { name: localName }
        });
}

function _findNamespaceImportByLocalName(root: jscodeshift.Collection<any>, localName: string): jscodeshift.Collection<jscodeshift.ImportNamespaceSpecifier> {
    return root
        .find(jscodeshift.ImportNamespaceSpecifier, {
            type: 'ImportNamespaceSpecifier',
            local: { name: localName } // e.g., `* as tools`
        });
}

/**
 * Find the closest definition (VariableDeclarator or FunctionDeclaration)
 * for an Identifier by traversing parent scopes.
 *
 * @param {NodePath} identifierPath - The Identifier node path
 * @param {Collection} root - The jscodeshift root collection
 * @returns {NodePath|null} - Path to the defining node or null
 */
function _resolveBindingInNearestScope(identifierPath: ASTPath<any>, elementParams: JsCodeShiftCodeTransformerElementParameters): CodeTransformerVariableDeclarator | CodeTransformerFunctionDeclaration | CodeTransformerImportSpecifier | CodeTransformerImportNamespaceSpecifier | undefined {
    if (identifierPath == null) {
        throw Error('Identifier path is undefined!');
    }

    if (!identifierPath.node || typeof identifierPath.node !== 'object' || !_compareNativeType(identifierPath.node.type, jscodeshift.Identifier)) {
        return;
    }

    /**
     * Look for a declaration of `name` in the current scope or block.
     */
    function _findBindingInScope(path: ASTPath<any>, name: string, root: jscodeshift.Collection): ASTPath<any> | undefined {
        if (root == null) {
            throw Error('Root is invalid!');
        }

        if (name == null) {
            throw Error('Name is invalid!');
        }
        
        if (path == null) {
            throw Error('Path is undefined!');
        }
        
        const node = path.node;

        if (node == null) {
            return;
        }

        // Case 1: VariableDeclaration (const a = ..., let b, var c)
        if (_compareNativeType(node.type, jscodeshift.VariableDeclaration) 
            && Array.isArray(node.declarations)
        ) {
            for (const decl of node.declarations) {
                if (_compareNativeType(decl.id.type, jscodeshift.Identifier) && decl.id.name === name) {
                    return _findVariableDeclarators(root,  name).filter((p: ASTPath<any>) => p.get().parent.node === node).paths()[0];
                }
            }
        }

        // Case 2: FunctionDeclaration (function foo() {})
        if (_compareNativeType(node.type, jscodeshift.FunctionDeclaration)
            && node.id != null
            && typeof node.id === 'object'
            && node.id.name === name
        ) {
            return path;
        }

        // Case 3: Function / ArrowFunctionExpression assigned to variable
        // e.g., const fn = () => {}; → captured above via VariableDeclarator

        // Case 4: Parameter
        if (_compareNativeType(node.type, [jscodeshift.FunctionDeclaration, ..._functionExpressionNativeTypes])
            && Array.isArray(node.params)) {
            for (const param of node.params) {
                if (_compareNativeType(param.type, jscodeshift.Identifier) && param.name === name) {
                    return path; // function contains parameter
                }
            }
        }

        // Case 5: Catch clause: try { } catch(err) { }
        if (_compareNativeType(node.type, jscodeshift.CatchClause) && node.param?.name === name) {
            return path;
        }

        return;
    }

    const name = identifierPath.node.name;

    var currentPath = identifierPath.parentPath;

    if (currentPath == null) {
        return;
    }

    do {
        var binding = _findBindingInScope(currentPath, name, jscodeshift(currentPath));
        if (binding != null) {
            return _getInternalDeclaratorDeclarationOrSpecifier({ path: binding, elementParams });
        }

        var variableDeclaratorResults = _findVariableDeclarators(jscodeshift(currentPath), name).filter(x => (_compareNativeType(x.get().parent?.node?.type, jscodeshift.VariableDeclaration) ? x.get().parent?.parent : x.get().parent)?.node === currentPath.node);
        if (variableDeclaratorResults.length > 0) {
            var variableDeclaratorResult = variableDeclaratorResults.at(0);
            var variableDeclaratorPath = variableDeclaratorResult.paths()[0]!;
            return _getInternalDeclaratorDeclarationOrSpecifier({ path: variableDeclaratorPath, elementParams });
        }
        var functionDeclarationResults = _findFunctionDeclarations(jscodeshift(currentPath), name).filter(x => x.get().parent.node === currentPath.node);
        if (functionDeclarationResults.length > 0) {
            var functionDeclarationResult = functionDeclarationResults.at(0);
            var functionDeclarationPath = functionDeclarationResult.paths()[0]!;
            return _getInternalDeclaratorDeclarationOrSpecifier({ path: functionDeclarationPath, elementParams });
        }
        var namedImportResults = _findNamedImportByLocalName(jscodeshift(currentPath), name).filter(x => x.get().parent?.node != null && _compareNativeType(x.get().parent.node.type, jscodeshift.ImportDeclaration) && x.get().parent.parent?.node === currentPath.node);
        if (namedImportResults.length > 0) {
            var namedImportResult = namedImportResults.at(0);
            var namedImportPath = namedImportResult.paths()[0]!;
            return _getInternalDeclaratorDeclarationOrSpecifier({ path: namedImportPath, elementParams });
        }
        var namespaceImportResults = _findNamespaceImportByLocalName(jscodeshift(currentPath), name).filter(x => x.get().parent?.node != null && _compareNativeType(x.get().parent.node.type, jscodeshift.ImportDeclaration) && x.get().parent.parent?.node === currentPath.node);
        if (namespaceImportResults.length > 0) {
            var namespaceImportResult = namespaceImportResults.at(0);
            var namespaceImportPath = namespaceImportResult.paths()[0]!;
            return _getInternalDeclaratorDeclarationOrSpecifier({ path: namespaceImportPath, elementParams });
        }
        
        currentPath = currentPath.parent;
    } 
    while (currentPath != null);

    return; // not found
}

const codePartTypeToNativeTypes: { [key in CodePartType]: astTypes.Type<any>[] | null | undefined } = {
    [CodePartType.Unknown]: null,
    [CodePartType.ImportDeclaration]: [jscodeshift.ImportDeclaration],
    [CodePartType.ImportExpression]: [jscodeshift.ImportExpression],
    [CodePartType.ImportSpecifier]: [jscodeshift.ImportSpecifier],
    [CodePartType.ImportNamespaceSpecifier]: [jscodeshift.ImportNamespaceSpecifier],
    [CodePartType.ExportNamedDeclaration]: [jscodeshift.ExportNamedDeclaration],
    [CodePartType.ExportNamedDeclarationSpecifier]: [jscodeshift.ExportSpecifier],
    [CodePartType.VariableDeclaration]: [jscodeshift.VariableDeclaration],
    [CodePartType.VariableDeclarator]: [jscodeshift.VariableDeclarator],
    [CodePartType.Identifier]: [jscodeshift.Identifier],
    [CodePartType.Literal]: [jscodeshift.Literal],
    [CodePartType.UnaryExpression]: [jscodeshift.UnaryExpression],
    [CodePartType.ObjectExpression]: [jscodeshift.ObjectExpression],
    [CodePartType.ObjectKey]: [],
    [CodePartType.ObjectKeyValuePair]: [jscodeshift.Property],
    [CodePartType.ArrayExpression]: [jscodeshift.ArrayExpression],
    [CodePartType.FunctionExpression]: [jscodeshift.FunctionExpression, jscodeshift.ArrowFunctionExpression],
    [CodePartType.FunctionDeclaration]: [jscodeshift.FunctionDeclaration]
};

const _functionExpressionNativeTypes = codePartTypeToNativeTypes[CodePartType.FunctionExpression]!;

function _toSource(elementParams: JsCodeShiftCodeTransformerElementParameters) {
    if (elementParams == null) {
        throw Error('Invalid code transformer element parameters!');
    }
    if (elementParams.node == null) {
        throw Error('Invalid node!');
    }
    return jscodeshift(elementParams.node).toSource({ quote: 'single' });
}

interface JsCodeShiftCodeTransformerElementParameters extends CodeTransformerElementParameters {
    readonly instance: JsCodeShiftCodeTransformer;
    readonly node: any;
    readonly path: ASTPath<any>;
    readonly collectionWithSingleElement: jscodeshift.Collection<any>;
}

class JsCodeShiftCodeTransformerVariableDeclaration extends CodeTransformerVariableDeclaration<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.path == null || !_compareNativeType(elementParams.path.node?.type, jscodeshift.VariableDeclaration)) {
            throw Error('Invalid Variable Declaration!');
        }
        if (typeof elementParams.path !== 'object' || elementParams.path.__childCache == null || typeof elementParams.path.__childCache !== 'object' || !('declarations' in elementParams.path.__childCache) || elementParams.path.__childCache.declarations == null || typeof elementParams.path.__childCache.declarations !== 'object' || !('__childCache' in elementParams.path.__childCache.declarations) || elementParams.path.__childCache.declarations.__childCache == null || typeof elementParams.path.__childCache.declarations.__childCache !== 'object') {
            throw Error('Invalid Variable Declaration declarators!')
        }
        var declarators = Object.keys(elementParams.path.__childCache.declarations.__childCache).map(key => (elementParams.path.__childCache as any).declarations.__childCache[key]).map(d => new JsCodeShiftCodeTransformerVariableDeclarator({ node: d.node, path: jscodeshift(d).paths()[0]!, instance: elementParams.instance, collectionWithSingleElement: jscodeshift(d) }));
        super(elementParams, declarators);
    }

    toValue() {
        throw Error('toValue() in not implemented for Variable Declaration!');
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerVariableDeclarator extends CodeTransformerVariableDeclarator<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        var statement = elementParams.path?.parent;
        if (statement == null || !_compareNativeType(statement.node?.type, jscodeshift.VariableDeclaration)) {
            throw Error('Invalid Variable Declarator!');
        }
        var initValue;
        if (elementParams.path != null) {
            if (elementParams.path.value.init != null) {
                initValue = _getInternalElement({ valuePath: (elementParams.path.__childCache as any)?.init, elementParams: elementParams });
            } else {
                initValue = undefined;
            }
        }
        // TODO find changes to this variable down the line after declaration
        super(elementParams, initValue);
    }

    getName(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }

        if (this.elementParams.node == null) {
            throw Error('Invalid node!');
        }

        if (this.elementParams.node?.id?.name == null) {
            throw Error('Invalid node name!');
        }

        return this.elementParams.node.id.name;
    }

    toValue(): any {
        if (this.initValue == null) {
            return this.initValue;
        }
        return this.initValue.toValue();
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerLiteral extends CodeTransformerLiteral<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, jscodeshift.Literal)) {
            throw Error('Invalid Literal!');
        }
        super(elementParams);
    }

    toValue(): string | number | symbol | null | undefined {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }

        if (this.elementParams.node == null) {
            throw Error('Invalid node!');
        }

        return this.elementParams.node.value;
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerUnaryExpression extends CodeTransformerUnaryExpression<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, jscodeshift.UnaryExpression)) {
            throw Error('Invalid UnaryExpression!');
        }
        super(elementParams);
    }

    toValue() {
        throw Error('toValue() not supported in Unary Expression!');
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerObjectExpression extends CodeTransformerObjectExpression<JsCodeShiftCodeTransformerElementParameters> {
    elements: JsCodeShiftCodeTransformerObjectKeyValuePair[];
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, jscodeshift.ObjectExpression)) {
            throw Error('Invalid Object Expression!');
        }
        super(elementParams);

        const { node, path } = elementParams;

        const elements: JsCodeShiftCodeTransformerObjectKeyValuePair[] = [];
        var childPaths: ASTPath<any>[] = (path.__childCache as any)?.properties.__childCache;
        if (childPaths == null || typeof childPaths !== 'object' || Object.keys(childPaths).length !== node.properties.length || Object.keys(childPaths).some(key => childPaths[key as any] == null)) {
            throw Error('Invalid child paths!');
        }
        for (var key in childPaths) {
            childPaths[key] = jscodeshift(childPaths[key as any] as any).at(0).paths()[0]!;
        }
        for (var index = 0; index < node.properties.length; index++) {
            var prop = node.properties[index];
            elements[index] = new JsCodeShiftCodeTransformerObjectKeyValuePair({ node: prop, path: childPaths[index]!, collectionWithSingleElement: jscodeshift(childPaths[index]!), instance: elementParams.instance });
        }

        this.elements = elements;
    }

    toValue() {
        const obj: { [key: string | number | symbol]: any } = {};
        for (var i in this.elements) {
            var kvp = this.elements[i]?.toValue();
            if (kvp == null) {
                throw Error('Key value pair cannot be undefined!');
            }
            obj[(kvp.key as string | number | symbol)] = kvp.value;
        }
        return obj;
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerObjectKeyValuePair extends CodeTransformerObjectKeyValuePair<JsCodeShiftCodeTransformerElementParameters> {
    key: JsCodeShiftCodeTransformerObjectKey;
    value: CodeTransformerElement<JsCodeShiftCodeTransformerElementParameters> | null | undefined;
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, jscodeshift.Property)) {
            throw Error('Invalid Object Property!');
        }
        super(elementParams);

        const { node: prop, path } = elementParams;
        
        if (typeof prop !== 'object' || !('key' in prop) || !('value' in prop) || typeof prop['key'] !== 'object' || !('type' in prop['key'])) {
            throw Error('Invalid prop!');
        }

        this.key = new JsCodeShiftCodeTransformerObjectKey({ node: prop.key, path: jscodeshift((path.__childCache as any).key).paths()[0]!, collectionWithSingleElement: jscodeshift((path.__childCache as any).key), instance: elementParams.instance });
        this.value = _getInternalElement({ valuePath: jscodeshift((path.__childCache as any).value).paths()[0]!, elementParams: elementParams });
    }

    toValue(): { key: string | number | symbol, value: any } {
        if (this.key == null) {
            throw Error('Invalid key!');
        }
        return { key: this.key.toValue(), value: this.value?.toValue() }
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerObjectKey extends CodeTransformerObjectKey<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, [jscodeshift.Identifier, jscodeshift.Literal])) {
            throw Error('Invalid Object Key!');
        }
        super(elementParams);
    }

    toValue() {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (this.elementParams.node == null) {
            throw Error('Invalid node!');
        }

        var propKey = this.elementParams.node;

        return _compareNativeType(propKey.type, jscodeshift.Literal)
                ? propKey.value
                : propKey.name; 
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerArrayExpression extends CodeTransformerArrayExpression<JsCodeShiftCodeTransformerElementParameters> {
    elements: (CodeTransformerElement<JsCodeShiftCodeTransformerElementParameters> | null | undefined)[];
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, jscodeshift.ArrayExpression)) {
            throw Error('Invalid Array Expression!');
        }
        super(elementParams);

        const elements: CodeTransformerElement<JsCodeShiftCodeTransformerElementParameters>[] = [];
        
        const { node, path } = elementParams;

        var childPaths: ASTPath<any>[] = (path.__childCache as any)?.elements.__childCache;
        if (childPaths == null || typeof childPaths !== 'object' || Object.keys(childPaths).length !== node.elements.length || Object.keys(childPaths).some(key => childPaths[key as any] == null)) {
            throw Error('Invalid child paths!');
        }
        for (var key in childPaths) {
            childPaths[key] = jscodeshift(childPaths[key as any] as any).at(0).paths()[0]!;
        }
        for (var index = 0; index < node.elements.length; index++) {
            elements[index] = _getInternalElement({ valuePath: childPaths[index]!, elementParams: elementParams });
        }

        this.elements = elements;
    }

    toValue() {
        var arr: any[] = [];
        for (var i in this.elements) {
            arr[i] = this.elements[i]?.toValue();
        }
        return arr;
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerIdentifier extends CodeTransformerIdentifier<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, jscodeshift.Identifier)) {
            throw Error('Invalid Identifier!');
        }

        var bindingInScope = _resolveBindingInNearestScope(elementParams.path, elementParams);
        var innerElement: CodeTransformerVariableDeclarator | CodeTransformerFunctionDeclaration | CodeTransformerImportSpecifier | CodeTransformerImportNamespaceSpecifier | undefined = bindingInScope;
        if (innerElement == null) {
            throw Error('Variable or function by identifier not found (maybe not handled - not scope aware)!')
        }
        super(elementParams, innerElement);
    }

    getName(): string | undefined {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (this.elementParams.node == null) {
            throw Error('Invalid node!');
        }
        return this.elementParams.node.name;
    }

    toValue() {
        if (this.innerElement == null) {
            return this.innerElement;
        }
        return this.innerElement.toValue();
    }
    
    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerFunctionExpression extends CodeTransformerFunctionExpression<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, _functionExpressionNativeTypes)) {
            throw Error('Invalid Function Expression!');
        }
        super(elementParams);
    }

    toValue() {
        return new Function(`return (${this.toSource()})`)();
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerFunctionDeclaration extends CodeTransformerFunctionDeclaration<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.path == null || !_compareNativeType(elementParams.path.node?.type, jscodeshift.FunctionDeclaration)) {
            throw Error('Invalid Function Declaration!');
        }
        super(elementParams);
    }

    toValue() {
        return new Function(`return (${this.toSource()})`)();
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerImportDeclaration extends CodeTransformerImportDeclaration<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.path == null || !_compareNativeType(elementParams.path.node?.type, jscodeshift.ImportDeclaration)) {
            throw Error('Invalid Import Declaration!');
        }
        super(elementParams);
    }

    toValue() {
        throw Error('toValue() not supported in Import Declaration!')
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerImportExpression extends CodeTransformerImportExpression<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null || !_compareNativeType(elementParams.node?.type, jscodeshift.ImportExpression)) {
            throw Error('Invalid Import Expression!');
        }
        super(elementParams);
    }

    getFunctionSignature(): string | undefined {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (this.elementParams.path == null) {
            throw Error('Invalid path!');
        }
        var scope = jscodeshift(this.elementParams.path).closestScope();
        var scopeNodes = scope.nodes();
        if (scope.length === 0 || scopeNodes.length === 0) {
            return;
        }
        var node: any = scopeNodes[0]!;
        if (!_compareNativeType(node.type, [jscodeshift.FunctionDeclaration, ..._functionExpressionNativeTypes])) {
            return;
        }
        
        return `${node.id?.name ?? ''}(${(node.elementParams as any[])?.map(x => x.name) ?? ''})`;
    }

    toValue() {
        throw Error('toValue() not supported in Import Expression!')
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerImportSpecifier extends CodeTransformerImportSpecifier<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null) {
            throw Error('Invalid Node!');
        }
        super(elementParams);
    }

    toValue() {
        throw Error('toValue() not supported in Import Specifier!')
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerImportNamespaceSpecifier extends CodeTransformerImportNamespaceSpecifier<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null) {
            throw Error('Invalid Node!');
        }
        super(elementParams);
    }

    toValue() {
        throw Error('toValue() not supported in Import Namespace Specifier!')
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerExportNamedDeclaration extends CodeTransformerExportNamedDeclaration<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null) {
            throw Error('Invalid Node!');
        }

        if (elementParams.path.__childCache == null || typeof elementParams.path.__childCache !== 'object') {
            throw Error('Invalid __childCache!');
        }

        var innerValue = _getInternalDeclaratorDeclarationOrSpecifier({ path: jscodeshift((elementParams.path.__childCache as any).declaration).paths()[0]!, elementParams });

        super(elementParams, innerValue);
    }

    toValue() {
        throw Error('toValue() not supported in Export Named Declaration!')
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerExportNamedDeclarationSpecifier extends CodeTransformerExportNamedDeclarationSpecifier<JsCodeShiftCodeTransformerElementParameters> {
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null) {
            throw Error('Invalid Node!');
        }

        if (elementParams.path == null) {
            throw Error('Invalid Path!');
        }

        if (elementParams.path.__childCache == null || typeof elementParams.path.__childCache !== 'object' || !('local' in elementParams.path.__childCache)) {
            throw Error('Invalid __childCache!');
        }

        var innerValue = _getInternalElement({ valuePath: jscodeshift(elementParams.path.__childCache?.local as ASTPath<any>).paths()[0] as ASTPath<any>, elementParams });

        super(elementParams, innerValue);
    }

    toValue() {
        throw Error('toValue() not supported in Export Named Declaration Specifier!')
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}

class JsCodeShiftCodeTransformerUnknownElement extends CodeTransformerElement<JsCodeShiftCodeTransformerElementParameters> {
    type: CodePartType = CodePartType.Unknown;
    constructor(elementParams: JsCodeShiftCodeTransformerElementParameters) {
        if (elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        if (elementParams.node == null) {
            throw Error('Invalid Node!');
        }
        super(elementParams);
    }

    toValue() {
        throw Error('toValue() not supported in Unknown Element!')
    }

    toSource(): string {
        if (this.elementParams == null) {
            throw Error('Invalid code transformer element parameters!');
        }
        return _toSource(this.elementParams);
    }
}
