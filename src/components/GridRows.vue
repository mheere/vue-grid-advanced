
<template>
    <div ref="myrows" class='flex-child flex-parent-col vg-row-holder'>

        <div class='vg-row-parent ' v-for="(i, index) in visibleRowCount" :key='index' >
            <GridRow v-bind:rowNo=getRowNo(index) ></GridRow>
        </div>

    </div>
</template>

<script lang="ts">
import * as $ from 'jquery';
import Vue from "vue";
import GridRow from './GridRow.vue';
import { debug } from 'util';
import { clearTimeout, clearInterval, setInterval } from 'timers';

let rows_height_check;
let rows_height_value;  

function checkResizedHeight(){
    let xx = $(this.$refs.myrows);	
    if (this.rows_height_value != xx.height()) {
        this.rows_height_value = xx.height();
        this.$store.commit("refresh");
    }
}

export default {
    components: { GridRow },
    computed: {
        visibleRowCount(): number {
            return this.$store.state.visibleRowCount > 0 ? this.$store.state.visibleRowCount : 0;
        }
    },
    methods: {
        getRowNo : function (iStart: number) {
            let start = this.$store.state.startRow;
            return start + iStart;
        }
    },
    mounted: function() {
        //debugger;
        rows_height_check = setInterval(checkResizedHeight.bind(this), 500);
    },
    beforeDestroy: function() {
        clearInterval(this.rows_height_check);
    }
};
</script>

<style>
    .vg-row-holder {
        background-color: white;
    }
</style>