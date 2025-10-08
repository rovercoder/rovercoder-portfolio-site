export function fields<T extends Object>(sampleWithAllPropertiesForKeyEnumeration?: Required<T>): { [P in NonNullable<keyof T>]: P } {
    const keys: (string | symbol)[] | null = 
        (sampleWithAllPropertiesForKeyEnumeration != null && typeof sampleWithAllPropertiesForKeyEnumeration === 'object') 
        ? Object.keys(sampleWithAllPropertiesForKeyEnumeration)
        : null;

    return new Proxy(
        {} as { [P in NonNullable<keyof T>]: P },
        {
            get(_target, prop, _receiver) {
                return prop;
            },
            ...(keys != null && {
                ownKeys(): (string | symbol)[] {
                    return keys;
                },
                getOwnPropertyDescriptor(): PropertyDescriptor {
                    return { enumerable: true, configurable: true };
                }
            }),
        }
    ) as { [P in NonNullable<keyof T>]: P; };
}

export function fieldsNonOptional<T extends Object>(sampleWithNonOptionalProperties?: NonOptional<T>): { [P in NonNullable<keyof NonOptional<T>>]: P } {
    const keys: (string | symbol)[] | null = 
        (sampleWithNonOptionalProperties != null && typeof sampleWithNonOptionalProperties === 'object') 
        ? Object.keys(sampleWithNonOptionalProperties)
        : null;

    return (sampleWithNonOptionalProperties != null && typeof sampleWithNonOptionalProperties === 'object') 
        ? fields<NonOptional<T>>(sampleWithNonOptionalProperties as any)
        : fields<NonOptional<T>>();
}

export type NonOptional<T> = {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

export const nameOf = (f: () => void) => (f).toString().replace(/[ |()=>]/g, '');

export function omit<T extends object, K extends keyof T>(
    obj: T,
    ...keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}

export type Replace<T, From, To> =
    // Handle literal & primitive types first
    T extends From ? To :

    // If it's an array (or tuple)
    T extends Array<infer U> ? Array<Replace<U, From, To>> :

    // If it's a function
    T extends (...args: any[]) => any ? T :

    // If it's an object (and not null/function/array)
    T extends object ? {
        [K in keyof T]: Replace<T[K], From, To>
    } :

    // Otherwise leave unchanged
    T;

// Utility: Detect if T is a record/index signature of U
type IsRecordOf<T, U> =
    T extends Record<string | number | symbol, U>
        ? keyof T extends string | number | symbol ? T : never
        : never;

// Recursively replace `{ [string]: CustomType }` → `CustomType2`
export type ReplaceRecordWith<T, CustomType, CustomType2> =
    // If T is a record mapping strings to CustomType → replace with CustomType2
    IsRecordOf<T, CustomType> extends never
        ? // No match → recurse into structure
            T extends Array<any>
                ? Array<ReplaceRecordWith<T[number], CustomType, CustomType2>>
                : T extends object
                    ? { [K in keyof T]: ReplaceRecordWith<T[K], CustomType, CustomType2> }
                    : T
                        : CustomType2;  // Matched `{ [key: string]: CustomType }` → replace
