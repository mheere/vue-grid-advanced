interface String {
    isSame(s: string): boolean;
    isNotSame(s: string): boolean;
    isIn(manys: string[]): boolean;
    isNotIn(manys: string[]): boolean;
    retrieveInBetween(str1: string, str2?: string, minDistStr2?: number, inclSearch1?: boolean, inclSearch2?: boolean): string;
    retrieveInBetween2(str1: string, str2: string, pos?: number): string;
    replaceAll(search: string, replace: string): string;
    contains(s: string): boolean;
    startsWith(s: string): boolean;
    startsWithNumber(): boolean;
    endsWith(s: string): boolean;
    removeEndIfExist(s: string): string;
    addAtEndIfNotExist(s: string): string;
    removeTill(find: string, includeFind: boolean): string;         // removes strings till find string
    lower(): string;
    upper(): string;
    padStart(targetLength: number, padString: string): string;
}

interface Array<T> {
    //exists(cb: (item) => boolean): boolean;
    //exists2(string): boolean;
    removeAll(cb: (item: T) => boolean): void;
    findAndRemove(cb: (item: T) => boolean): void;
    findItem(cb: (item: T) => boolean): T;
    hasItem(cb: (item: T) => boolean): boolean;
    hasItem2(string: T): boolean;
    remove(item: T): void;
    //diff(arr): Array<T>;
}

interface JQuery {
    alterClass(removals: string, additions: string): JQuery;
    find2(selector: string): JQuery;
}
