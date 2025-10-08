import { TZDate } from "@date-fns/tz";
import { fields } from "../../../../helpers/helpers.general.js";
import type { SiteDataOptionsFunctionsByKey } from "./site.data.options.functions.bykey.types.js";
import type { SiteDataOptionsFunctionsUtilitiesForFunctions } from "../utilities/site.data.options.functions.utilities.types.js";
import type { Experience, HolidaysRestAndLeaveEntry } from "../../../site.data.types.js";

export const siteDataOptionsFunctionsByKey: SiteDataOptionsFunctionsByKey = [
    {
        location: [fields<Experience>().holidaysRestAndLeaveEntries],
        keyProperty: 'key',
        key: 'holiday-rest-leave-entry#public-holidays-malta',
        functionsDeclarations: [
            {
                functionsObjectProperty: fields<HolidaysRestAndLeaveEntry>().functions,
                functions: {
                    getCatholicEasterSundayByYear: {
                        function: function (year: number, timeZone: string, utilities: SiteDataOptionsFunctionsUtilitiesForFunctions): TZDate | Date {
                            let month = 3; // March
                            const a = (year % 19) + 1;
                            const b = Math.floor(year / 100) + 1;
                            const c = Math.floor((3 * b) / 4) - 12;
                            const d = Math.floor((8 * b + 5) / 25) - 5;
                            const e = Math.floor((5 * year) / 4) - c - 10;
                            let f = (11 * a + 20 + d - c) % 30;

                            // Adjustments
                            if (f === 24) f += 1;
                            if (f === 25 && a > 11) f += 1;

                            let g = 44 - f;
                            if (g < 21) g += 30;

                            let day = (g + 7) - ((e + g) % 7);

                            if (day > 31) {
                                day -= 31;
                                month = 4; // April
                            }

                            return utilities.areTimeZonesSupported() 
                                ? new TZDate(year, month - 1, day, timeZone) 
                                : new Date(year, month - 1, day); // JS months are 0-indexed (0 = Jan)
                        },
                        canBeAccessedFromOtherFunctions: true
                    }
                }
            }
        ]
    }
];

export const __siteDataOptionsFunctionsByKeyFilePath = import.meta.url;
