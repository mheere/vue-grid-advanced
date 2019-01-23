
<template>
    <div ref="mygridcell" class='vg-data-cell' v-bind:style='mhstyle'>

        <span>{{ thevalue }}</span> 
        
    </div>
</template>

<script lang="ts">

// import Vue from "vue";
// import * as moment from "moment";
// import { CellBase } from './CellBase';

// export default Vue.extend({
//     extends: CellBase,
//     computed: {
//         thevalue() {
//             let date = this.text;
//             if (!date) return "";
//             return moment(date, "DD/MMM/YYYY").format('DD MMM YYYY');  
//         },
//     }
// });

</script>

<style>

</style>