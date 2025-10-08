import { handleSiteDataOptionsFunctions } from './functions/site.data.options.functions.js';
import type { SiteData } from '../site.data.types.js';

export interface SiteDataOptions {}

export const siteDataOptions: SiteDataOptions = {};

export const handleSiteDataOptions = async function (data: SiteData, options: SiteDataOptions): Promise<SiteData> {
    if (data === undefined || data === null) {
        throw Error('Undefined data object!');
    }

    if (data.content === undefined || data.content === null) {
        throw Error('Undefined data content!');
    }
    
    const dataWithFunctions = await handleSiteDataOptionsFunctions(data, options);

    return dataWithFunctions;
};
