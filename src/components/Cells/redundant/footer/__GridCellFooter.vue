
// // let's create a Counter component
// export const GridCell = {
//     props: ['myvalue', 'coldef'],
//     template: `
//         <div class='vgrid-data-cell' v-bind:style='mhstyle'>
            
//             <span>{{ myvalue }}</span>
            
//         </div>
//         `,
//     data: function () {
//         return {
//           mhcount: 250,
//           mhstyle: {
//               color: '#5d4d4d',
//               lineHeight: '24px',
//               whiteSpace: 'nowrap',
//               width: this.coldef.width + "px"
//           }
//         }
//       },
//     computed: {
//         rows () {
//             //return vstore.state.count
//             return this.$store.getters.rowsDisplay;
//         },
//         count () {
//             //return vstore.state.count
//             return this.$store.state.count;
//         }
//     },
//     methods: {
//         dodecrement () {
//             this.mhcount--
//         },
//         increment() {
//             console.log("increment");
//             this.mhcount++;
//         }
//     }
//   }


// //   new Vue({
// //     el,
// //     components: { GridGrouper, GridHeader, GridControl, GridDataHolder },
// //     template: `
// //         <div class="vgrid flex-parent-col">
// //             <GridGrouper></GridGrouper>
// //             <GridHeader></GridHeader>
// //             <GridDataHolder></GridDataHolder>
// //             <GridControl></GridControl>
// //         </div>
// //     `
// //   })