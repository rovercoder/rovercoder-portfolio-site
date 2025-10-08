import { isAfter, eachMonthOfInterval, getDaysInMonth, startOfDay, endOfDay, addHours, addMinutes, addSeconds, addMilliseconds } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { TZDate } from '@date-fns/tz';
import type { DateTypePartialForParsingWithoutTimeZone, DateTypePartialWithoutTimeZone, DateTypeStrict, DateTypeStrictForParsing, DateTypeStrictForParsingExpanded } from '../site.data.options.functions.types.js';
import type { SiteDataOptionsFunctionsUtilities } from './site.data.options.functions.utilities.types.js';

function getStartDateAndEndDate(obj: { dates: { baseDate?: DateTypePartialForParsingWithoutTimeZone, startDate?: DateTypePartialForParsingWithoutTimeZone, endDate?: DateTypePartialForParsingWithoutTimeZone, timeZone: string }, fillDateProps?: DateTypePartialWithoutTimeZone }): { value?: { startDate: TZDate | Date, endDate: TZDate | Date } | undefined, valid: boolean, error?: { type: string, message: string } | undefined } {
    if (isUndefinedOrNull(obj)) {
        return { valid: false, error: { type: 'arguments', message: 'Parameter `obj` is undefined!' } };
    }

    if (isUndefinedOrNull(obj.dates)) {
        return { valid: false, error: { type: 'arguments', message: 'Parameter `obj.dates` is undefined!' } };
    }

    function _firstDefinedAndNonNullOrElseUndefined<T>(args: (T | undefined)[]): T | undefined {
        return args.find(x => !isUndefinedOrNull(x));
    }
    
    var startDateYear = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.startDate?.year, obj.dates.baseDate?.year, obj.fillDateProps?.year]);
    if (isUndefinedOrNull(startDateYear)) {
        return { valid: false, error: { type: 'arguments', message: 'Start date year is unspecified!' } };
    }

    var startDateMonth = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.startDate?.month, obj.dates.baseDate?.month, obj.fillDateProps?.month]);
    if (isUndefinedOrNull(startDateMonth)) {
        return { valid: false, error: { type: 'arguments', message: 'Start date month is unspecified!' } };
    }

    var startDateDay = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.startDate?.day, obj.dates.baseDate?.day, obj.fillDateProps?.day]);
    if (isUndefinedOrNull(startDateDay)) {
        return { valid: false, error: { type: 'arguments', message: 'Start date day is unspecified!' } };
    }

    var startDateHours = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.startDate?.hours, obj.dates.baseDate?.hours, obj.fillDateProps?.hours]),
        startDateMinutes = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.startDate?.minutes, obj.dates.baseDate?.minutes, obj.fillDateProps?.minutes]),
        startDateSeconds = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.startDate?.seconds, obj.dates.baseDate?.seconds, obj.fillDateProps?.seconds]),
        startDateMilliSeconds = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.startDate?.milliSeconds, obj.dates.baseDate?.milliSeconds, obj.fillDateProps?.milliSeconds]);

    var endDateYear = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.endDate?.year, obj.dates.baseDate?.year, obj.fillDateProps?.year]);
    if (isUndefinedOrNull(endDateYear)) {
        return { valid: false, error: { type: 'arguments', message: 'End date year is unspecified!' } };
    }

    var endDateMonth = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.endDate?.month, obj.dates.baseDate?.month, obj.fillDateProps?.month]);
    if (isUndefinedOrNull(endDateMonth)) {
        return { valid: false, error: { type: 'arguments', message: 'End date month is unspecified!' } };
    }

    var endDateDay = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.endDate?.day, obj.dates.baseDate?.day, obj.fillDateProps?.day]);
    if (isUndefinedOrNull(endDateDay)) {
        return { valid: false, error: { type: 'arguments', message: 'End date day is unspecified!' } };
    }

    var endDateHours = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.endDate?.hours, obj.dates.baseDate?.hours, obj.fillDateProps?.hours]),
        endDateMinutes = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.endDate?.minutes, obj.dates.baseDate?.minutes, obj.fillDateProps?.minutes]),
        endDateSeconds = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.endDate?.seconds, obj.dates.baseDate?.seconds, obj.fillDateProps?.seconds]),
        endDateMilliSeconds = _firstDefinedAndNonNullOrElseUndefined<string|number|undefined>([obj.dates.endDate?.milliSeconds, obj.dates.baseDate?.milliSeconds, obj.fillDateProps?.milliSeconds]);

    var timeZone = obj.dates.timeZone;

    var startDateValidationResult = validateAndCleanDate({
        year: startDateYear!,
        month: startDateMonth!,
        day: startDateDay!,
        hours: startDateHours,
        minutes: startDateMinutes,
        seconds: startDateSeconds,
        milliSeconds: startDateMilliSeconds,
        timeZone: timeZone
    });

    if (!isTrue(startDateValidationResult.valid) || isUndefinedOrNull(startDateValidationResult.value)) {
        return { ...startDateValidationResult, value: undefined };
    }

    var endDateValidationResult = validateAndCleanDate({
        year: endDateYear!,
        month: endDateMonth!,
        day: endDateDay!,
        hours: endDateHours,
        minutes: endDateMinutes,
        seconds: endDateSeconds,
        milliSeconds: endDateMilliSeconds,
        timeZone: timeZone
    });

    if (!isTrue(endDateValidationResult.valid) || isUndefinedOrNull(endDateValidationResult.value)) {
        return { ...endDateValidationResult, value: undefined };
    }

    var startDateResult = buildDate({
        ...startDateValidationResult.value!,
        startOfDateNotEndOfDate: true
    });
    if (!isTrue(startDateResult.valid) || isUndefinedOrNull(startDateResult.value)) {
        return { ...startDateResult, value: undefined };
    }

    var endDateResult = buildDate({
        ...endDateValidationResult.value!,
        startOfDateNotEndOfDate: (isUndefinedOrNull(obj.dates.endDate) && isUndefinedOrNull(endDateValidationResult.value!.hours) && isUndefinedOrNull(endDateValidationResult.value!.minutes) && isUndefinedOrNull(endDateValidationResult.value!.seconds) && isUndefinedOrNull(endDateValidationResult.value!.milliSeconds)) ? false : true
    });
    if (!isTrue(endDateResult.valid) || isUndefinedOrNull(endDateResult.value)) {
        return { ...endDateResult, value: undefined };
    }

    if (isAfter(startDateResult.value!, endDateResult.value!)) {
        return { valid: false, error: { type: 'arguments', message: 'Start date is after end date!' } };
    }

    return { value: { startDate: startDateResult.value!, endDate: endDateResult.value! }, valid: true };
}

