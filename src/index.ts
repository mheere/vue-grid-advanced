
import Vue from 'vue';
import Vuex from 'vuex';

import './styles/flex.css';
import './styles/demo.scss';
import './styles/v-grid.scss';

// load the draggable into the bundle
require("jquery-ui/ui/widgets/draggable");
require("jquery-ui/ui/widgets/droppable");

import './utils'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

// FontAwesome - Add all icons to the library so you can use it in your page
library.add(fas, far)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false;

// make Vue aware of Vuex
Vue.use(Vuex);

// -----------------------------------------
// specific exports for npm package
// re-export so it comes from a single package
// --------------------------------------------------
export { GridStateInfo, VGridSettings, SelectRowInfo, UpdateRowInfo, FindRowInfo, CellStyleInfo } from './VGridUtils';
export { VGrid } from './VGrid';
export { VGridManager } from './VGridManager';
export { GridColumn, HeaderInfo } from './GridColumns';
export { getColumns, createData, getRandomArrayEntry, getRandomNumber } from './TempData';


