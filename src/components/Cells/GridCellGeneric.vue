

<template>
    <div ref="mygridcell" class='vg-data-cell' v-bind:style='getStyle' :data-col='this.colDef.dbName'>

        <div v-if="blankCell" style='flex: 1; order: 1' class="use-inline-block">
            
        </div>

        <div v-else-if="this.colDef.isBoolean|| this.colDef.isCheckbox" style='flex: 1; order: 1'>
            <input v-model="isChecked" v-bind:disabled="canEdit" type="checkbox"  >
        </div>

        <div v-else :class="this.hasText ? 'use-flex-container' : 'use-inline-block'">
            
            <span :class="{ 'no-text': this.noText }" style='flex: 1; order: 1'>{{ text }}</span> 

            <span v-if="this.isImage" :class="{ 'exp-col': this.isGroupingCol }" v-bind:style='getStyleImg'>
                <font-awesome-icon :icon="[this.iconPre, this.iconName]" fa-3x />
            </span>

        </div>
        
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

    .vg-data-cell {

        input {
            vertical-align: middle;
        }
    }
</style>
