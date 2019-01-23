
<template>
    <div ref="mygridcell" class='vg-data-cell' @click='numberClick' v-bind:style='mhstyle'>

        <!-- <span >{{ thevalue }}</span>  -->
        <span>{{ text }}</span> 

        <span :class="getImgClass" v-if="this.isImage" v-bind:style='{color: faImageColour}'>
            <font-awesome-icon :icon="[this.iconPre, this.iconName]" fa-3x />
        </span>
        
    </div>
</template>

<script lang="ts">

// import Vue from "vue";
// import * as numeral from "numeral";
// import { CellBase } from './CellBase';

// export default Vue.extend({
//     extends: CellBase,
//     methods: {
//         numberClick() {
//             console.log("numberClick derived " + this.getValue);
//         }
//     },
//     // computed: {
//     //     thevalue() {

//     //         let row = this.$store.state.rowsPrepared[this.rowNo];
//     //         if (!row) return "";

//     //         // retrieve the inner value 
//     //         //let number = this.getValue; 
//     //         let number = this.text; 
            
//     //         let curr = "£";
//     //         if (row.currency == "USD") curr = "$"
//     //         if (row.currency == "AUD") curr = "A$"
//     //         if (row.currency == "EUR") curr = "€"
            
//     //         return curr + " " + numeral(number).format('#,##0.00');  
            
//     //     },
//     // },
// });

</script>

<style>

</style>