
<template>
    <div class='vg-row' :data-rowno="rowNo" v-if='rowNo < maxRowCount' >
        
        <GridCellGeneric v-for="col in columns" :key='col.dbName'
                v-bind:rowNo="rowNo" v-bind:colDef="col" ></GridCellGeneric>

    </div>
</template>

<script lang="ts">
import Vue from "vue";
import GridCellGeneric from './Cells/GridCellGeneric.vue';
import { GridColumn } from '../GridColumns';

export default Vue.extend({
    props: ['rowNo', 'frozenMode', 'maxRowCount'],
    components: { GridCellGeneric },
    data: function () {
        return {
            mhcount: 250,
        }
      },
    computed: {
        hasRows(): boolean {
            return this.$store.state.visibleRowCount > 0;
        },
        isRefreshingData() {
            return this.$store.state.isRefreshData;
        },
        columns(): GridColumn[] {
            if (this.frozenMode == "left")
                return this.$store.getters.frozenColumnsLeft;
            else if (this.frozenMode == "right")
                return this.$store.getters.frozenColumnsRight;
            else
                return this.$store.getters.visibleColumns;
            //return this.$store.getters.visibleColumns;
        }
    },
    methods: {
        dodecrement () {
            this.mhcount--
        },
        increment() {
            this.mhcount++;
        }
    }
});
</script>

<style>
.greeting {
    font-size: 20px;
}
</style>