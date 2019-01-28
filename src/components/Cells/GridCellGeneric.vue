

<template>
    <div ref="mygridcell" class='vg-data-cell' v-bind:style='getStyle' >

        <div v-if="this.colDef.isBoolean|| this.colDef.isCheckbox">
            <span :class="{ 'no-text': this.noText }" style='flex: 1; order: 1'>
                <input v-bind:checked="isChecked" type="checkbox"  >
         
            </span> 
        </div>
        <div v-else :class="this.hasText ? 'use-flex-container' : 'use-inline-block'">
            <!-- <div style='display: flex'> -->

            <!-- <span>{{ getValue }}</span>  -->
            <!-- v-if="this.text" -->
            <!-- <span v-if="this.hasText" style='flex: 1; order: 1'>{{ text }}</span>  -->
            <span :class="{ 'no-text': this.noText }" style='flex: 1; order: 1'>{{ text }}</span> 

            <span v-if="this.isImage" :class="{ 'exp-col': this.isGroupingCol }" v-bind:style='getStyleImg'>
                <font-awesome-icon :icon="[this.iconPre, this.iconName]" fa-3x />
            </span>

        </div>

        <!-- <span :class="getImgClass" v-if="this.isImage" v-bind:style='{color: faImageColour}'>
            <font-awesome-icon :icon="[this.iconPre, this.iconName]" fa-3x />
        </span> -->
        
    </div>
</template>

<script lang="ts">

import Vue from "vue";
import { CellBase } from './CellBase';

export default Vue.extend({
    extends: CellBase,
});

</script>

<style lang="scss">
    .use-flex-container {
        display: flex;
    }

    .use-inline-block {
        display: inline-block;
    }

    .no-text {
        content: "&nbsp";
        visibility: hidden;
    }

    .exp-col {
        color: #2a3e6d;
        :hover {
            color: #9e2a2a;;
        }
    }
</style>
