
<template>
        <div ref="mygrouper" class='vg-grouper'>
            
            <span v-for="col in groupingColumns" class='vg-grouper-cell' 
                :data-group-col-name="col" :key='col' v-draggable >
                
                <span> 
                    {{ col }}
                </span>

                <span class='vg-grouper-close' @click='removeGroupColumn(col)' >
                    <font-awesome-icon  icon="times" />
                </span>
            </span>

             <span v-if='this.dropOverColumn' class='vg-grouper-cell-maybe'> 
                {{ this.dropOverColumn }}
            </span>

            <span ref="insertmarker" class='group-insert-marker' >
                <font-awesome-icon icon="sort-down" class='fa-3x' />
            </span>

        </div>
</template>

<script lang="ts">
import Vue from "vue";
import HeaderComponent from './header/Header.vue';
import * as $ from 'jquery';

export default Vue.extend({
    props: ['rowNo', 'colDef'],
    data: function () {
        return {
          dropOverColumn: "",
        }
      },
    computed: {
        groupingColumns(): string[] {
            return this.$store.state.groupingColumns;
        },
    },
    methods: {
        removeGroupColumn(dbName: string) {
            this.$store.dispatch('removeGroupColumn', dbName);
        },
    },
    mounted: function () {
        
        // when mounted we find the cell and hang on to it
        this._$grouper = $(this.$refs.mygrouper);

        let store = this.$store;

        let $colInsertMarker = this._$grouper.find('.group-insert-marker');
		$colInsertMarker.hide();

        // attach 'droppable' behaviour
        this._$grouper.droppable({
            over: (event: any, ui: any) => {
                this.dropOverColumn = ui.draggable.data("colName");
            },
            out: (event: any, ui: any) => {
                this.dropOverColumn = "";
            },
			drop: (event: any, ui: any) => {
                this.dropOverColumn = "";           // reset the dropOverColumn
                let cn = ui.draggable.data("colName");
                if (!cn) return;
                this.$store.dispatch('addGroupColumn', cn);
			},
        });
        
    },
    directives: {
        draggable: {
            inserted: function (el: any, binding: any, vnode: any) {
                let $elGrouper: any = $(el).closest('.vg-grouper');
                let $colInsertMarker = $elGrouper.find('.group-insert-marker');

                try {
                    $elGrouper.draggable( "destroy" );
                }
                catch(err) {
                    let qq = err;
                }
                finally{}

                $(el).draggable({
                    containment: "parent",
                    axis: "x",
                    opacity: 0.7,
                    //helper: () => $('<div>Marcello</div>'),
                    helper: "clone",
                    appendTo: $elGrouper,
                    start: (event: any, ui: any) => {

                        $colInsertMarker.show();

                        $(ui.helper).css('backgroundColor', '#800080a1');
                        $(ui.helper).css('color', 'white');
                        
                        let position = $(el).offset();
                        //let newX = position.left - 23;
                        let newX = position.left - 23 + (el.offsetWidth / 2);
                        $colInsertMarker.css('left', newX);
                    },
                    stop: (event: any, ui: any) => {
                        $colInsertMarker.hide();
        			},
                });

                $(el).droppable({
                    over: (event: any, ui: any) => {

                        let colDest = $(el).attr('data-group-col-name');
                        let colSource = $(ui.helper).attr('data-group-col-name');

                        let state = vnode.context.$store.state;
				        let posSource = state.groupingColumns.indexOf(colSource);
                        let posDest = state.groupingColumns.indexOf(colDest);

                        let position = $(el).offset();
                        let newX = position.left - 23;
                        
                        // if we are moving 'right' then add the width
                        if (posDest > posSource) 
                            newX += el.offsetWidth;
                        
                        $colInsertMarker.css('left', newX);

                    },
                    drop: (event: any, ui: any) => { 
                        let colDest = $(el).attr('data-group-col-name');
                        let colSource = $(ui.helper).attr('data-group-col-name');
                        if (!colDest || !colSource) return;
                        vnode.context.$store.dispatch('reGroupColumn', { source: colSource, dest: colDest });
                    },
                });

            }
        }
    }
});
</script>

<style lang="scss" scoped>
    .vg-grouper {
        overflow: auto;
        // background-color: #dadada;
        padding: 0 5px;
        line-height: 30px;
        min-height: 30px;
        position: fixed;
        z-index: 5;
        width: 100%;
        line-height: 30px;
        // overflow: auto;
        // background-color: #dadada;
        // padding: 0 5px;
        // line-height: 30px;
        // min-height: 30px;
        // border-bottom: 1px solid darkgray;
        // position: relative;
    }
    .vg-grouper-cell {
        position: relative;
        margin: 0 3px;
        border: 2px solid #88ab81;
        border-radius: 4px;
        padding: 1px 16px 1px 14px;
        color: darkblue;
    }
    .vg-grouper-close {
        
        position: absolute;
        top: -7px;
        right: 4px;
        color: transparent;

        -webkit-transition: color 0.5s ;
        -moz-transition: color 0.5s ;
        -o-transition: color 0.5s;
        transition: color 0.5s ;

        &:hover {
            color: red!important;
        }
    }

    .vg-grouper-cell:hover {
        .vg-grouper-close {
            color: #858f9c;
        }
    }

    .vg-grouper-cell-maybe {
        position: relative;
        margin: 0 3px;
        border: 2px solid #a90909;
        border-radius: 4px;
        padding: 1px 16px 1px 14px;
        color: #ad1212;
    }

    .group-insert-marker {
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