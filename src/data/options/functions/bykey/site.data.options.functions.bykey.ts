import { transformIntoSeparateFunctionsAndContext } from "../site.data.options.functions.js";
import type { CustomFunction, CustomFunctionsWithContext, FunctionContextOnly, SiteData } from "../../../site.data.types.js";
import type { SiteDataOptions } from "../../site.data.options.js";
import { __siteDataOptionsFunctionsByKeyFilePath, siteDataOptionsFunctionsByKey } from "./site.data.options.functions.bykey.functions.js";
import { nameOf } from "../../../../helpers/helpers.general.js";

export const handleSiteDataOptionsFunctionsByKey = async function (data: SiteData, options: SiteDataOptions): Promise<SiteData> {
    if (data === undefined || data === null) {
        throw Error('Undefined data object!');
    }

    if (data.content === undefined || data.content === null) {
        throw Error('Undefined data content!');
    }

    var _data = structuredClone(data);
    
    const defaultKeyProperty = 'key';
    const defaultFunctionsObjectProperty = 'functions';

    var siteDataOptionsFunctionsByKeyTransformation = await transformIntoSeparateFunctionsAndContext<typeof siteDataOptionsFunctionsByKey>({ 
        filePath: __siteDataOptionsFunctionsByKeyFilePath, 
        exportedNameOfVariableObjectWithFunctions: nameOf(() => siteDataOptionsFunctionsByKey),
        exportedNameOfVariableFilePath: nameOf(() => __siteDataOptionsFunctionsByKeyFilePath)
    });

    if (siteDataOptionsFunctionsByKeyTransformation == null || !siteDataOptionsFunctionsByKeyTransformation.success) {
        throw Error(`Failed to transform by key functions file! Error: ${JSON.stringify(siteDataOptionsFunctionsByKeyTransformation.error)}`);
    }

    const siteDataOptionsFunctionsByKeyTransformationResult = siteDataOptionsFunctionsByKeyTransformation.result;

    for (const byKeyKey in siteDataOptionsFunctionsByKeyTransformationResult.objectWithFunctionsTransformed) {
        var entry = siteDataOptionsFunctionsByKeyTransformationResult.objectWithFunctionsTransformed[byKeyKey];
        if (entry === undefined || entry === null) {
            continue;
        }
        var keyProperty: string = ((entry?.keyProperty ?? '').toString().trim() === '') ? defaultKeyProperty : (entry.keyProperty ?? defaultKeyProperty);
        var keyValue = entry.key;
        var location: string[][] = 
            (!Array.isArray(entry.location) 
                ? ((entry.location === undefined || entry.location === null) ? [] : [entry.location]) 
                : entry.location)
            .filter(x => x !== undefined && x !== null)
            .map(x => !Array.isArray(x) ? [x] : x)
            .filter(x => x.length > 0);
        var functionsDeclarations = entry.functionsDeclarations;

        for (var locationKey in location) {
            var locationEntry = location[locationKey];

            // get full paths
            var pathsFound = findFullPathsInObjectRecursively(_data, locationEntry ?? [], keyProperty, []);
            
            for (var pathsFoundKey = 0; pathsFoundKey < pathsFound.length; pathsFoundKey++) {
                var pathFound = pathsFound[pathsFoundKey] ?? [];
                var obj: any = _data;
                var skip: boolean = false;
                for (var pathFoundKey = 0; pathFoundKey < pathFound.length; pathFoundKey++) {
                    var pathPart = pathFound[pathFoundKey];
                    if (pathPart === undefined || pathPart === null) {
                        console.error('Invalid path part! Undefined or null!');
                        skip = true;
                        break;
                    }
                    if (!(pathPart in obj)) {
                        console.error('Path part not in object!');
                        skip = true;
                        break;
                    }
                    obj = obj[pathPart];
                }
                if (skip || obj[keyProperty] !== keyValue) {
                    continue;
                }

                // loop for all functionDeclarations
                for (var functionsDeclarationIndex = 0; functionsDeclarationIndex < functionsDeclarations.length; functionsDeclarationIndex++) {
                    var functionsDeclaration = functionsDeclarations[functionsDeclarationIndex];
                    var functionsObjectPropertyLocation = 
                        (functionsDeclaration?.functionsObjectPropertyLocationNonInclusive === undefined || functionsDeclaration?.functionsObjectPropertyLocationNonInclusive === null || !Array.isArray(functionsDeclaration?.functionsObjectPropertyLocationNonInclusive) || functionsDeclaration.functionsObjectPropertyLocationNonInclusive.length === 0) 
                            ? []
                            : functionsDeclaration.functionsObjectPropertyLocationNonInclusive;
                    
                    var functionsObjectProperty = functionsDeclaration?.functionsObjectProperty ?? defaultFunctionsObjectProperty;

                    var functionsObjectPathsFound = findFullPathsInObjectRecursively(obj, functionsObjectPropertyLocation, functionsObjectProperty, []);
                    if (functionsObjectPathsFound.length === 0) {
                        functionsObjectPathsFound = [[]];
                    }

                    var customFunctions = functionsDeclaration?.functions ?? [];

                    for (var functionsObjectPathsFoundKey = 0; functionsObjectPathsFoundKey < functionsObjectPathsFound.length; functionsObjectPathsFoundKey++) {
                        var functionsObjectPathFound = functionsObjectPathsFound[functionsObjectPathsFoundKey] ?? [];
                        var obj2 = obj;
                        var skip2: boolean = false;
                        for (var functionsObjectPathFoundKey in functionsObjectPathFound) {
                            var functionsObjectPathPart = functionsObjectPathFound[functionsObjectPathFoundKey];
                            if (functionsObjectPathPart === undefined || functionsObjectPathPart === null) {
                                console.error('Invalid functions path part! Undefined or null!');
                                skip2 = true;
                                break;
                            }
                            if (!(functionsObjectPathPart in obj)) {
                                console.error('Functions path part not in object!');
                                skip2 = true;
                                break;
                            }
                            obj2 = obj2[functionsObjectPathPart];
                        }
                        if (skip2) {
                            continue;
                        }

                        var preexistentFunctions = ((obj2[functionsObjectProperty] as CustomFunction[]) || []);

                        obj2[functionsObjectProperty] = [
                            ...preexistentFunctions, 
                            ...customFunctions
                                .filter(x => (x.nameInternal == null 
                                                || !preexistentFunctions
                                                        .filter(x => x.nameInternal != null)
                                                        .some(y => y.nameInternal === x.nameInternal)
                                            ) 
                                            && !preexistentFunctions
                                                    .some(y => y.name === x.name) 
                                )
                        ] satisfies CustomFunction[];
                    }
                }
            }
        }
    }

    _data.content.keyFunctions = {
        context: ((data.content.keyFunctions?.context ?? '') + '\r\n' + siteDataOptionsFunctionsByKeyTransformationResult.context).trim()
    };

    return _data;
}

function findFullPathsInObjectRecursively(obj: any, locationSpecifiedRemaining: string[], keyProperty: string, currentLocation: string[] = []): string[][] {
    currentLocation = currentLocation ?? [];

    if (locationSpecifiedRemaining.length === 0 && currentLocation.length > 0 && currentLocation[currentLocation.length - 1] === keyProperty) {
        return [currentLocation.slice(0, currentLocation.length - 1)];
    }

    var matchedPaths: string[][] = [];

    if (typeof obj === 'object' && obj !== null) {
        for (var objKey in obj) {
            const _locationSpecifiedRemaining = 
                locationSpecifiedRemaining.length > 0 && objKey === locationSpecifiedRemaining[0]
                    ? locationSpecifiedRemaining.slice(1)
                    : [...locationSpecifiedRemaining];
            var _matchedPaths = findFullPathsInObjectRecursively(obj[objKey], _locationSpecifiedRemaining, keyProperty, [...currentLocation, objKey]);
            matchedPaths.push(..._matchedPaths);
        }
    }
    
    return matchedPaths;
}
