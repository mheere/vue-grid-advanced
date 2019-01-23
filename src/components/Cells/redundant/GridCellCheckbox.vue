
<template>
    <div ref="mygridcell" class='vg-data-cell' v-bind:style='mhstyle' >
            
        <font-awesome-icon :icon="[this.iconPre, this.iconName]"  />

        <!-- <span>{{ getValue }}</span>  -->

    </div>
</template>


<script lang="ts">

// import Vue from "vue";
// import { CellBase } from './CellBase';

// export default Vue.extend({
//     extends: CellBase,
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