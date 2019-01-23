

<template>
    <div ref="mygridcell" class='vg-data-cell'  >

        <!-- <span>{{ getValue }}</span>  -->
        <input type="checkbox" id="checkbox" v-model="checked">

    </div>
</template>

<script lang="ts">

import Vue from "vue";
import { CellBase } from './CellBase';

export default Vue.extend({
    //extends: CellBase,
    data: function() {
        return {
            checked: true
        }
    }
});

</script>

<style>
    
</style>