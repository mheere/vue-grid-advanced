

<template>
    <div ref="mygridcell" class='vg-data-cell' v-bind:style='mhstyle' >

        <!-- <span>{{ getValue }}</span>  -->
        <span>{{ text }}</span> 

        <span :class="getImgClass" v-if="this.isImage" v-bind:style='{color: faImageColour}'>
            <font-awesome-icon :icon="[this.iconPre, this.iconName]" fa-3x />
        </span>
        
    </div>
</template>

<script lang="ts">

// import Vue from "vue";
// import { CellBase } from './CellBase';

// export default Vue.extend({
//     extends: CellBase,
//     // computed: {
//     //     getImgClass() {
//     //         if (this.colDef.isRightAlign)
//     //             return "pulse-cell-img-left";
//     //         else
//     //             return "pulse-cell-img-right";

//     //     }
//     // }
// });

</script>

<style>
    
</style>