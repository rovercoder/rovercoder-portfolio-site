import type { SiteDataOptionsFunctionsDeclarations } from "../site.data.options.functions.types.js";
import type { siteDataOptionsFunctionsUtilities } from "./site.data.options.functions.utilities.functions.js";

type SiteDataOptionsFunctionsUtilitiesKeysForFunctions = {
    [K in keyof typeof siteDataOptionsFunctionsUtilities]:
        (typeof siteDataOptionsFunctionsUtilities)[K] extends { canBeAccessedFromOtherFunctions: true }
            ? K
            : never;
}[keyof typeof siteDataOptionsFunctionsUtilities];

type SiteDataOptionsFunctionsUtilitiesKeyFunctionsForFunctions = Pick<typeof siteDataOptionsFunctionsUtilities, SiteDataOptionsFunctionsUtilitiesKeysForFunctions>;

export type SiteDataOptionsFunctionsUtilitiesForFunctions = { 
    [K in keyof SiteDataOptionsFunctionsUtilitiesKeyFunctionsForFunctions]: SiteDataOptionsFunctionsUtilitiesKeyFunctionsForFunctions[K]['function'] 
};

export type SiteDataOptionsFunctionsUtilities = SiteDataOptionsFunctionsDeclarations;
