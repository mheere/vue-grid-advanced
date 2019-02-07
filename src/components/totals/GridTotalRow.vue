
<template>
    <div class='vg-footer' >
        
        <span v-for="col in columns" class='vg-row-footer-cell' :key='col.dbName' >

            <GridCellTotal :colDef="col" :frozenMode='frozenMode'></GridCellTotal>

        </span>

    </div>
</template>

<script lang="ts">
import Vue from "vue";
import GridCellTotal from './GridCellTotal.vue';
import { GridColumn } from '../../GridColumns';

export default Vue.extend({
    props: [ 'frozenMode' ],
    components: { GridCellTotal },
    data: function () {
        return {
          mhcount: 250,
         
        }
    },
    computed: {
        visibleColumns(): GridColumn[] {
            return this.$store.getters.visibleColumns;
        },
        columns(): GridColumn[] {
            if (this.frozenMode == "left")
                return this.$store.getters.frozenColumnsLeft;
            else if (this.frozenMode == "right")
                return this.$store.getters.frozenColumnsRight;
            else
                return this.$store.getters.visibleColumns;
        },
    },
    methods: {
        
    }
});
</script>

<style>
    .vg-footer {
        position: relative;
        /* overflow: hidden; */
        white-space: nowrap;
        /* padding: 0 5px;
        line-height: 26px; */
    }

    .vg-row-footer-cell {
        position: relative;
    }
</style>