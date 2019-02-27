
<template>

	<div class=' flex-parent-col'  >

		<!-- First show the additional headers -->
		<div v-for="(headerInfo, index) in headerRest" class="vgrid-data-header-cell" v-bind:style="mhstyle(index)" :key='index'>
			<span class='header-text' v-bind:class="{ 'pivot-header-cell' : headerInfo.isVert }">{{ headerInfo.header }}</span>
		</div>

		<!-- Then show the MAIN header -->
		<div ref="myheadercell" class="vgrid-data-header-cell" v-bind:style="mhstyle(-1)" @click="sort" :data-col-name="colName">
			<font-awesome-icon v-bind:class="headerSortClass()" v-bind:icon="this.sortIcon()" v-if="this.showSortIconLeft()"/>

			<span class='header-text' v-bind:class="{ 'pivot-header-cell' : headerZero.isVert }">{{ colDef.header }}</span>

			<font-awesome-icon v-bind:class="headerSortClass()" v-bind:icon="this.sortIcon()" v-if="this.showSortIconRight()"/>

			<div class="vg-header-resize-marker"></div>
			
		</div>
	</div>

</template>

<script lang="ts">
import Vue from "vue";
import * as $ from "jquery";
import { GridColumn } from "../../GridColumns";

class MyData {
	public _$cell: any;
	//public isImage: boolean = false;
	//public faImage: string = "coffee";
}

