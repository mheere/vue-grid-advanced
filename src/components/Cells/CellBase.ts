import Vue from "vue";
import * as $ from 'jquery';
import * as R from 'ramda';
import * as rxjs from 'rxjs';
import * as numeral from 'numeral'; // test
import * as moment from "moment";
import { SelectRowInfo, VGridManager, VGridSettings, CellStyleInfo, GridColumn } from '../../index';

// little trick to make my props typesafe - there are other ways but this is nice and easy...
export class MyData {
    public _$cell: any = null;
    public isImage: boolean = false;
    public faImage: string = "";
    public faImageColour: string = "";
    public iconPre: string = "far";
    public iconName: string = "window-minimize";
    public text: string = "";
    public style: CellStyleInfo = undefined;
    //public scrollBlank: boolean = false;
}

// define the CellBase
export const CellBase = Vue.extend({
    props: ['rowNo', 'colDef'],
    data: () => new MyData(),
    methods: {
        getRawValue() {
            let row = this.$store.state.rowsPrepared[this.rowNo];
            if (!row) return "";
            return row[this.colDef.dbName];
        },
        numberClick() {
            alert("numberClick base");
        },
    },
    computed: {
        dummyText() {
            return this.rowNo + ' ' + this.colDef.dbName;
        },
        scrollBlank() {
            return this.colDef.dontRender;
        },
        hasText() {
            return this.text;
        },
        noText() {
            if (this.colDef.isNumber) {
                if (this.colDef.blankIfZero) {
                    let tempNumber = Number.parseFloat(this.getRawValue);
                    if (tempNumber == 0) return true;
                }
                return false;
            }
            return !this.text;
            //return this.text.length == 0; test
        },
        isChecked: {
            //if (!this.colDef.checkboxConverter) return false;
            //return this.colDef.checkboxConverter.FromDB(this.getRawValue());
            // getter
            get: function () {
                if (!this.colDef.checkboxConverter) return false;
                return this.colDef.checkboxConverter.FromDB(this.getRawValue());
            },
            // setter
            set: function (newValue) {
                let row = this.$store.state.rowsPrepared[this.rowNo];
                if (!row) return "";
                row[this.colDef.dbName] = this.colDef.checkboxConverter.ToDB(newValue);
            }
      
        },
        isDisabled() {
            if (!this.colDef.checkboxConverter) return false;
            return this.getRawValue() >= 3;
        },
        refresh() {
            return this.$store.state.isRefreshData;
        },
        getValue() {
            // NOTE - this 'fools' Vue in forcing a refresh (throw away the cache) when a 'data refresh' happens
            return (this.refresh) ? this.getRawValue() : this.getRawValue();
        },
        isGroupingCol() {
            return this.$store.getters.isGroupingCol(this.colDef);
        },
        getStyleImg() {

            // define the return style
            let style: any = { order: 2  }

            if (this.colDef.isRightAlign) {
                style.order = 0;
                style.marginRight = '5px';
                style.marginLeft = '3px';
            }
            if (this.isGroupingCol) {
                style.order = 0;
                style.marginRight = '5px';
                style.marginLeft = '3px';
            }
            if (this.faImageColour)
                style.color = this.faImageColour;

            return style;

        },
        getStyle() {
            
            // --------------------------------------------------------
            // NOTE - IMPORTANT! - ** LEAVE HERE ** - dummy check if we are 'refreshing' - this will trigger a requery of this style!
            // --------------------------------------------------------
            let dummy = this.$store.state.isRefreshData;
            // --------------------------------------------------------


            let colDef: GridColumn = this.colDef;
            let settings: VGridSettings = this.$store.state.settings;

            // define the style for this cell
            let styleBase: any = {
                color: '#5d4d4d',
                lineHeight: this.$store.state.rowHeight + 'px',
                whiteSpace: 'nowrap',
                width: this.colDef.width + "px",
                textAlign: this.colDef.align,
                borderRight: '1px solid lightgray',
                //backgroundColor: (this.rowNo % 2 == 0) ? "white" : "#f5f5f5",
                padding: '0px 3px',
                fontSize: '1em',
            }

            // 
            if (this.scrollBlank) return styleBase;

            // only now set the alternating backgroun colour
            styleBase.backgroundColor = (this.rowNo % 2 == 0) ? "white" : "#f5f5f5"

            // get the row we are showing
            let row = this.$store.state.rowsPrepared[this.rowNo];
            if (!row) return styleBase;     // important check - this can happen when clearing the rows

            // if this is the last row then place a border-bottom
            //let fewerRowsThenAvailableSpace = this.$store.state.rowsPreparedCount < this.$store.state.visibleRowCount;
            if (this.rowNo == this.$store.state.rowsPreparedCount - 1)
                styleBase.borderBottom = "1px solid #9fa79b";

            // create a style object we can pass to the user to be altered
            let style: CellStyleInfo = new CellStyleInfo();
            style.prepare(styleBase, this.getValue, this.colDef, row, this.$store.state);

            // make this easily accessible
            this.style = style;

            // idea - try to exclude certain columns from updating update only text - hmm not sure
            // this.text = style.textDisplay;
            // return style.toStyle();

            // super fast
            // if (this.$store.state.isVertScrolling) {
            //     this.text = style.textDisplay;
            //     return style.toStyle();
            // }

            // if this row is a groupheader row then highlight (according to its groupLevel)
            if (style.isGroupRow) {
                let count = this.$store.state.groupingColumns.length;
                // light to dark
                let colors = ['#dedfe9', '#cfd1de', '#c0c2d4', '#b1b3ca'];
                style.backgroundColor = colors[style.groupLevel - 1];
            }

            // simply blank out the cell text if we are a grouping column and are
            // showing a level 0 row (the normal data rows)
            if (this.$store.getters.hasGroupingCols && 
                this.$store.getters.isGroupingCol(colDef) && 
                row.__groupLevel == 0) {
                    style.textDisplay = "";
            }

            // if this row has been selected then color it
            if (this.$store.getters.isInSelectedRange(this.rowNo)) {
                style.backgroundColor = "#ffd587";
            }

            // if this row is the selected row then highlight
            if (this.$store.getters.isSelectedRow(this.rowNo)) {
                style.backgroundColor = "orange";
            }

            // do some formatting (for numbers)
            if (colDef.isNumber && colDef.isFormatting) {
                style.textDisplay = numeral(style.textRaw).format(colDef.format);
            }
            
            // do some formatting (for dates)
            if (colDef.isDate && colDef.isFormatting && style.textRaw) {
                style.textDisplay = moment(style.textRaw).format(colDef.format);
            }

            // 
            if (this.colDef.isImage) style.textDisplay = "";

            // do some formatting (for currencies) (only if a base currency column is given)
            if (settings.currencyLookupColumn) {
                VGridManager.processCurrency(row, this.colDef, this.$store.state.settings, style);
            }

            // ***************************************************
            // if user wishes to do some custom styling...
            // ***************************************************
            let userStyling: any =  R.path(['settings', 'cellStyling'], this.$store.state);
            if (userStyling) {
                style = userStyling(style);       // allow the user to make modifications
            }

            // }
            if (this.$store.getters.hasGroupingCols && 
                this.$store.getters.isGroupingCol(colDef) && 
                style.isGroupRow &&
                colDef.dbName.isSame(row.__groupColName)) {

                    if (row.__isExpanded)
                        style.faImage = "chevron-down";     // "caret-down";
                    else
                        style.faImage = "chevron-right";    // "caret-right";

                    //if this.isGroupRow
                    style.textDisplay = `${style.textRaw} (${style.groupRowCount})`;
            }

            // always update the img pros!
            this.faImage = style.faImage || "";
            this.isImage = this.faImage.length > 0;
            this.faImageColour = style.faImageColour;

            // process the image if one is requested
            if (style.faImage) {
                // disect the image (if one is requested)
                if (this.isImage) {
                    this.iconPre = this.faImage.startsWith("o-") ? "far" : "fas";
                    this.iconName = this.iconPre == "far" ? this.faImage.substring(2) : this.faImage;
                }
                else {
                    // some nonsense - again, this can happend when clearing the row(s) but it still needs something valid (although very temporarily)
                    this.iconPre = "far";       
                    this.iconName = "window-minimize";
                }
            }

            // update our prop with the text that will be used
            this.text = style.textDisplay;

            // update the base style with any changes the user might have made...
            return style.toStyle();
        }
    },
    mounted: function () {
    
        // get a ref to the cell dom
        this._$cell = $(this.$refs.mygridcell);	

        // var click$ = rxjs.fromEvent(this._$cell[0], 'click');

        // // clicks.subscribe((e) => {
        // //     clickedRow(e);
        // // })

        // click$.buffer(click$.debounce(250))
        // .map(list => list.length)
        // .filter(x => x === 2)
        // .subscribe(() => {
        //   console.log('doubleclick');
        // })


        // clicks.bufferWithTime(300).flatMap(x => {
        //     if (x.length < 2)
        //         clickedRow();
        //     else
        //         clickedRow(true);
        // })

        // define a clicked handler
        let clickedRow = (e, isDblClk = false) => {
            // read out the actual rowno
            let rowNo = this._$cell.closest('.vg-row').attr('data-rowno');
            let coldb = this._$cell.closest('.vg-data-cell').attr('data-col');

            // and select it (perhaps part of a range so include alt etc keys)
            let info: SelectRowInfo = new SelectRowInfo();
            info.ClickedColumn = coldb;

            if (isDblClk)
                info.dblClickedColumn = coldb;
            // info.altKey = e.altKey;
            // info.ctrlKey = e.ctrlKey;
            // info.shiftKey = e.shiftKey;
            info.rowNo = Number.parseInt(rowNo);

            // tell the store to update itself with the selection
            window.setTimeout(() => {
                this.$store.commit("selectRow", info);    
            }, (1));

            // check if we clicked on the group exp/col icon
            if (this._$cell.find(".exp-col").length > 0) {
                this.$store.dispatch("setExpandCollapse", rowNo);
            }
        }

        // attach handlers
        $(this._$cell).on("click", (e) => clickedRow(e));
        $(this._$cell).on("dblclick", (e) => clickedRow(e, true));

    },
    beforeDestroy: function() {
        $(this._$cell).off()
    }
});

//export { CellBase };

