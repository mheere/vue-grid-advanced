
<template>
        <div ref="message" class='z-vertical-scrollbar' >
            <div class='ref-verticalScrollbar' >
                <div class='z-vertical-scroller' >
                </div>
            </div>
        </div>
</template>

<script lang="ts">

import Vue from "vue";
import * as $ from 'jquery';
import * as _ from 'lodash';
import GridHeader from './header/GridHeader.vue';
import GridRows from './GridRows.vue';
import GridFilterStyle from './GridFilterStyle.vue';
import { GridColumn } from '../GridColumns';


class MyData {
	//public _btn: JQuery<HTMLElement> = $('dsds');
	//public _parent: JQuery<HTMLElement> = $('dsds');

	public _componenentDidMount: boolean = false;
	public _$parent: any;
	public _$vertScrollbar: any;
	public _$vertScroller: any;
	public _$refVertScroll: any;
	public _$gridRows: any;
	public _$header: any;
	public _rowHeight: number = 0;
}


export default Vue.extend({
    props: ['rowNo', 'colDef'],
    components: {GridHeader, GridRows, GridFilterStyle},
	data: () => new MyData(),
    computed: {
		rowsTotalHeight(): number {
            return this.$store.getters.rowsTotalHeight;
		},
		refresh() {
            return this.$store.state.isRefreshData;
		},
		acceptNewVertScrollRatio() {
			return this.$store.state.setVertScrollRatio;
		}
	},
	watch: {
		refresh(newV, oldV) {
			setTimeout(() => this.checkHeightPositions(), 30);
		},
		acceptNewVertScrollRatio(newV, oldV) {
			if (newV == -1) return;							// if we are resetting then stop
			setTimeout(() => {
				this.setVertScrollRatio(newV);
			}, 30);
			this.$store.commit('setVertScrollRatio', -1);	// reset the setting of the ratio
		}
	},
	mounted: function () {
	
		this._componenentDidMount = true;
		
		this._$parent = $(this.$refs.message).parent();		// should ref the vg-data-main
		
		this._rowHeight = 0;	// start off with
		this._$vertScrollbar = $('.z-vertical-scrollbar', this._$parent);
		this._$vertScroller = $('.z-vertical-scroller', this._$parent);
		this._$refVertScroll = $('.ref-verticalScrollbar', this._$parent);
		this._$gridRows = $('.vg-row-holder.none', this._$parent);
		this._$header = $('.vg-header', this._$parent);

		let debounced2 = _.debounce(() => {
			isScrolling = false;
			this.$store.commit('setIsVertScrolling', false)
		}, 250, { 'trailing': true });

		let isScrolling: boolean = false;

		this._$refVertScroll.scroll(() => {
			if (!isScrolling) {
				isScrolling = true;
				this.$store.commit('setIsVertScrolling', true)
			}
			debounced2();

			this.checkHeightPositions();

		});                    // NOTE - throttles, technically better but do more testing...

		let $vscroll = this._$refVertScroll; 

		this._$gridRows.bind('mousewheel', function (e: any) {

			let speed = 6;
			let offsetY = e.originalEvent.offsetY * speed;
			let newTop;

			if (e.originalEvent.wheelDelta / 120 > 0) {
				newTop = $vscroll.scrollTop() - (offsetY);
			}
			else {
				newTop = $vscroll.scrollTop() + (offsetY);
			}

			$vscroll.scrollTop(newTop)
		});

	},
    methods: {
		setVertScrollRatio(newRatio: number) {

			// calculate the newTop 
			let newTop = this.$store.getters.rowsTotalHeight * newRatio;

			this._$refVertScroll.scrollTop( newTop );
		},
		checkHeightPositions() {

			// if we haven't yet mounted then do NOT continue (elements simply do not yet exist)
			if (!this._componenentDidMount) return;

			// if the grid is not visible then step out
			if (!this._$gridRows.is(':visible')) return;

			// do some calcs
			let startPos = this._$vertScrollbar.offset().top;
			let thisPos = this._$vertScroller.offset().top;
			let diff = thisPos - startPos;

			let headerHeight = this._$header.height();
			this._$vertScrollbar.css("top", headerHeight + "px");

			// get the columns from the store
			let columns: GridColumn[] = this.$store.getters.visibleColumns;
	
			// calculate the total width required - use implicit lodash chaining - reduce (returns single value) ends the chain automatically
			// (could have used _.chain explictly but... he...)
			let totWidth = _(columns)
				.filter(gc => gc.visible)
				.map((gc) => {
					let n = gc.width; 
					return n > 0 ? n : 100;
				})
				.reduce((sum, n) => sum + n, 0);
	
			// set the initial offset of the vert scrollbar
			let bottom = 0;
	
			// if we have a totals row then add 24 px to the bottom
			if (this.$store.state.showTotalsRow)
				bottom += 23;
	
			// if the total columns width > grid window then x scroll is introduced so allow us to jump up 17 px.
			let hasHorzScrollbar = totWidth > this._$gridRows.width();
			if (hasHorzScrollbar) bottom += 17;
	
			let rowsTotalHeight = this.$store.getters.rowsTotalHeight;
			this._$vertScroller.css("height", rowsTotalHeight + "px");

			// set the bottom pos of the vert scrollbar
			this._$vertScrollbar.css("bottom", bottom + "px");
	
			// get the height of the visible window for the rows
			let windowHeight = this._$gridRows.height();

			//console.log("diff: " + diff + ", totHeight: " + windowHeight);

			//this.$store.commit('setDiff', diff);
			//this.$store.commit('setVisibleHeight', windowHeight);

			// check if we have determined the rowHeight - *** - ONE OFF - once set it is done
			// if (this._rowHeight == 0) {
	
			// 	// now go down and find the first row to measure its height
			// 	let $rows = this._$parent.find(".vg-row");      // parent is the .rd-data-main element
	
			// 	// check if we found rows
			// 	if ($rows[0])
			// 		this._rowHeight = $rows[0].clientHeight;
	
			// }

//debugger;
			this.$store.commit('calcRowsToDisplay', { visibleHeight: windowHeight, diff, rowHeight: this._rowHeight, hasHorzScrollbar });
			

	
			//if (windowHeight == 0) return;    // HACK - try this to prevent emtpy screen  - IS THIS STILL RELEVANT?
	
			
	
			// // pass vars off for processing+
			// this.props.onsetScrollDiff(diff, windowHeight, this._rowHeight);
	
			// // bit annoying to have to do this - this function is called twice and the second time the rowsDisplayCount is 0 - so ignore that run!
			// if (this.props.rowsDisplayCount > 0) {
				
			// 	// check if a scroll appeared
			// 	let totalRowHeight = this.props.rowsDisplayCount * this._rowHeight;
			// 	let vScrollAppeared = totalRowHeight > this._$vertScrollbar[0].clientHeight;
	
			// 	// ensure that when we are showing the vert scrollbar we allow padding on the right to allow for that.
			// 	this._$canvas.css("padding-right", vScrollAppeared ? "18px" : "0px");
			// }
	
		}
    },
    created: function () {
		//console.log('created - GridVertScoll');
		//debugger;
      }
	
});

