export interface SiteData {
    name: string;
    version: string;
    lastUpdated?: string; //Is automatically filled in on generation by comparing previously generated JSON file and seeing if there are differences, ignoring the lastUpdated property of course.
    description: string;
    author: string;
    license: string;
    contactEmail: string;
    socialLinks: SocialLink[];
    content: Content;
}

export interface Content {
    profile: Profile;
    statements: InfoCard[];
    utilityFunctions: CustomFunctionsWithContext | undefined; // Leave it to ... | undefined // Do not make property optional, needed for traversing object
    keyFunctions: FunctionContextOnly | undefined,
    experience: Experience;
    otherInterestsWants: string[];
    process: Process;
    projectManagement: InfoCard[];
}

export interface CustomFunctionsWithContext extends FunctionContextOnly {
    functions: CustomFunction[];
}

export interface FunctionContextOnly {
    context: string;
}

export interface Experience {
    experienceGradeLevels: ExperienceGradeLevel[];
    workModels: WorkModel[];
    roles: Role[];
    projectMotives: ProjectMotive[];
    organizations: Organization[];
    locations: Location[];
    sectors: Sector[];
    concepts: Concept[];
    technologyTypes: TechnologyType[];
    technologies: Technology[];
    projects: Project[];
    timingSchedules: TimingSchedule[];
    holidaysRestAndLeaveEntries: HolidaysRestAndLeaveEntry[];
    projectTags: ProjectTag[];
    companyTypes: string[];
}

export interface Concept {
    key: string;
    name: string;
    description: string;
    experienceGradeLevel: number;
    children?: Concept[];
}

export interface WorkModel {
    key: string;
    name: string;
    description: string;
}

export interface Role {
    key: string;
    name: string;
    description: string;
    children?: Role[];
}

export interface TechnologyType {
    key: string;
    name: string;
    description: string;
    children?: TechnologyType[];
}

export interface Sector {
    key: string;
    name: string;
    description: string;
}

export interface ProjectMotive {
    key: string;
    name: string;
    description: string;
}

export interface ProjectTag {
    key: string;
    name: string;
    description: string;
}

export interface ExperienceGradeLevel {
    level: number;
    name: string;
    description: string;
}

export interface HolidaysRestAndLeaveEntry {
    key: string;
    type: 'publicNational' | 'school' | 'workLeave' | 'break';
    timeZone: string;
    functions: CustomFunction[] | undefined; // Leave it to ... | undefined // Do not make property optional, needed for traversing object
    entries: (HolidayRestAndLeaveEntryEntry|HolidayRestAndLeaveEntryEntryByFunctions)[];
    dependsOnType?: string;
    defaultSleepTime?: DefaultSleepTime;
}

export interface DefaultSleepTime {
    startTime: Time;
    endTime: Time;
}

export interface Time {
    hours: number;
    minutes?: number;
}

export interface HolidayRestAndLeaveEntryEntry extends HolidayRestAndLeaveEntryEntryStartAndEndDates {
    multiple?: HolidayRestAndLeaveEntryEntryStartAndEndDates[],
    isSick?: boolean;
}

export interface HolidayRestAndLeaveEntryEntryStartAndEndDates {
    name?: string;
    date?: DateClass;
    startDate?: DateClass;
    endDate?: DateClass;
    timeZone?: string;
    applicableOnlyFor?: HolidayRestAndLeaveEntryEntryApplicableOnlyFor
}

export interface HolidayRestAndLeaveEntryEntryApplicableOnlyFor {
    months?: string, // e.g. -4,6-7,10- (means 1-4,6-7,10-12) [can be text e.g. "-Apr,Jun-Jul,Oct-"]
    years?: string // -1997,2003-2005,2007,2009,2012- ("-" by itself means from eternity or to eternity)
}

export interface DateClass {
    year?: number, 
    month: number | string, 
    day: number, 
    hours?: number, 
    minutes?: number, 
    seconds?: number, 
    milliSeconds?: number
}

export interface HolidayRestAndLeaveEntryEntryByFunctions extends HolidayRestAndLeaveEntryEntryByFunctionsFunctionRun {
    multiple?: HolidayRestAndLeaveEntryEntryByFunctionsFunctionRun[];
}

export interface HolidayRestAndLeaveEntryEntryByFunctionsFunctionRun {
    name?: string; // holiday / rest day name
    functionName: string; // function results can be: Date | [Date, Date] | (Date | [Date, Date])[] | { name: string, range: (Date | [Date, Date])[] }[]
    timeZone?: string;
    dateResultOffset?: DateResultOffset; // in case result is a single Date or [startDate: Date, endDate: Date]
    startDateResultOffset?: DateResultOffset; // in case result is a single Date or [startDate: Date, endDate: Date]
    endDateResultOffset?: DateResultOffset; // in case result is a single Date or [startDate: Date, endDate: Date]
    applicableOnlyFor?: HolidayRestAndLeaveEntryEntryApplicableOnlyFor
}

export interface DateResultOffset {
    days?: number;
    hours?: number;
    minutes?: number;
}

