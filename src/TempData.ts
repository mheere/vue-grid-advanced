import * as _ from 'lodash';
import * as __core from './core';
import * as moment from 'moment';
import * as R from 'ramda';
import { GridColumn } from './index';

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
	cols.push(new GridColumn("img", 40, "img", "image", "center"));
	cols.push(new GridColumn("currency", 70, "", "", "center"));
	col = new GridColumn("valuation", 120, "", "number", "right", "#,##0.00");
	col.aggregate = "sum";
	cols.push(col);

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

// helper functions
let randomEntry = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];
let randomNumber = (n) => Math.floor((Math.random() * n));

// create sample data given a number of rows to create
export function createData(newRowCount: number = 500): any[] {

	let rows: any[] = [];

	let createRow = (i: number) => {
			var row: any = {};
			row.index = i;
			row.code = "Code" + i.toString();
			row.firstname = randomEntry(firstNames);
			row.lastname = randomEntry(lastNames);
			row.county = randomEntry(counties);
			row.currency = randomEntry(currencies);
			row.optIn = randomNumber(3) == 1 ? "Y" : "N";
			row.dob = moment().subtract(randomNumber(36500), 'days')
			row.age = getAge(row.dob);
			row.updown = randomEntry(arrUpDown);
			row.valuation = randomNumber(10000);
			row.img = randomEntry(arrImages);
			return row;
	}

	R.times((i) => rows.push(createRow(i)), newRowCount);

	return rows;
}
