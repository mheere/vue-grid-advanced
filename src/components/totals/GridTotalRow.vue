
<template>
    <div class='vg-footer' >
        
        <span v-for="col in visibleColumns" class='vg-row-footer-cell' :key='col.dbName' >

            <GridCellTotal :colDef="col"></GridCellTotal>

        </span>

    </div>
</template>

<script lang="ts">
import Vue from "vue";
import GridCellTotal from './GridCellTotal.vue';
import { GridColumn } from '../../GridColumns';

export default Vue.extend({
    props: [],
    components: { GridCellTotal },
    data: function () {
        return {
          mhcount: 250,
         
        }
    },
    computed: {
        visibleColumns(): GridColumn[] {
            return this.$store.getters.visibleColumns;
        }
    },
    methods: {
        // decrement () {
        //     this.$store.commit('decrement');
        // },
        // increment() {
        //     this.$store.commit('increment');
        // },
        // increment2() {
        //     this.$store.commit('incrementLineHeight');
        // }
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