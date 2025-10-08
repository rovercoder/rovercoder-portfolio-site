import { transformIntoSeparateFunctionsAndContext } from '../site.data.options.functions.js';
import type { CustomFunctionsWithContext, SiteData } from '../../../site.data.types.js';
import type { SiteDataOptions } from '../../site.data.options.js';
import { siteDataOptionsFunctionsUtilities, __siteDataOptionsFunctionsUtilitiesFilePath } from './site.data.options.functions.utilities.functions.js';
import { nameOf } from '../../../../helpers/helpers.general.js';

export const handleSiteDataOptionsFunctionsUtilities = async function (data: SiteData, options: SiteDataOptions): Promise<SiteData> {
    if (data === undefined || data === null) {
        throw Error('Undefined data object!');
    }

    if (data.content === undefined || data.content === null) {
        throw Error('Undefined data content!');
    }

    var siteDataOptionsFunctionsUtilitiesTransformation = await transformIntoSeparateFunctionsAndContext<typeof siteDataOptionsFunctionsUtilities>({ 
        filePath: __siteDataOptionsFunctionsUtilitiesFilePath, 
        exportedNameOfVariableObjectWithFunctions: nameOf(() => siteDataOptionsFunctionsUtilities),
        exportedNameOfVariableFilePath: nameOf(() => __siteDataOptionsFunctionsUtilitiesFilePath)
    });

    if (siteDataOptionsFunctionsUtilitiesTransformation == null || !siteDataOptionsFunctionsUtilitiesTransformation.success) {
        throw Error(`Failed to transform utility functions file! Error: ${JSON.stringify(siteDataOptionsFunctionsUtilitiesTransformation.error)}`);
    }

    const siteDataOptionsFunctionsUtilitiesTransformationResult = siteDataOptionsFunctionsUtilitiesTransformation.result;

    var preexistentFunctions = (data.content.utilityFunctions?.functions ?? []);

    var utilityFunctions: CustomFunctionsWithContext = { 
        context: ((data.content.utilityFunctions?.context ?? '') + '\r\n' + siteDataOptionsFunctionsUtilitiesTransformationResult.context).trim(), 
        functions: [
            ...preexistentFunctions,
            ...siteDataOptionsFunctionsUtilitiesTransformationResult.objectWithFunctionsTransformed
                .filter(x => (x.nameInternal == null 
                                || !preexistentFunctions
                                        .filter(x => x.nameInternal != null)
                                        .some(y => y.nameInternal === x.nameInternal)
                            ) 
                            && !preexistentFunctions
                                    .some(y => y.name === x.name) 
                )
        ].filter(x => !!x) 
    };

    var _data = structuredClone(data);
    _data.content.utilityFunctions = { 
        context: utilityFunctions.context, 
        functions: utilityFunctions.functions
    };
    return _data;
}