function validateAndCleanDate(dateObj: DateTypeStrictForParsing): { value?: DateTypeStrict, valid: boolean, error?: { type: string, message: string } } {
    if (isUndefinedOrNull(dateObj)) {
        return { valid: false, error: { type: 'arguments', message: 'Argument `dateObj` is empty!' } };
    }

    if (!isValidYear(dateObj.year)) {
        return { valid: false, error: { type: 'arguments', message: `Invalid year! Year: ${dateObj.year}` } };
    }

    var year = getValidYear(dateObj.year!);

    if (!isValidMonth({ month: dateObj.month, year: year })) {
        return { valid: false, error: { type: 'arguments', message: `Invalid month! Month: ${dateObj.month}` } };
    }

    var month = getValidMonth({ month: dateObj.month, year: year });

    var monthForJavaScriptDate = month - 1;

    if (!isValidDay({ day: dateObj.day, month: month, year: year })) {
        return { valid: false, error: { type: 'arguments', message: `Invalid day! Day: ${dateObj.day}` } };
    }

    var day = getValidDay({ day: dateObj.day, month: month, year: year });

    var timeZone = dateObj.timeZone?.toString().trim() ?? '';
    var isTimeZoneValid = isValidTimeZone(timeZone);
    if (!isTrue(isTimeZoneValid) && !isUndefinedOrNull(isTimeZoneValid)) {
        return { valid: false, error: { type: 'arguments', message: `Invalid timeZone! TimeZone: ${dateObj.timeZone}` } };
    }
    
    var hours: number | undefined;
    if (!isUndefinedOrNull(dateObj.hours)) {
        if (isValidHours(dateObj.hours)) {
            hours = getValidHours(dateObj.hours);
        } else {
            return { valid: false, error: { type: 'arguments', message: `Invalid hours! Hours: ${dateObj.hours}` } };
        }
    }
    
    var minutes: number | undefined;
    if (!isUndefinedOrNull(dateObj.minutes)) {
        if (isValidMinutes(dateObj.minutes)) {
            minutes = getValidMinutes(dateObj.minutes);
        } else {
            return { valid: false, error: { type: 'arguments', message: `Invalid minutes! Minutes: ${dateObj.minutes}` } };
        }
    }
    
    var seconds: number | undefined;
    if (!isUndefinedOrNull(dateObj.seconds)) {
        if (isValidSeconds(dateObj.seconds)) {
            seconds = getValidSeconds(dateObj.seconds);
        } else {
            return { valid: false, error: { type: 'arguments', message: `Invalid seconds! Seconds: ${dateObj.seconds}` } };
        }
    }

    var milliseconds: number | undefined;
    if (!isUndefinedOrNull(dateObj.milliSeconds)) {
        if (isValidMilliSeconds(dateObj.milliSeconds)) {
            milliseconds = getValidMilliSeconds(dateObj.milliSeconds);
        } else {
            return { valid: false, error: { type: 'arguments', message: `Invalid milliseconds! MilliSeconds: ${dateObj.milliSeconds}` } };
        }
    }

    return { 
        value: {
            year: year,
            month: month,
            day: day,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            milliSeconds: milliseconds,
            timeZone: timeZone
        }, 
        valid: true 
    };
}

