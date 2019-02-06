
<template>
    <div class='vg-row' :data-rowno="rowNo"  >
        
        <GridCellGeneric v-for="col in columns" :key='col.dbName'
                v-bind:rowNo="rowNo" v-bind:colDef="col" ></GridCellGeneric>

    </div>
</template>

<script lang="ts">
import Vue from "vue";
import GridCellGeneric from './Cells/GridCellGeneric.vue';
//import GridCellGroupCheckbox from './Cells/GridCellGroupCheckbox.vue';
// import GridCellString from './Cells/GridCellString.vue';
// import GridCellNumber from './Cells/GridCellNumber.vue';
// import GridCellDate from './Cells/GridCellDate.vue';
// import GridCellImage from './Cells/GridCellImage.vue';
// import GridCellCheckbox from './Cells/GridCellCheckbox.vue';
import { GridColumn } from '../GridColumns';

export default Vue.extend({
    props: ['rowNo'],
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
            return this.$store.getters.visibleColumns;
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