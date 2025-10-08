import type { siteDataOptionsFunctionsByKey } from "./bykey/site.data.options.functions.bykey.functions.js";
import type { siteDataOptionsFunctionsUtilities } from "./utilities/site.data.options.functions.utilities.functions.js";

export interface DateTypeStrictDateOnly {
    year: number, 
    month: number, 
    day: number,
    timeZone: string
}

export interface DateTypeStrict extends DateTypeStrictDateOnly {
    hours?: number | undefined, 
    minutes?: number | undefined, 
    seconds?: number | undefined, 
    milliSeconds?: number | undefined
}

export interface DateTypePartial extends Partial<DateTypeStrict> {}

export interface DateTypePartialWithoutTimeZone extends Omit<DateTypePartial, "timeZone"> {}

export interface DateTypeStrictForParsing {
    year: number | string, 
    month: number | string, 
    day: number | string, 
    hours?: number | string | undefined, 
    minutes?: number | string | undefined, 
    seconds?: number | string | undefined, 
    milliSeconds?: number | string | undefined, 
    timeZone: string
}

export interface DateTypeStrictForParsingExpanded extends DateTypeStrictForParsing {
    startOfDateNotEndOfDate?: boolean
}

export interface DateTypePartialForParsing extends Partial<DateTypeStrictForParsing> {};

export interface DateTypePartialForParsingWithoutTimeZone extends Omit<DateTypePartialForParsing, "timeZone"> {};

export interface SiteDataOptionsFunction {
    readonly function: Function;
    readonly canBeAccessedFromOtherFunctions: boolean;
}

export type SiteDataOptionsFunctionsDeclarations = { [functionName: string]: SiteDataOptionsFunction };