function buildDate(dateObj: DateTypeStrictForParsingExpanded): { value?: TZDate | Date | undefined, valid: boolean, error?: { type: string, message: string } } {

    var result = validateAndCleanDate(dateObj);
    if (!isTrue(result.valid) || isUndefinedOrNull(result.value)) {
        return { ...result, value: undefined };
    }
    
    var date: TZDate | Date = 
        areTimeZonesSupported() 
            ? new TZDate(result.value!.year, result.value!.month - 1, result.value!.day, result.value!.timeZone) 
            : new Date(result.value!.year, result.value!.month - 1, result.value!.day);

    if (isTrue(dateObj.startOfDateNotEndOfDate)) {
        date = startOfDay(date);
    } else if (isFalse(dateObj.startOfDateNotEndOfDate)) {
        date = endOfDay(date);
    }
    
    if (!isUndefinedOrNull(result.value!.hours)) {
        date.setHours(result.value!.hours!);
    }

    if (!isUndefinedOrNull(result.value!.minutes)) {
        date.setMinutes(result.value!.minutes!);
    }

    if (!isUndefinedOrNull(result.value!.seconds)) {
        date.setSeconds(result.value!.seconds!);
    }

    if (!isUndefinedOrNull(result.value!.milliSeconds)) {
        date.setMilliseconds(result.value!.milliSeconds!);
    }

    return { value: date, valid: true };
}

function isValidYear(year: string | number | undefined): boolean {
    return !(isUndefinedOrNull(year) || isNaN(year!.toString().trim() as any) || isNaN(parseFloat(year!.toString().trim())) || parseInt(year!.toString().trim()).toString().length < 4);
}

function getValidYear(year: string | number): number {
    if (!isValidYear(year)) {
        throw Error(`Year (${year}) is invalid!`);
    }
    return parseInt(year!.toString().trim());
}

function isValidMonth(obj: { month: string | number | undefined, year: number }): boolean {
    return !isUndefinedOrNull(_getValidMonthOrUndefined(obj));
}

function getValidMonth(obj: { month: string | number | undefined, year: number }): number {
    var month = _getValidMonthOrUndefined(obj);
    if (isUndefinedOrNull(month)) {
        throw Error(`Month (${obj?.month}) is invalid!`);
    }
    return month!;
}

