
<template>
    <div class='vg-control-bar'>
        <span v-if="rowsPreparedCount > 0">Showing rows: {{ startRow }} to {{ endRow }} out of {{ rowsPreparedCount }}</span>
        <span v-else> - no rows -</span>

        <span v-if='showLastRefreshTime'>
            <span class='vg-refresh-data'>last refresh:</span> <span class='vg-refresh-data2' v-on:click='refreshData'>{{ pageLastRefresh }}</span>
        </span>

        <span>
            <span class='vg-control-columns' v-on:click='showColumns' :class="{ active: isShowingColumns }"><font-awesome-icon :icon="['fas', 'list']" /></span>
            <span class='vg-control-settings' v-on:click='showSettings' :class="{ active: isShowingSettings }"><font-awesome-icon :icon="['fas', 'cog']" /></span>
        </span>

        <!-- <button @click="mhcount--">decrease mhcount</button>
        <button @click="increment">increase mhcount</button> -->
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { VGridSettings } from "../index";
import * as R from 'ramda';
import { constants } from "http2";

export default Vue.extend({
    props: ['rowNo', 'colDef'],
    data: function () {
        return {
            
        }
      },
    computed: {
        startRow(): number {
            return this.$store.state.startRow + 1;
        },
        endRow(): number {
            return this.$store.state.startRow + this.$store.state.visibleRowCount;
        },
        rowsPreparedCount(): number {
            return this.$store.state.rowsPreparedCount;
        },
        pageLastRefresh(): string {
            return this.$store.state.pageLastRefresh;
        },
        showLastRefreshTime(): boolean {
            return this.$store.state.settings.showLastRefreshTime;
        },
        isShowingColumns(): boolean {
            return this.$store.state.showGridColumns;
        },
        isShowingSettings(): boolean {
            return this.$store.state.showGridSettings;
        }
    },
    methods: {
        showColumns: function() {
            this.$store.commit("toggleGridColumns");
        },
        showSettings: function() {
            this.$store.commit("toggleGridSettings");
        },
        refreshData: function() {

            // 
            let requestFreshData: any =  R.path(['settings', 'requestFreshData'], this.$store.state);

            // if no implementation is given then stop
            if (!requestFreshData) return;

            // update ui
            let currentLastRefresh: string = this.$store.state.pageLastRefresh;
            this.$store.commit("setLastRefresh", "refreshing data...");

            // callback for data (pass a ref to the grid for ease of use)
            let vgrid = this.$store.state.settings.vgrid;
            let success = requestFreshData(vgrid);
            if (!success)
                this.$store.commit("setLastRefresh", currentLastRefresh);
        }
    }
});
// <i class="fas fa-list"></i>
//<i class="fas fa-cog"></i>
</script>

<style <style lang="scss">

.vg-refresh-data {
    position: absolute;
    left: 230px;
    color: #576d6d;
}

.vg-refresh-data2 {
    position: absolute;
    left: 300px;
    color: #2c768c;
    cursor: pointer;
}

.vg-control-columns {
    position: absolute;
    right: 35px;
    color: #2c768c;
    cursor: pointer;

    &.active {
        color: red;
    }
}

.vg-control-settings {
    position: absolute;
    right: 10px;
    color: #2c768c;
    cursor: pointer;

    &.active {
        color: red;
    }
}

</style>