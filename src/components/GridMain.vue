
<template>
    <div class='flex-child vg-my-grid' >
        <div class='flex-nested-start flex-parent-col'>
            
            <div class='vg-sneaky'> </div>

            <!-- <GridGrouper v-if="isShowingGrouperBar"></GridGrouper> -->

            <div class='flex-child vg-data-main' >

                <div class='flex-nested-start flex-parent-row ' style=''>
                    <!-- <div class='flex-parent-row'> -->
                        
                        <div class='frozen-left flex-parent-col' v-if='hasFrozenColsLeft'> 
                            <GridHeader frozenMode='left' />
                            <GridRows frozenMode='left' />
                            <GridTotalRow v-if='isShowingTotalsRow' frozenMode='left' />
                        </div>

                        <div class='flex-child ' ref='mygrid'>
                            <div class='flex-nested-start flex-parent-col flex-scrollable-x' ref='scrolldiv'>
                                <GridHeader frozenMode='none' />
                                <GridRows frozenMode='none' />
                                <GridTotalRow v-if='isShowingTotalsRow' frozenMode='none' />
                            </div>
                        </div>
                        
                        <div class='frozen-right flex-parent-col' v-if='hasFrozenColsRight'> 
                            <GridHeader frozenMode='right' />
                            <GridRows frozenMode='right' />
                            <GridTotalRow v-if='isShowingTotalsRow' frozenMode='right' />
                        </div>

                        <transition name="fade">
                            <ConfigColumns v-if='isShowingColumns' />
                            <ConfigSettings v-if='isShowingSettings' />
                        </transition>

                    <!-- </div> -->
                </div>
                
                <GridVertScroll  />

            </div>

            <GridControl />

        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as $ from 'jquery';
import GridHeader from './header/GridHeader.vue';
import GridTotalRow from './totals/GridTotalRow.vue';
import GridRows from './GridRows.vue';
import GridGrouper from './GridGrouper.vue';
import GridFilterStyle from './GridFilterStyle.vue';
import GridControl from './GridControl.vue';
import GridVertScroll from './GridVertScroll.vue';
import ConfigColumns from './config/ConfigColumns.vue';
import ConfigSettings from './config/ConfigSettings.vue';
import { GridColumn } from '../GridColumns';

export default Vue.extend({
    props: ['rowNo', 'colDef'],
    components: { GridHeader, GridRows, GridGrouper, GridFilterStyle, GridTotalRow, 
                ConfigColumns, ConfigSettings, GridControl, GridVertScroll },
    data: function () {
        return {
          mhcount: 250,
        }
      },
    computed: {
        // rows(): number {
        //     return this.$store.getters.rowsDisplay;
        // },
        rowCount(): number {
            return this.$store.state.rowsPreparedCount;
        },
        isShowingColumns(): boolean {
            return this.$store.state.showGridColumns;
        },
        isShowingSettings(): boolean {
            return this.$store.state.showGridSettings;
        },
        isShowingTotalsRow(): boolean {
            return this.$store.state.showTotalsRow;
        },
        isShowingGrouperBar(): boolean {
            return this.$store.state.showGrouperBar;
        },
        hasFrozenColsLeft(): boolean {
            return this.$store.getters.hasFrozenColsLeft;
        },
        hasFrozenColsRight(): boolean {
            return this.$store.getters.hasFrozenColsRight;
        },
    },
    methods: {
        dodecrement () {
            this.mhcount--
        },
        increment() {
            this.mhcount++;
        },
        handleScroll (event) {
            var width = event.srcElement.clientWidth;
            var leftX = event.srcElement.scrollLeft;
            var rightX = leftX + width;
            //console.log('x', leftX);

            // get the columns from the store
			let columns: GridColumn[] = this.$store.getters.visibleColumns;
	
            // increment the width - then when we are out of sight make the cell invisible...
            var x: number = 0;
            columns.forEach(col => {
                col.dontRender = false;
                if (x > rightX) col.dontRender = true;
                x += col.width;
                if (x < leftX) col.dontRender = true;
            });

        },
    },
    created () {
    },
    beforeDestroy () {
        this.$refs.scrolldiv.removeEventListener('scroll', this.handleScroll);
    },
    mounted: function () {
        
        // handle any horizontal scrolling...
        this.$refs.scrolldiv.addEventListener('scroll', this.handleScroll);

        // 
        $(this.$refs.mygrid).on('click', () => {
            this.$store.commit('resetRightSliders');
        })
    }
});
</script>

<style>

.vg-data-main {
    background: #d3d3d38f;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.frozen-left {
    height: 100%;
    background-color: #e0e4d8;
    border-right: 1px solid #9fa79b;
        overflow: hidden;
}

.frozen-right {
    height: 100%;
    background-color: #e0e4d8;
    border-left: 1px solid #9fa79b;
        overflow: hidden;
}

</style>