</script>

<style>
#btnHello {
    position: absolute;
}
</style>





// // -----------------------------
// // stack-overflow question
// // -----------------------------

// class MyData {
// 	public _componenentDidMount: boolean = false;
// 	public _myJQueryElement: any;
// }

// var x = Vue.extend({
// 	data: () => new MyData(),
// 	mounted: function () {
// 		// remember we are now mounted
// 		this._componenentDidMount = true;						// this is OK

// 		// on mounting I wish to set the '_myJQueryElement' 
// 		this._myJQueryElement = $('.z-vertical-scrollbar');		// this WORKS
// 	},
//     methods: {
// 		B() {

// 			// I can do this...  (typescript cleverly infers the type to be 'boolean')
// 			var didMount = this._componenentDidMount;			// this is OK

// 			// Now I wish to do 'jquery' stuff with the element
// 			var top: number = this._myJQueryElement.offset().top;	// this now WORKS;

// 		}
// 	}
// }


// -----------------------------
// stack-overflow question
// -----------------------------
// var x = Vue.extend({
//     data: function () {
//         return {
// 		  _componenentDidMount: false,
// 		  _myJQueryElement: $('.just-a-default-empty-non-existing'),
//         }
// 	},
// 	mounted: function () {
// 		// remember we are now mounted
// 		this._componenentDidMount = true;						// this is OK

// 		// on mounting I wish to set the '_myJQueryElement' 
// 		this._myJQueryElement = $('.z-vertical-scrollbar');		// this WORKS
// 	},
//     methods: {
// 		B() {

// 			// I can do this...  (typescript cleverly infers the type to be 'boolean')
// 			var didMount = this._componenentDidMount;			// this is OK

// 			// Now I wish to do 'jquery' stuff with the element
// 			var offset: any = this._myJQueryElement.offset();		// this now WORKS;
// 			var top = offset.top;		

// 		}
// 	}
// }


// class MyData {
// 	public _componenentDidMount: boolean = false;
// 	public _btn: JQuery<HTMLElement> = $('dsds');
// 	//public _parent: JQuery<HTMLElement> = $('dsds');
// 	public _parent: any;
// }


// export default Vue.extend({
//     props: ['rowNo', 'colDef'],
//     components: {GridHeader, GridRows, GridGrouper, GridFilterStyle},
//     // data: function () {
//     //     return {
// 	// 	  mhcount: 250,
// 	// 	  _componenentDidMount: false,
// 	// 	  _btn: $('.just-a-default-empty-non-existing'),
//     //     }
// 	//   },
// 	data: () => new MyData(),
//     computed: {
//         rows(): number {
//             return this.$store.getters.rowsDisplay;
//         },
//         count(): number {
//             return this.$store.state.count;
// 		},
// 		rowsTotalHeight(): number {
//             return this.$store.getters.rowsTotalHeight;
//         }
//     },
//     methods: {
// 		A() {

// 			// if we haven't yet mounted then do NOT continue (elements simply do not yet exist)
// 			if (!this._componenentDidMount) return;

// 			var zzz = this._btn.text();
// 			var zz2 = this._parent.text();

// 			var $newel = $(this._btn);
// 			var top2 = this._parent.offset().top;

// 			var offset: any = this._btn.offset();
// 			var top: number = offset.top;

	
// 			//var startPos = this._btn.offset().top;
	
// 		}
//     },
//     created: function () {
//         console.log('created - GridMain');
//       },
// 	mounted: function () {
		
// 		this._componenentDidMount = true;

// 		var self = this;

// 		this._parent = $(this.$refs.message);

// 		console.log('mounted - GridVertScroll');
// 		this._btn = $('#btnHello');

// 		var top = this._btn.offset();

// 		this._btn.click(function() {
// 			self.A();
// 		})
// 	}
// });







// var mydata = function() {
// 	return {
// 		  mhcount: 250,
// 		  _componenentDidMount: false,
// 		  _parent: $('.just-a-default-empty-non-existing'),
// 		  _vertScrollbar: $('.just-a-default-empty-non-existing'),
// 		  _vertScroller: $('.just-a-default-empty-non-existing'),
// 		  _refVertScroll: $('.just-a-default-empty-non-existing'),
// 		  _gridRows: undefined,
// 		  _headerGroup: undefined,
//         }
// };

// var data = mydata();
// data