function _getValidMonthOrUndefined(obj: { month: string | number | undefined, year: number }): number | undefined {    
    if (isUndefinedOrNull(obj)) {
        throw Error('Invalid obj parameter!');
    }

    if (!isValidYear(obj.year)) {
        throw Error(`Invalid obj.year parameter! Year: ${obj.year}`);
    }
    
    var allMonths = eachMonthOfInterval({ start: new Date(obj.year, 1, 1), end: new Date(obj.year + 1, 1, 1) }).map(x => x.getMonth()).map(x => x + 1);
    allMonths = allMonths.filter((item, pos) => allMonths.indexOf(item) == pos);
    allMonths.sort();
    var allMonthsNames = allMonths.map(x => [x, enUS.localize.month(x - 1 as any, { width: 'abbreviated' }), enUS.localize.month(x - 1 as any, { width: 'wide' })]);

    var month;
    if (!isUndefinedOrNull(obj.month)) {
        var monthStringLowerCased = obj.month!.toString().trim().toLowerCase();
        if (!isNaN(obj.month!.toString().trim() as unknown as number) && !isNaN(parseFloat(obj.month!.toString().trim()))) {
            month = allMonths.find(x => x === parseInt(monthStringLowerCased));
        } else {
            var _monthNames = allMonthsNames.find(x => x.some(y => y.toString().trim().toLowerCase() === monthStringLowerCased));
            if (_monthNames !== undefined && _monthNames !== null) {
                month = _monthNames[0] as number;
            }
        }
    }
    return month;
}

function isValidDay(obj: { day: string | number | undefined, month: number, year: number }): boolean {
    return !isUndefinedOrNull(_getValidDayOrUndefined(obj));
}

function getValidDay(obj: { day: string | number | undefined, month: number, year: number }): number {
    var day = _getValidDayOrUndefined(obj);
    if (isUndefinedOrNull(day)) {
        throw Error(`Day (${obj?.day}) is invalid!`);
    }
    return day!;
}

function _getValidDayOrUndefined(obj: { day: string | number | undefined, month: number, year: number }): number | undefined {
    if (isUndefinedOrNull(obj)) {
        throw Error('Invalid obj parameter!');
    }

    if (!isValidYear(obj.year)) {
        throw Error(`Invalid obj.year parameter! Year: ${obj.year}`);
    }

    if (!isValidMonth({month: obj.month, year: obj.year })) {
        throw Error(`Invalid obj.month parameter! Year: ${obj.month}`);
    }

    var daysInAMonth = getDaysInMonth(new Date(obj.year, obj.month - 1));

    var day: number | undefined;
    if (!isUndefinedOrNull(obj.day)) {
        if (!isNaN(obj.day!.toString().trim() as unknown as number) && !isNaN(parseFloat(obj.day!.toString().trim()))) {
            var _day = parseInt(obj.day!.toString().trim());
            if (_day >= 1 && _day <= daysInAMonth) {
                day = _day;
            }
        }
    }
    return day;
}

function isValidHours(hours: string | number | undefined): boolean {
    return !isUndefinedOrNull(_getValidTimeUnitOrUndefined({timeUnit: 'hours', timeUnitPoint: hours}));
}

function getValidHours(hours: string | number | undefined): number {
    var _hours = _getValidTimeUnitOrUndefined({timeUnit: 'hours', timeUnitPoint: hours});
    if (isUndefinedOrNull(_hours)) {
        throw Error(`Hours (${hours}) are invalid!`);
    }
    return _hours!;
}

function isValidMinutes(minutes: string | number | undefined): boolean {
    return !isUndefinedOrNull(_getValidTimeUnitOrUndefined({timeUnit: 'minutes', timeUnitPoint: minutes}));
}

function getValidMinutes(minutes: string | number | undefined): number {
    var _minutes = _getValidTimeUnitOrUndefined({timeUnit: 'minutes', timeUnitPoint: minutes});
    if (isUndefinedOrNull(_minutes)) {
        throw Error(`Minutes (${minutes}) are invalid!`);
    }
    return _minutes!;
}

