import * as _ from 'lodash';
import * as __core from './core';
import * as moment from 'moment';
import * as R from 'ramda';
import { GridColumn } from './index';

// helper functions
export let getRandomArrayEntry = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];
export let getRandomNumber = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1) ) + min;

// Returns a set of columns that we can hand over to the grid
export function getColumns(): GridColumn[] {

	// define some columns
	let cols: GridColumn[] = [];

	//cols.push(new GridColumn("pkvalue", 120));
	cols.push(new GridColumn("code", 70, "", "", "center"));
	cols.push(new GridColumn("firstname", 160));
	cols.push(new GridColumn("lastname", 160));
	cols.push(new GridColumn("county", 90, "", "", ""));
	cols.push(new GridColumn("dob", 100, "", "date", "center", "DD MMM YYYY"));
	let col = new GridColumn("age", 70, "", "number", "center", "#,##0");
	col.aggregate = "avg";
	cols.push(col);
	cols.push(new GridColumn("optIn", 50, "", "boolean", "center"));
	cols.push(new GridColumn("checkbox", 50, "cb", "checkbox", "center"));
	//cols.push(new GridColumn("checkbox", 50, "cb2", "number", "center"));
	cols.push(new GridColumn("img", 40, "img", "image", "center"));
	cols.push(new GridColumn("currency", 70, "", "", "center"));
	col = new GridColumn("valuation", 120, "", "number", "right", "#,##0.00");
	col.aggregate = "sum";
	cols.push(col);
	for(var i = 0 ; i < 3 ; i++) {
		cols.push(new GridColumn("test" + i, 70, "", "", ""));
	}

	return cols;
}

// inner helper function to calculate someones age based on a date 
// stack overflow answer -> (http://jsfiddle.net/codeandcloud/n33RJ/)
function getAge(dateString) {
	var today = new Date();
	var birthDate = new Date(dateString);
	var age = today.getFullYear() - birthDate.getFullYear();
	var m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}

// define some data arrays
let firstNames = ["Marcel", "Deniz", "Sam", "Tom"];
let lastNames = ["Heeremans", "de Wit", "van Dam", "Bakker", "van Oostenbroek", "de Boer"];
let counties = ["Kent", "Surrey", "Devon", "Cornwall"];
let currencies = ["USD", "GBP", "EUR", "AUD"];

// https://fontawesome.com/v4.7.0/icons/
let arrImages = ["coffee", "cog", "database", "o-square", "o-plus-square", "circle", "o-circle"];
let arrUpDown = ["arrow-circle-down", "arrow-circle-up"];

// create sample data given a number of rows to create
export function createData(newRowCount: number = 500): any[] {

	let rows: any[] = [];

	let createRow = (i: number) => {
			var row: any = {};
			row.index = i;
			row.code = "Code" + i.toString();
			row.firstname = getRandomArrayEntry(firstNames);
			row.lastname = getRandomArrayEntry(lastNames);
			row.county = getRandomArrayEntry(counties);
			row.currency = getRandomArrayEntry(currencies);
			row.optIn = getRandomNumber(3) == 1 ? "Y" : "N";
			row.checkbox = getRandomNumber(5);
			row.dob = moment().subtract(getRandomNumber(36500), 'days')
			row.age = getAge(row.dob);
			row.updown = getRandomArrayEntry(arrUpDown);
			row.valuation = getRandomNumber(10000);
			row.img = getRandomArrayEntry(arrImages);

			for(var i = 0 ; i<10 ; i++) {
				row['test' + i] = getRandomArrayEntry(counties);
			}

			return row;
	}

	R.times((i) => rows.push(createRow(i)), newRowCount);

	return rows;
}

