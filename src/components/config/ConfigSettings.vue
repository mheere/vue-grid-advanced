
<template>
    <div class='vg-config-settings' >
        
       <!-- <h3>Show Grouping</h3>
       <input type="checkbox" id="checkbox" v-model="col.visible"> -->

        <input type="checkbox" id="showGrouping" v-model="showingGrouperBar">
        <label for="showGrouping">Show Grouping</label>

    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    props: [],
    //components: { GridCellTotal },
    data: function () {
        return {
          mhcount: 250,
         
        }
    },
    computed: {
        showingGrouperBar: {
            get () {
                return this.$store.state.showGrouperBar
            },
            set (value) {
                this.$store.commit('updateShowGrouperBar', value)
            }
        }
    },
    methods: {
        
    }
});
</script>

<style>
.vg-config-settings {
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