function isValidSeconds(seconds: string | number | undefined): boolean {
    return !isUndefinedOrNull(_getValidTimeUnitOrUndefined({timeUnit: 'seconds', timeUnitPoint: seconds}));
}

function getValidSeconds(seconds: string | number | undefined): number {
    var _seconds = _getValidTimeUnitOrUndefined({timeUnit: 'seconds', timeUnitPoint: seconds});
    if (isUndefinedOrNull(_seconds)) {
        throw Error(`Seconds (${seconds}) are invalid!`);
    }
    return _seconds!;
}

function isValidMilliSeconds(milliseconds: string | number | undefined): boolean {
    return !isUndefinedOrNull(_getValidTimeUnitOrUndefined({timeUnit: 'milliseconds', timeUnitPoint: milliseconds}));
}

function getValidMilliSeconds(milliseconds: string | number | undefined): number {
    var _milliseconds = _getValidTimeUnitOrUndefined({timeUnit: 'milliseconds', timeUnitPoint: milliseconds});
    if (isUndefinedOrNull(_milliseconds)) {
        throw Error(`MilliSeconds (${milliseconds}) are invalid!`);
    }
    return _milliseconds!;
}

function _getValidTimeUnitOrUndefined(obj: { timeUnit: "hours" | "minutes" | "seconds" | "milliseconds", timeUnitPoint: string | number | undefined }): number | undefined {
    if (isUndefinedOrNull(obj)) {
        throw Error('Parameter `obj` undefined!')
    }

    if (!["hours", "minutes", "seconds", "milliseconds"].includes(obj.timeUnit)) {
        throw Error('Invalid `obj.timeUnit` parameter!')
    }

    if (!isUndefinedOrNull(obj.timeUnitPoint) && !isNaN(obj.timeUnitPoint!.toString().trim() as unknown as number) && !isNaN(parseFloat(obj.timeUnitPoint!.toString().trim()))) {
        var _timeUnitPoints = parseInt(obj.timeUnitPoint!.toString().trim());
        if (getAvailableTimeUnitPoints(obj.timeUnit).includes(_timeUnitPoints)) {
            return _timeUnitPoints;
        }
    }
    return undefined;
}

