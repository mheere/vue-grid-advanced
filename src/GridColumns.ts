import { ICheckboxConverter, CheckboxConverterYN, CheckboxConverter01234 } from './CheckBoxConverter';

// --------------------------------------------------------
// Describes all meta regarding a grid column
// --------------------------------------------------------
export class GridColumn {
  public header: string = "";
  public dbName: string = "";
  public spanText: string = "";
  public order: number = -1;   
  public order_ori: number = -1;            // temp
  public format: string = "";
  public currencyLookUp: string = "";       // this col references another column to display its currency
  public formula: string = "";
  public type: string = "string";
  public align: string = "left";
  public sortDirection: string = ""
  public width: number = 0;
  public pivotHeader: boolean = false;      // if true - pivots the header 90 degrees
  public aggregate: string = "";            // sum, etc
  public minWidth: number = 0;
  public minLength: number = -1;
  public maxLength: number = -1;
  //public stateExpCol: string = "";          // expanded, collapsed, mixed
  public blankIfZero: boolean = false;
  public isRequired: boolean = false;
  public isFlexable: boolean = false;
  public frozenLeft: boolean = false;
  public frozenRight: boolean = false;
  //public displayable: boolean = true;
  public visible: boolean = true;
  public data: string = "";
  public checkboxConverter: ICheckboxConverter = undefined;

  public operators: string[] = [];
  //public ddItems: DDItem[] = [];

  // item -> incoming similar item from the server
  constructor(dbName: string, width: number, header: string = "", type: string = "", align: string = "", format: string = "", sortDirection: string = "") {
      
    this.dbName = dbName;
    this.width = width;
    this.header = header || dbName;
    this.type = type || "string";
    this.align = align || "left";
    this.format = format;
    this.sortDirection = sortDirection;

    // if this is a boolean start with default Y/N
    if (this.isBoolean)
        this.checkboxConverter = new CheckboxConverterYN();
    
    // if this is a checkbox start with default 0,1,2,3,4
    // 0: not shown, 1: shown open, 2: shown ticked, 3: disabled open, 4: disabled ticked
    if (this.isCheckbox)
        this.checkboxConverter = new CheckboxConverter01234();
  }

  public static create(fromJson: any): GridColumn {
      let x = fromJson;
      let col = new GridColumn(x.dbName, Number.parseInt(x.width), 
                            x.header, x.type, x.align, x.format, x.sortDirection);
      col.order = Number.parseInt(x.order);
      col.visible = x.visible;
      return col;
  }

  public reverseSort() {
    this.sortDirection = (this.sortDirection.isSame("asc") ? "desc" : "asc");
  }

  get isSorting() : boolean { return this.sortDirection.length > 0 }
  get isAggregate(): boolean { return this.aggregate.length > 0 }
  get isFormatting(): boolean { return this.format.length > 0 }

  get isString() { return this.type == "string" }
  get isNumber() { return this.type == "number" }
  get isDate() { return this.type == "date" }
  get isBoolean() { return this.type == "boolean" }
  get isCheckbox() { return this.type == "checkbox" }
  get isImage() { return this.type == "image" }
  get isNotImage() { return !this.isImage }

  get isLeftAlign() { return this.align == "left" }
  get isRightAlign() { return this.align == "right" }

  get sortIcon() {
      if (!this.isSorting) return "";
      return this.sortDirection.isSame("asc") ? "sort-up" : "sort-down";
  }

  public adjust(key: string, value: any) {
      // assign the key to the header and dbName
      this.dbName = this.header = key.toLowerCase();

      // now interpret the type
      if ($.isNumeric(value)) {
          this.type = "number";
          this.align = "right";
          this.format = "#,##0";
      }
      if (key.toLowerCase().contains("date")) {
          this.type = "datetime";
          this.align = "center";
          this.format = "";
      }
  }

  // If we have managed to get info from the db regarding the TRUE column type then set it
  public adjustByOrclInfo(type: string) {
      // assign the key to the header and dbName
      //this.dbName = this.header = key.toLowerCase();

      if (type.isSame("string")) {
          this.type = "string";
          this.align = "left";
      }
      // now interpret the type
      if (type.isSame("decimal")) {
          this.type = "number";
          this.align = "right";
          this.format = "#,##0";
      }
      if (type.contains("date")) {
          this.type = "datetime";
          this.align = "center";
          this.format = "";
      }
  }

  public static IsExportable(col: GridColumn) {
      //return col.type.isIn(["number", "boolean", "string", "quantity", "checkbox", "formula"]);
      return col.type.isNotIn(["custom"]);
  }
}