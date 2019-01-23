// Interface
export interface ICheckBoxConverter {

    // interpret a given value from the data collection (db) and return a true/false to bind to
    FromDB(dbvalue: string): boolean;

    // interpret a given (bound) boolean and convert it to what the data (db) expects.
    ToDB(b: boolean): string;
}

export class CheckBoxConverterYN implements ICheckBoxConverter {

    FromDB(dbvalue: string) {
        if (dbvalue == "Y") return true;
        return false;
    }

    ToDB(b: any): string {
        if (b == "N") return "N";
        if (b) return "Y";
        return "N";
    }
}

export class CheckBoxConverter012 implements ICheckBoxConverter {

    FromDB(dbvalue: string) {
        if (dbvalue == "1")
            return false;

        if (dbvalue == "2")
            return true;

        return false;
    }

    ToDB(b: boolean): string {
        if (b) return "2";
        return "1";
    }
}

// 0: not shown, 1: shown open, 2: shown ticked, 3: disabled open, 4: disabled ticked
export class CheckBoxConverter01234 implements ICheckBoxConverter {

    FromDB(dbvalue: string) {
        if (dbvalue == "1" || dbvalue == "3")
            return false;

        if (dbvalue == "2" || dbvalue == "4")
            return true;

        return false;
    }

    ToDB(b: boolean): string {
        if (b) return "2";
        return "1";
    }
}