function areTimeZonesSupported(): boolean {
    return !!Intl && !!Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function isValidTimeZone(timeZone: string): boolean | undefined {
    if (isUndefinedOrNull(timeZone) || timeZone.toString().trim().length === 0) {
        return false;
    }

    if (!areTimeZonesSupported()) {
        return undefined;
    } else {
        try {
            Intl.DateTimeFormat(undefined, {timeZone: timeZone.toString().trim()});
            return true;
        }
        catch (ex) {
            return false;
        };
    }
}

function isUndefinedOrNull(objValue: any): boolean {
    return objValue === undefined || objValue === null;
}

function isTrue(booleanValue: boolean | string | number | undefined | null): boolean | undefined {
    if (isUndefinedOrNull(booleanValue)) {
        return undefined;
    }
    return booleanValue === true || ['1', 'true'].includes(booleanValue!.toString().trim().toLowerCase());
}

function isFalse(booleanValue: boolean | string | number | undefined | null): boolean | undefined {
    if (isUndefinedOrNull(booleanValue)) {
        return undefined;
    }
    return booleanValue === false || ['0', 'false'].includes(booleanValue!.toString().trim().toLowerCase());
}

function getAvailableTimeUnitPoints(timeUnit: 'hours' | 'minutes' | 'seconds' | 'milliseconds'): number[] {

    function addTimeUnitPoints(date: Date, byPoints: number) {
        switch (timeUnit) {
            case 'hours':
                return addHours(date, byPoints);
            case 'minutes':
                return addMinutes(date, byPoints);
            case 'seconds':
                return addSeconds(date, byPoints);
            case 'milliseconds':
                return addMilliseconds(date, byPoints);
            default:
                throw Error(`Timeunit not supported!: ${timeUnit}`);
        }
    }

    function getTimeUnitPoints(date: Date) {
        switch (timeUnit) {
            case 'hours':
                return date.getHours();
            case 'minutes':
                return date.getMinutes();
            case 'seconds':
                return date.getSeconds();
            case 'milliseconds':
                return date.getMilliseconds();
            default:
                throw Error(`Timeunit not supported!: ${timeUnit}`);
        }
    }

    var _timeUnitPointsDatesLoops = 2;
    var _timeUnitPointsDate = new Date();
    var _timeUnitPointsList: number[][] = [];
    for (var i = 0; i < _timeUnitPointsDatesLoops; i++) {
        _timeUnitPointsList[i] = [];
        var _timeUnitPoints = getTimeUnitPoints(_timeUnitPointsDate);
        var _timeUnitPointsStart = _timeUnitPoints;
        do {
            _timeUnitPointsDate = addTimeUnitPoints(_timeUnitPointsDate, 1);
            var _timeUnitPoints = getTimeUnitPoints(_timeUnitPointsDate);
            _timeUnitPointsList[i]?.push(_timeUnitPoints);
        } while (_timeUnitPoints != _timeUnitPointsStart)
    }
    var _timeUnitPointsListFlattened = _timeUnitPointsList.flat();
    _timeUnitPointsListFlattened = _timeUnitPointsListFlattened.filter((x, i) => _timeUnitPointsListFlattened.indexOf(x) === i);
    _timeUnitPointsListFlattened.sort();
    return _timeUnitPointsListFlattened;
}

// NOTE: Leave `as SiteDataOptionsFunction` there!
export const siteDataOptionsFunctionsUtilities = {
    getStartDateAndEndDate: { function: getStartDateAndEndDate, canBeAccessedFromOtherFunctions: true },
    validateAndCleanDate: { function: validateAndCleanDate, canBeAccessedFromOtherFunctions: true },
    buildDate: { function: buildDate, canBeAccessedFromOtherFunctions: true },
    isValidYear: { function: isValidYear, canBeAccessedFromOtherFunctions: true },
    getValidYear: { function: getValidYear, canBeAccessedFromOtherFunctions: true },
    isValidMonth: { function: isValidMonth, canBeAccessedFromOtherFunctions: true },
    getValidMonth: { function: getValidMonth, canBeAccessedFromOtherFunctions: true },
    isValidDay: { function: isValidDay, canBeAccessedFromOtherFunctions: true },
    getValidDay: { function: getValidDay, canBeAccessedFromOtherFunctions: true },
    isValidHours: { function: isValidHours, canBeAccessedFromOtherFunctions: true },
    getValidHours: { function: getValidHours, canBeAccessedFromOtherFunctions: true },
    isValidMinutes: { function: isValidMinutes, canBeAccessedFromOtherFunctions: true },
    getValidMinutes: { function: getValidMinutes, canBeAccessedFromOtherFunctions: true },
    isValidSeconds: { function: isValidSeconds, canBeAccessedFromOtherFunctions: true },
    getValidSeconds: { function: getValidSeconds, canBeAccessedFromOtherFunctions: true },
    isValidMilliSeconds: { function: isValidMilliSeconds, canBeAccessedFromOtherFunctions: true },
    getValidMilliSeconds: { function: getValidMilliSeconds, canBeAccessedFromOtherFunctions: true },
    getAvailableTimeUnitPoints: { function: getAvailableTimeUnitPoints, canBeAccessedFromOtherFunctions: true },
    areTimeZonesSupported: { function: areTimeZonesSupported, canBeAccessedFromOtherFunctions: true },
    isValidTimeZone: { function: isValidTimeZone, canBeAccessedFromOtherFunctions: true },
    isUndefinedOrNull: { function: isUndefinedOrNull, canBeAccessedFromOtherFunctions: true },
    isTrue: { function: isTrue, canBeAccessedFromOtherFunctions: true },
    isFalse: { function: isFalse, canBeAccessedFromOtherFunctions: true },
} as const satisfies SiteDataOptionsFunctionsUtilities;

export const __siteDataOptionsFunctionsUtilitiesFilePath = import.meta.url;
