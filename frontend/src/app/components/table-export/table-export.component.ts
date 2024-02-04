import { Component, OnInit } from '@angular/core';

declare var $: any;
declare var table2pdf: any;
declare var table2csv: any;
declare var table2json: any;
declare var table2excel: any;
declare var printTable: any;


@Component({
  selector: 'table-export',
  templateUrl: './table-export.component.html',
  styleUrls: [
    './table-export.component.css'
  ],
})
export class TableExportComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  csv(name: string = 'data', delimiter: string = ',') {
    table2csv(name, delimiter);
  }

  excel(name: string = 'data') {
    table2excel(name);
  }
  pdf(name: string = 'data') {
    table2pdf(name, 'l');
  }

  json(name: string = 'data') {
    table2json(name)
  }
  
  print(name: string = 'data'){
    printTable(name);
  }
}
