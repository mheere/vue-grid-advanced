
<template>
    <div class='vg-header-group' >

        <!-- <GridGrouper v-if="isShowingGrouperBar"></GridGrouper> -->

        <div class='vg-header' v-bind:class="{ 'add-grouper-padding' : isShowingGrouperBar }">

            <div v-for="col in columns" class='vg-row-header-cell' :key='col.dbName' >
                <GridCellHeader :colDef="col"></GridCellHeader>
            </div>

            <span ref="insertmarker" class='col-insert-marker' >
                <font-awesome-icon icon="sort-down" class='fa-3x' />
            </span>

        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import GridCellHeader from './GridCellHeader.vue';
import GridGrouper from '../GridGrouper.vue';
import MH from './MH.vue';
import GridCell from '../GridCell.vue';
import { GridColumn } from '../../GridColumns';
//<!-- <i className='fa fa-caret-down fa-2x'></i> -->     v-if="this.showColumnDroppable()"

export default Vue.extend({
    props: [],
    components: { GridCellHeader, GridGrouper },
    methods: {
        showColumnDroppable(): boolean {
            return true;
        },
       
    },
    computed: {
        columns(): GridColumn[] {
            return this.$store.getters.visibleColumns;
        },
        isShowingGrouperBar(): boolean {
            return this.$store.state.showGrouperBar;
        },
        hasPivotColumns(): boolean {
            return this.$store.state.settings.hasPivotColumns;
        },
    },
});
</script>

<style lang="scss" scoped>

    // .vg-header-group {
    //     background-color: #c7daca70;
    // }

    .vg-header {
        position: relative;
        /* overflow: hidden; */
        white-space: nowrap;

        &.add-grouper-padding {
            padding-top: 30px;
        }
    }

    .vg-row-header-cell {
        display: inline-block;
        position: relative;
    }

    .col-insert-marker {
        position: absolute;
        /* right: -8px; */
        /* left: -1000px; */
        top: -23px;
        z-index: 1;
        color: red;
        
        -webkit-transition: left 0.3s; /* Safari */
        transition: left 0.3s;

    }
    
</style>