export default Vue.extend({
	props: ["colDef"],
	data: () => new MyData(),
	methods: {
		sort: function(event: any) {
			let colName = this._$cell.attr("data-col-name");
			console.log("clicked colName: " + colName);
			//this.$store.commit("setSortColumn", colName);
			this.$store.dispatch("setSortColumn", colName);
		},
		showSortIconLeft(): boolean {
			return this.colDef.isSorting && this.colDef.align == "right";
		},
		showSortIconRight(): boolean {
			return this.colDef.isSorting && this.colDef.align != "right";
		},
		sortIcon(): string {
			return this.colDef.sortIcon;
		},
		headerSortClass(): string {
			if (this.colDef.sortDirection.isSame("asc"))
				return "header-sort-img-asc";
			else return "header-sort-img-desc";
		},
		mhstyle(index): any {
			let style: any = {
				position: "relative",
				display: "inline-block",
				backgroundColor: "#f5f5f5",
				color: "black",
				whiteSpace: "nowrap",
				width: this.colDef.width + "px",
				textAlign: this.colDef.align,
				borderRight: "1px solid lightgray",
				borderBottom: "1px solid #798872",
				padding: "6px"
			};
			
			// 
			let setHeight = hinfo => {
				if (hinfo.isHorz) {
					style.lineHeight = "26px";
				}
				else {
					style.height = hinfo.height + 'px';
				}
			}

			// if -1 then we are dealing with the MAIN header row
			if (index == -1) 
				setHeight(this.headerZero);
			else
				setHeight(this.headerRest[index]);
			
			// 
			if (this.$store.state.showGrouperBar) {
				style.borderTop = "1px solid #798872";
			}

			return style;
		}
	},
	computed: {
		headerZero() {
			return this.colDef.headers[0];
		},
		headerRest() {
			return this.colDef.headers.slice(1).reverse();
		},
		colName(): string {
			return this.colDef.dbName;
		},
		
	},
	mounted: function() {
		// when mounted we find the cell and hang on to it
		this._$cell = $(this.$refs.myheadercell);

		let $colResizeMarker = $(".vg-header-resize-marker", this._$cell);
		//let $colInsertMarker = $(this.$refs.insertmarker);

		//$colInsertMarker.hide();
		//let isResizing: boolean = false;

		let $grid = this._$cell.closest(".vg-my-grid");

		let $headerCell = this._$cell.closest(".vg-row-header-cell");
		let $header = this._$cell.closest(".vg-header");
		let $headerGroup = this._$cell.closest(".vg-header-group");
		let $grouper = this._$cell.closest(".vg-my-grid").find(".vg-grouper");
		let $sneaky = this._$cell.closest(".vg-my-grid").find(".vg-sneaky");

		let $colInsertMarker = $header.find(".col-insert-marker");
		$colInsertMarker.hide();

		let colName = this._$cell.attr("data-col-name");
		let initialWidth = 0;
		let initialXOffsetLeft = 0;
		let resizeColNameDragTarget = "";
		let store = this.$store;

		// ----------------------------------------------
		// drag the resize marker to another alter the column width
		// ----------------------------------------------
		$colResizeMarker.draggable({
			containment: $header,
			opacity: 0.7,
			scroll: true,
			axis: "x",
			//helper: "clone",
			start: function(event: any, ui: any) {
				// tell the store we are resizing a column
				store.commit("setColumnIsBeingResized", true);

				// retrieve the mapitem for this column (so we can adjust the col width)
				let width = $headerCell.outerWidth();

				// take some initial positions we need for adjusting properly..
				initialXOffsetLeft = ui.offset.left;
				initialWidth = width;

				console.log(
					`initialWidth: ${initialWidth}, initialXOffsetLeft: ${initialXOffsetLeft}`
				);
			},
			stop: function(event: any, ui: any) {
				// tell the store we have stopped resizing a column
				store.commit("setColumnIsBeingResized", false);
				// 
				$colResizeMarker.css("left", "");
			},
			drag: function(event: any, ui: any) {
				// calculate the new col width
				let diff = ui.offset.left - initialXOffsetLeft;
				let newCW = initialWidth + diff;
				if (newCW < 20) newCW = 20;
				//self.props.onSetColWidth(resizeColNameDragTarget, newCW);

				store.commit("resizeColumn", { colName, newCW });

				//console.log("resizeColName drag: " + resizeColNameDragTarget + " " + newCW);
				//console.log(`resizeColumn: ${resizeColNameDragTarget}, newCW: ${newCW}, ui.offset.left: ${ui.offset.left}, diff: ${diff}`);
			}
		});

		// specify a specific x,y region that will form the 'bounds' for my draggable cell
		let aaa = $grouper.height() + $header.height();
		$sneaky.height(aaa);

		// ----------------------------------------------
		// drag the column to another col location
		// ----------------------------------------------
		this._$cell.draggable({
			containment: $headerGroup,
			opacity: 0.9,
			scroll: true,
			//zIndex: 100,
			//axis: "x",
			helper: "clone",
			appendTo: $grid,
			start: (event: any, ui: any) => {
				//console.log("GridHeader ", "cell-header.draggable", "start")
				//   dragStartColName = $(this).attr('data-grid-header');      // track the start colname (the column we are dragging)
				//   self._isDraggingColumn = true;                            // keep track that we are now dragging!
				//   self.$insertmarker.addClass("show");

				// if this column is a grouping column then do NOT allow it to be draggable
				//if (store.getters.isGroupingCol(this.colDef)) return;

				// reset the target column name when dragging starts
				store.commit("setDragSourceColumnName", colName);
				store.commit("setDragTargetColumnName", "");

				$(ui.helper).css("backgroundColor", "#800080a1");
				$(ui.helper).css("color", "white");

				let position = this._$cell.offset();
				let newX = position.left - 23;
				$colInsertMarker.css("left", newX);
			},
			stop: (event: any, ui: any) => {
				$colInsertMarker.hide();

				store.commit("resortColumn");
			}
		});
		// attach 'droppable' behaviour
		this._$cell.droppable({
			over: (event: any, ui: any) => {
				if (store.state.isColumnResizing) return;

				//console.log("GridHeader ", "cell-header.droppable", "over")
				//if (!self._isDraggingColumn) return;                     // if we are not in 'dragging' mode then ignore any 'moving over' events that can be raised.
				//dragOverColName = $(this).attr('data-grid-header');      // track the colname of the column we are hovering over

				store.commit("setDragTargetColumnName", colName);

				// make sure we show the insert marker (red arrow between the columns)
				$colInsertMarker.show();

				let x4 = ui.offset.left;

				// calculate insert markers position
				let position = this._$cell.offset();
				let newX = position.left - 23;

				// ------------------
				let colDest = colName;
				let colSource = store.state.dragSourceColumnName;

				let mycols: GridColumn[] = store.getters.visibleColumns;
				let posSource = mycols.findIndex(c =>
					c.dbName.isSame(colSource)
				);
				let posDest = mycols.findIndex(c => c.dbName.isSame(colDest));

				// if we are moving 'right' then add the width
				if (posDest > posSource) newX += this._$cell.width() + 12;
				// ------------------

				//let newX = x4 - 23;
				$colInsertMarker.css("left", newX);
			}
		});
	}
});
</script>

<style lang="scss" scoped>
.header-sort-img-desc {
	/* float: left; */
	/* margin-left: 3px; */
	margin-bottom: 3px;
	margin-left: 3px;
	margin-right: 3px;
}

.header-sort-img-asc {
	/* float: right; */
	/* margin-left: 3px;
        margin-top: 6px; */
	margin-bottom: -3px;
	margin-left: 3px;
	margin-right: 3px;
}

.vg-header-resize-marker {
	height: 100%;
	width: 5px;
	background-color: transparent;
	position: absolute;
	right: -2px;
	top: 0px;
	opacity: 0;
	transition: background-color 0.3s;
}

/* .vgrid-data-header-cell {
        
        
    } */

.vgrid-data-header-cell:hover .vg-header-resize-marker {
	opacity: 0.5;
	background-color: #c8ced8;
	cursor: col-resize;
	z-index: 2;
	transition-delay: 0.5s;
}

.vg-header-resize-marker:hover {
	opacity: 1 !important;
}

// .col-insert-marker {
//     position: absolute;
//     right: -8px;
//     top: -15px;
// 	z-index: 1;
// 	color: red;
// }
</style>