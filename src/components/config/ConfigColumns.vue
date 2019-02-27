
<template>
    <div class='flex-parent-col vg-config-columns' >
        <div class='vg-config-header'>
            <span @click='selectAll' class='vg-header-lbl-btn'>select all</span>
            <span @click='selectNone' class='vg-header-lbl-btn'>select none</span>
        </div>
        <div class='flex-child' style='overflow: auto;'>
            <span v-for="col in columns" class='vg-config-column-item' :key='col.dbName' >
                <div> 
                    <input type="checkbox" id="checkbox" v-model="col.visible">
                    <label for="checkbox">{{ col.dbName }}</label>
                    <!-- {{ col.dbName }}  -->
                </div>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { GridColumn } from '../../GridColumns';

export default Vue.extend({
    props: [],
    //components: { GridCellTotal },
    data: function () {
        return {
          mhcount: 250,
         
        }
    },
    computed: {
        columns(): GridColumn[] {
            return this.$store.state.columns;
        }
    },
    methods: {
        selectAll() {
            this.$store.commit("showAllColumns");
        },
        selectNone() {
            this.$store.commit("hideAllColumns");
        }
    }
});
</script>

<style lang="scss">
.vg-config-columns {
    background: rgb(130, 130, 130);
    color: white;
    border: 1px solid #ecff34;
    width: 160px;
    position: absolute;
    right: 0px;
    bottom: 0px;
    top: 0px;
    z-index: 7;
    padding: 5px;
    opacity: 0.91;
    font-size: 1.1em;
}

.vg-config-column-item {
    height: 20px;
}

.vg-config-header {
    height: 21px;
    border-bottom: 1px solid #d3d3d36e;
}

.vg-header-lbl-btn {
    color: floralwhite;
    background-color: #524f4f;
    padding: 2px 6px;
    border-radius: 4px;

    &:hover {
        color: yellow;
    }
}

</style>