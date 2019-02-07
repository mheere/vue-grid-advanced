import * as _ from 'lodash';
import Vue from 'vue';
import {Store} from 'vuex';
import * as __core from './core';
import { VGridManager, GridStateInfo, VGridSettings, SelectRowInfo, UpdateRowInfo, FindRowInfo } from './index';


// ---------------------------------------------------
// Specification of what the VGrid looks like - most work is
// done within the Store...
// ---------------------------------------------------
export class VGrid {
		
	constructor(settings: VGridSettings) {
		
		// hang on to this grid instance - sole reason is that we can pass this grid
		// back to the caller when we notify them for stuff
		settings.vgrid = this;

		// check if any columns are pivotted - if they are we need the settings to know about it
		settings.hasPivotColumns = settings.columns.hasItem(item => item.pivotHeader);

		// ask the GridManager to create us a VGrid given its settings
		let ret = VGridManager.createGrid(settings);
		this.vm = ret.vm;
		this.store = ret.store;

		// watch the getter
		this.store.watch(this.store.getters.getGridStateInfoIdentifier, (newV: GridStateInfo) => {
			if (this.onChanged)
				this.onChanged(newV);
		})

		// if the user wishes to see the last refresh time then start the interval
		if (settings.showLastRefreshTime)
			this.startLastDataRefresh();
	}

	public vm: Vue = null;						// the Grid's Vue instance
	public onChanged: (info: GridStateInfo) => void;         // callback function called when row(s) selection (checked) changes

	private store: Store<any> = null;
	private lapsedInterval: any = undefined;	// ref to the interval so we can reset it
	private lapsedMinutes: number = 0;          // used to indicate last refresh of data

	public getCheckedItems(): string[] {
		let arr: string[] = [];
		return arr;
	}
	public findAndSelect(idValue: string, idColumn: string = "") {
		let info: SelectRowInfo = new SelectRowInfo();
		info.findIDValue = idValue;
		info.findIDColumn = idColumn;
		this.selectRow(info);
	}
	public selectRow(info: SelectRowInfo) {
		this.store.commit("selectRow", info);
	}
	public setData(rows: any) {
		this.store.dispatch("setData", rows);
		this.startLastDataRefresh();
	}
	public setGroupColumns(cols: string[]) {
		this.store.dispatch("setGroupColumns", cols);
	}
	public refresh() {
		this.store.commit("refresh");
	}
	public getStore(): Store<any> {
		return this.store;
	}
	public getStateInfo() : GridStateInfo {
		return __core.deepClone(this.store.state.gridStateInfo);
	}
	public getCurrentRow(): any {
		return __core.deepClone(this.store.state.selectedRow);
	}
	public getRow(info: FindRowInfo): any {
		let state = this.store.state;
		let idCol = info.findIDColumn ? info.findIDColumn : state.settings.idColumn;		// get the column to look for
		let row = state.rowsPrepared.findItem((row: any) => row[idCol] == info.findIDValue);	// return the found row
		return __core.deepClone(row);
	}
	public updateData(info: UpdateRowInfo) {
		this.store.dispatch("updateData", info);
	}
	public getSettings(): string {
		//debugger;
		let columns = JSON.stringify(this.store.state.columns);
		return columns;
	}
	public destroy() {
		
		this.vm.$el.remove();

		// clear the interval if one was created
		this.clearLastDataRefresh();

		// clear the grid
		this.vm.$destroy();
		this.store = null;
		this.vm = null;
	}

	// -----------------------------
	// internal
	// -----------------------------
	// starts the interval that will keep track how long ago the data was last refreshed
	private startLastDataRefresh() {

        // start with a refresh to initialise the timer display
		this.store.commit("setLastRefresh", "under a minute");

        // create an Interval period of a minute
		let interval: number = 60 * 1000;

		// if a timer was started then reset it and start again.
		this.clearLastDataRefresh();
		
		// start the interval
        this.lapsedInterval = setInterval(() => {

            // trick since this is also set when user refreshes the data externally after which the store sets this to 'under a minute'
            if (this.store.state.pageLastRefresh.startsWith("under"))
                this.lapsedMinutes = 1;
            else
                this.lapsedMinutes++;

            let s = this.lapsedMinutes + " minutes ago";
            if (this.lapsedMinutes == 1) s = "a minute ago";
            if (this.lapsedMinutes > 60) s = "over an hour ago";
            if (this.lapsedMinutes > 120) s = "over two hours ago";
            if (this.lapsedMinutes > 180) s = "over three hours ago";
            if (this.lapsedMinutes > 240) s = "long time ago";

            // 
            this.store.commit("setLastRefresh", s);

        }, interval);
	}
	
	private clearLastDataRefresh() {
		if (this.lapsedInterval != undefined)
			clearInterval(this.lapsedInterval);
	}

}
