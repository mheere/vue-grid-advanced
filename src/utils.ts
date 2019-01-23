
//http://stackoverflow.com/questions/4814398/how-can-i-check-if-a-scrollbar-is-visible
// (function ($) {
//     $.fn.hasScrollBar = function () {
//         return this.get(0).scrollHeight > this.get(0).clientHeight;     //this.innerHeight();       // this.height();
//     }
// })(jQuery);


String.prototype.lower = function () {
    return this.toLowerCase();
};

String.prototype.upper = function () {
    return this.toUpperCase();
};

String.prototype.isSame = function (other) {
    let ok: boolean = (this && this.length > 0 && other && other.length > 0);
    if (!ok) return false;

    let me: string = this.lower();
    other = other.lower();
    return me === other;
};

String.prototype.isNotSame = function (other) {
    let me: string = this.lower();
    other = other.lower();
    return me != other;
};

String.prototype.contains = function (contains) {
    let me: string = this.lower();
    contains = contains.lower();
    return me.indexOf(contains) > -1;
};

String.prototype.startsWith = function (startsWith: string) {
    let me: string = this.lower();
    startsWith = startsWith.lower();
    return me.indexOf(startsWith) === 0;
};

String.prototype.startsWithNumber = function () {
    let me: string = this.lower();
    let firstChar = me.substr(0, 1);
    return (!isNaN(parseInt(firstChar)));
};

String.prototype.endsWith = function (suffix: string) {
    let me: string = this.lower();
    suffix = suffix.lower();
    return me.indexOf(suffix, this.length - suffix.length) !== -1;
};

// String.prototype.removeEndIfExist = function (suffix: string) {

//     let ret: boolean = this.indexOf(suffix, this.length - suffix.length) !== -1;

//     if (!ret)
//         return this;
//     let s: string = this.substring(0, this.length - suffix.length);
//     return s;
// };

// String.prototype.addAtEndIfNotExist = function (suffix: string) {
//     if (this.length == 0) return "";
//     let hasSuffixAtEnd: boolean = this.endsWith(suffix);
//     if (hasSuffixAtEnd) return this;
//     return this + suffix;
// };

String.prototype.removeTill = function (find: string, includeFind: boolean) {
    let pos: number = this.indexOf(find);
    if (pos == -1) return "";
    if (includeFind) pos += find.length;
    let s = this.substring(pos);
    return s;
};

// // if str2 is given then use that for the second marker - 
// // minPos specified the minimum distance to start looking for str2
// // 
// String.prototype.retrieveInBetween = function (str1: string, str2?: string, minDistStr2?: number, inclSearch1?: boolean, inclSearch2?: boolean) {

//     //debugger;
//     let s: string = this;

//     let marker: string = str1;

//     let pos1: number = s.indexOf(marker);
//     if (pos1 > -1)
//         pos1 = pos1 + marker.length;

//     // if a str2 is given then alter the marker
//     if (str2) marker = str2;

//     // start the pos2 from where we look for marker
//     let startPos2: number = pos1;

//     if (minDistStr2 && startPos2 < minDistStr2) 
//         startPos2 = minDistStr2;

//     if (inclSearch1 && pos1 > -1)
//         pos1 = pos1 - str1.length;

//     let pos2: number = s.indexOf(marker, startPos2);
//     if (pos2 == -1) pos2 = s.length;

//     if (inclSearch2 && str2)
//         pos2 = pos2 + str2.length;

//     if (pos2 > s.length) pos2 = s.length;

//     if (pos1 == -1) pos1 = 0;
//     let s2: string = s.substr(pos1, (pos2 - pos1));

//     return s2;
// };

// // simply returns the string between two given markers and a starting position
// String.prototype.retrieveInBetween2 = function (str1: string, str2: string, pos: number) {

//     let s: string = this;

//     let pos1: number = s.indexOf(str1, pos);
//     if (pos1 == -1) return "";

//     // set the pos1
//     pos1 = pos1 + str1.length;

//     // check for the end position
//     let pos2: number = s.indexOf(str2, pos1);
//     if (pos2 == -1) return s.substring(pos1);

//     let s2: string = s.substr(pos1, (pos2 - pos1));

//     return s2;
// };

String.prototype.replaceAll = function (search, replace) {
    if (replace === undefined) {
        return this.toString();
    }
    return this.split(search).join(replace);
};


interface Array<T> {
    //exists(cb: (item) => boolean): boolean;
    //exists2(string): boolean;
    remove(item: T);
    removeAll(cb?: (item) => boolean);
    findAndRemove(cb: (item) => boolean);
    findItem(cb: (item) => boolean): T;
    hasItem(cb: (item) => boolean): boolean;
    //hasItem2(string): boolean;
    
}

Array.prototype.findItem = function (cb: (item) => boolean) {
    return _.find(this, cb);
};

Array.prototype.removeAll = function (cb: (item) => boolean) {
    if (cb == null) {
        this.length = 0;
    }
    else {
        _.forEach(this, (item: any, index: number) => {
            if (cb(item)) 
                this.splice(index, 1);
        })
    }
};

Array.prototype.findAndRemove = function (cb: (item) => boolean): any {
    let match = _.find(this, (itemTemp) => cb(itemTemp));
    let index = this.indexOf(match);
    if (index > -1) {
        this.splice(index, 1);
    }
    return match;
};

Array.prototype.remove = function (item: any) {
    let index: number = this.indexOf(item);
    if (index > -1)
        this.splice(index, 1);
};

Array.prototype.hasItem = function (cb: (item) => boolean) {
    let match = _.find(this, (itemTemp) => cb(itemTemp));
    return match ? true : false;
};

//

// --------------------------------------------------------------------------




// Array.prototype.hasItem = function (cb: (item) => boolean) {
//     let match = ko.utils.arrayFirst(this, function (itemTemp) {
//         return cb(itemTemp);
//     });
//     return match ? true : false;
// };

// Array.prototype.hasItem2 = function (s: string) {
//     let match = ko.utils.arrayFirst(this, function (itemTemp) {
//         return itemTemp == s;
//     });
//     return match ? true : false;
// };


