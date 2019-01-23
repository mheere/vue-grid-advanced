declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}

// also ignore issues
declare module '@fortawesome/*';

declare module 'vue-awesome/*';

// declare module 'jquery-ui'

interface JQuery {
    draggable(options?: any, callback?: Function) : any;
    droppable(options?: any, callback?: Function) : any;
 }