
<template>
        <div class='vg-filter-style'>
            Filters and Styles
        </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    data: function () {
        return {
          mhcount: 250,
        }
      }
});
</script>

<style>
.vg-filter-style {
    line-height: 26px;
    padding: 0 5px;
    background: #d8d6d6;
    border-top: 1px solid darkgray;
    border-bottom: 1px solid darkgray;
}
</style>