export interface CustomFunction {
    name: string;
    nameInternal?: string,
    arguments: string;
    body: string;
    canBeCalledFromOtherFunctions?: boolean;
}

export interface Location {
    key: string;
    name: string;
    address: string;
    countryCode: string;
    position: Position;
}

export interface Position {
    latitude: string;
    longitude: string;
}

export interface Organization {
    key: string;
    name: string;
    nameLong: string;
    url?: string;
    logoUrl?: string;
    logoBackgroundColor?: string;
    nonProfit: boolean;
    communityDriven: boolean;
    locationsKeys?: { [key: string]: LocationKey };
    isPerson?: boolean;
}

export interface LocationKey {
    locationKey: string;
    permanentlyClosedDate?: string;
}

export interface Project {
    key: string;
    name: string;
    description?: string;
    linkUrl?: string;
    linkUrlOrganizationKey?: string;
    startDate: string;
    endDate?: string;
    timeZone: string;
    projectMotiveKey: string;
    projectTagsKeys: string[];
    technologyLogs?: TechnologyLog[];
    conceptKeys: string[];
    sectorsKeysRatios?: { [key: string]: number; };
    organizationsKeys: OrganizationsKey[];
    subProjects?: SubProject[];
}

export interface SubProject extends Partial<Project> {
    key: string;
    name: string;
    startDate?: string;
}

export interface OrganizationsKey {
    organizationKey: string;
    organizationLocationKey: string;
    workModelsKeysRatios: { [key: string]: number; };
}

export interface TechnologyLog {
    technologyKey: string;
    description?: string;
    timeZone?: string;
    hoursEntries: HoursEntry[];
    conceptKeys?: string[];
    subTechnologiesLogs?: TechnologyLog[];
}

export interface HoursEntry {
    periodStartDate: string;
    periodEndDate: string;
    timeZone?: string;
    timingScheduleKey?: string;
    hoursTimeBasisEvery?: 'definite' /* same as undefined/null */ | 'day' | 'week' | 'month' | 'year';
    hoursTimeBasisEveryMultiplier?: number,
    hoursPerBasis: number;
    areHoursPerBasisAdditional?: boolean;
}

export interface Technology {
    key: string;
    name: string;
    nameLong: string;
    description: string;
    url: string;
    logoUrl: string;
    logoBackgroundColor?: string;
    isChildOf: string[];
    isRelatedTo: string[];
    technologyTypeId: string;
    roleIds: string[];
    corporateDependency: boolean;
    vendors: string[];
    discontinued: boolean;
    openSource: boolean;
}

export interface TimingSchedule {
    key: string;
    timeZone: string;
    defaultSleepTime?: DefaultSleepTime;
    onCallExceptions?: OnCallException[];
    weeklyScheduleApplicable?: WeeklyScheduleApplicable[];
    monthlyScheduleApplicable?: MonthlyScheduleApplicable[];
    yearlyScheduleApplicable?: YearlyScheduleApplicable[];
    holidaysRestAndLeaveApplied?: HolidaysRestAndLeaveAppliedEntry[];
}

export interface OnCallException {
    startDate: string;
    endDate: string;
    timeZone?: string;
}

export interface HolidaysRestAndLeaveAppliedEntry {
    applicableFromDate?: string;
    applicableToDate?: string;
    timeZone?: string;
    holidaysRestAndLeaveEntryKey: string;
}

export interface WeeklyScheduleApplicable {
    applicableFromDate: string;
    applicableToDate?: string;
    timeZone?: string;
    daysSchedules: DaysSchedule[];
}

export interface DaysSchedule {
    applicableInMonths?: (number|string)[];
    weekDays: { [key: string]: Day };
}

export interface Day {
    startTime: Time;
    endTime: Time;
    breaks?: Break[];
}

export interface Break {
    startBreakTime: Time;
    breakDurationMinutes: number;
}

export interface MonthlyScheduleApplicable {
    applicableFromDate: string;
    applicableToDate?: string;
    timeZone?: string;
    startOfMonth?: boolean;
    endOfMonth?: boolean;
    splitOntoDaysMinimum?: number;
    specificDaysOfMonth?: number[];
}

export interface YearlyScheduleApplicable {
    applicableFromDate: string;
    applicableToDate?: string;
    timeZone?: string;
    startOfYear?: boolean;
    endOfYear?: boolean;
    meteorologicalWinter?: boolean | number;
    meteorologicalSpring?: boolean | number;
    meteorologicalSummer?: boolean | number;
    meteorologicalAutumn?: boolean | number;
}

export interface Process {
    gettingStarted: GettingStarted;
    softwareDevelopmentLifecycle: GettingStarted;
}

export interface GettingStarted {
    description: string;
    steps: string[];
}

export interface Profile {
    fullName: string;
    description: string;
    images: Image[];
}

export interface Image {
    url: string;
    description: string;
    isMainImage: boolean;
}

export interface InfoCard {
    imageUrl: string;
    title: string;
    titleInfo: null | string;
    textLines: string[];
}

export interface SocialLink {
    iconUrl: string;
    platform: string;
    url: string;
}
