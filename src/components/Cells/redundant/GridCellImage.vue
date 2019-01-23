
<template>
    <div ref="mygridcell" class='vg-data-cell' v-bind:style='mhstyle' >
            
        <font-awesome-icon :icon="[this.iconPre, this.iconName]" fa-3x />

        <!-- <font-awesome-icon :icon="[this.iconPre, this.iconName]" v-if="isImage"/> -->

        <!-- <span v-else>{{ getValue }}</span>  -->

    </div>
</template>


<script lang="ts">

// import Vue from "vue";
// import { CellBase } from './CellBase';

// export default Vue.extend({
//     extends: CellBase,
//     // computed: {
//     //     hasRows() {
//     //         return true;
//     //         //return this.$store.state.rowsPrepared > 0;
//     //     }
//     // }
// });
</script>

<style>

</style>