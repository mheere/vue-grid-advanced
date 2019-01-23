import * as moment from 'moment';
import * as __cbc from './CheckBoxConverter'

export let formatDate: string = "DD MMM YYYY";
export let formatDateTime: string = "DD MMM YYYY, HH:mm:ss";

export let keyControlIsDown: boolean = false;
export let keyAltIsDown: boolean = false;
export let keyShiftIsDown: boolean = false;
export let crlf: any = '\r\n';

export function initialise_core() {
        
    window.addEventListener("keydown", function (event: any) {
        if (event.ctrlKey)
            keyControlIsDown = true;
        if (event.altKey)
            keyAltIsDown = true;
        if (event.shiftKey)
            keyShiftIsDown = true;
    }, false);
    
    window.addEventListener("keyup", function (event: any) {
        if (keyControlIsDown || keyAltIsDown || keyShiftIsDown) {
            console.log("keyup");
            keyControlIsDown = false;
            keyAltIsDown = false;
            keyShiftIsDown = false;
        }
    }, false);
    
}

export function getRandomNumber(to: number, from: number = 0) {
    let diff = to - from;
    if (diff <= 0) return 0;
    let r = Math.floor((Math.random() * diff));
    return r + from;
}

export function createGuid() {
    let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return guid;
}

export function createGuidRight5(pos: number = 5) {
    let guid: string = createGuid();
    guid = guid.substr(guid.length - pos);
    return guid;
}

// typeA is element type to check against typeB which is the TypeScript constructor definition...
export function instanceOf(typeA: any, typeB: any) {
    return (typeA.constructor.toString() === typeB.toString());
}

export function deepClone(obj: any) {
    if (!obj) return obj;
    return JSON.parse(JSON.stringify(obj))
}


export function getNiceDate(date: any, format?: string) {
    let ret: string = "";
    try {
        format = (format && format.length > 0) ? format : formatDate;
        ret = moment(date).format(format);
    }
    catch (e) { ret = "error"; }
    return ret;
}

export function getNiceDateTime(date: any, format?: string) {
    let ret: string = "";
    try {
        format = (format && format.length > 0) ? format : formatDateTime;
        ret = moment(date).format(format);
    }
    catch (e) { ret = "error"; }
    return ret;
}

export function getDateTimeNow(inclMillisecons?: boolean) {
    let d = new Date();
    let nicedate = getNiceDateTime(d);
    if (inclMillisecons)
        nicedate += " - " + d.getMilliseconds();
    return nicedate;
}

export function convertToOrclDateTime(date: any) {          // 2008-02-26 15:12:55
    // if a null or empty string comes in send in dummy date for orcl
    if (!date || date.length == 0)
        return "1900-01-01 00:00:00";

    let ret: string = "";
    try {
        ret = moment(date).format("YYYY-MM-DD HH:mm:ss");
    }
    catch (e) { ret = "error"; }
    return ret;
}

export function convertToOrclDate(date: any) {          // 2008-02-26 15:12:55
    // if a null or empty string comes in send in dummy date for orcl
    if (!date || date.length == 0)
        return "1900-01-01";

    let ret: string = "";
    try {
        ret = moment(date).format("YYYY-MM-DD");
    }
    catch (e) { ret = "error"; }
    return ret;
}

export function getPressedKeys(params: any) {
    let altKey = params ? params.altKey : false;
    let ctrlKey = params ? params.ctrlKey : false;
    let shiftKey = params ? params.shiftKey : false;
    return { altKey, ctrlKey, shiftKey }
}

// A helper class which is called upon for translation from what Mike expects and how the rest of the world interprets data... :)
export class Converters {
    public static converterBoolean: __cbc.CheckBoxConverterYN = new __cbc.CheckBoxConverterYN();
    public static converterCheckbox: __cbc.CheckBoxConverter01234 = new __cbc.CheckBoxConverter01234();
}

export function converterBoolean(s1: string, s2: string, inverse?: boolean) {
    if (!s1 || !s2) return false;
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    if (inverse)
        return (s1 !== s2);
    return (s1 === s2);
}


export function isSame(s1: string, s2: string, inverse?: boolean) {
    if (!s1 || !s2) return false;
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    if (inverse)
        return (s1 !== s2);
    return (s1 === s2);
}

