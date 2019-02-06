
<template>
    <div class='vgrid-data-total-cell' v-bind:style='mhstyle' >
        
        <span class="cell-total">{{ text }}</span>

    </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as R from 'ramda'
import * as $ from 'jquery';
import * as numeral from 'numeral'
import { VGridManager, CellStyleInfo } from '../../index'

class MyData {
    public _$cell: any;
    public text: string = "";
    //public isImage: boolean = false;
    //public faImage: string = "coffee";
}

export default Vue.extend({
    props: ['colDef'],
    data: () => new MyData(),
    methods: {
        showSortIconLeft(): boolean {
            return this.colDef.isSorting && this.colDef.align == 'right';
        },
    },
    computed: {
       
        mhstyle(): any {

            let styleBase = {
                position: 'relative',
                display: 'inline-block',
                backgroundColor: 'rgb(228, 228, 228)',
                color: this.colDef.isAggregate ? 'black': 'rgb(228, 228, 228)',
                lineHeight: '22px',
                whiteSpace: 'nowrap',
                width: this.colDef.width + "px",
                textAlign: this.colDef.align,
                borderRight: '1px solid lightgray',
                borderTop: '1px solid rgb(159, 167, 155)',
                padding: '0 2px'
            }
            
            // 
            let text = "";
            if (this.colDef.isAggregate)
                text = this.$store.state.totalsRow[this.colDef.dbName];
            else
                text = ".";

            // do some formatting (for numbers)
            if (this.colDef.isNumber && this.colDef.isFormatting) {
                 text = numeral(text).format(this.colDef.format);
            }

            let style: CellStyleInfo = new CellStyleInfo();
            style.prepare(styleBase, text, this.colDef, this.$store.state.totalsRow, this.$store.state);
            style.rows = this.$store.state.rowsPrepared;
            style.isTotalRow = true;


            VGridManager.processCurrency(this.$store.state.totalsRow, this.colDef, this.$store.state.settings, style);

            // ---------------------------------------------------
            // if user wishes to do some custom styling...
            // ---------------------------------------------------
            let userStyling: any =  R.path(['settings', 'cellStyling'], this.$store.state);
            if (userStyling) {
                style = userStyling(style);       // allow the user to make modifications
            }

            // update our prop with the text that will be used
            this.text = style.textDisplay;

            return style.toStyle();
        }
    },
    mounted: function () {

    }
});
</script>

<style lang="scss" scoped>

.cell-total::before {
    content: "\200B";
    float: left;
}

</style>