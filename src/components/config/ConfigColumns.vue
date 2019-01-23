
<template>
    <div class='vg-config-columns' >
        
        <span v-for="col in columns" class='vg-config-column-item' :key='col.dbName' >
            <div> 
                <input type="checkbox" id="checkbox" v-model="col.visible">
                <label for="checkbox">{{ col.dbName }}</label>
                <!-- {{ col.dbName }}  -->
            </div>
        </span>

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
        
    }
});
</script>

<style>
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
    overflow: auto;
    opacity: 0.91;
    font-size: 1.1em;
}
</style>