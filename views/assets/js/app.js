// Resolve conflict in jQuery UI tooltip with Bootstrap tooltip
// $.widget.bridge("uibutton", $.ui.button);

function initMultipleSelect() {
  //Initialize Select2 Elements
  $('.select2bs4').select2();
}

function initSeleted(id) {
  $('#' + id).multiselect({
    minWidth: 300,
    height: 150,
    header: false,
    nonSelectedText: ' - - - - - - - - ',
    selectedList: 3,
    required: 'required',
    includeSelectAllOption: true,
    selectAllText: ' Tout sélectionner',
    allSelectedText: 'Tous',

    // enableFiltering: true,
    // enableCaseInsensitiveFiltering: true,
    // enableClickableOptGroups: true,
    // filterPlaceholder: 'Rechercher',
  });
}

function initDataTable(tableId, paging = true) {
  $('#' + tableId)
    .DataTable({
      paging: paging,
      searching: false,
      ordering: true,
      info: false,
      responsive: false,
      lengthChange: false,
      autoWidth: false,
      sort: false,
      pageLength: 50,
      destroy: true,
      // "orderMulti": true,
      // "orderCellsTop": true,
      // "orderClasses": false,
      // "stateSave": true,
      // "pageLength": 50,

      // "language": {
      //     "aria": {
      //         "sortAscending": " - click/return to sort ascending"
      //     },
      //     "language": {
      //         "lengthMenu": 'Display <select>'+
      //         '<option value="10">10</option>'+
      //         '<option value="20">20</option>'+
      //         '<option value="30">30</option>'+
      //         '<option value="40">40</option>'+
      //         '<option value="50">50</option>'+
      //         '<option value="-1">All</option>'+
      //         '</select> records'
      //     },
      //     "loadingRecords": "Please wait - loading..."
      // },

      // "displayStart": 20,
      // "processing": true,
      // "scrollY": "200px",
      // "paginate": false,
      // "retrieve": true,
      // "scrollY": "200",
      // "scrollCollapse": true,
      buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
      // "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
    })
    .buttons();
  // .container()
  // .appendTo("#" + tableId + "_wrapper .col-md-6:eq(0)");
}

function table2csv(fileName = 'fileName', delimiter = ',') {
  // Export types, support types: ['json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'xlsx', 'pdf'],
  // Default: ['json', 'xml', 'csv', 'txt', 'sql', 'excel']
  $('#export_table').tableExport({
    type: 'csv',
    csvEnclosure: '"',
    csvSeparator: delimiter,
    csvUseBOM: true,
    date: { html: 'dd/mm/yyyy' },
    exportHiddenCells: false,
    fileName: fileName,
    htmlContent: false,
    htmlHyperlink: 'content',
    ignoreColumn: [],
    ignoreRow: [],
    jsonScope: 'all',
    tbodySelector: 'tr',
    tfootSelector: 'tr',
    theadSelector: 'tr',
    tableName: 'myTableName',

    numbers: {
      html: { decimalMark: '.', thousandsSeparator: ',' },
      output: { decimalMark: '.', thousandsSeparator: ',' },
    },

    onAfterSaveToFile: null,
    onBeforeSaveToFile: null,
    onCellData: null,
    onCellHtmlData: null,
    onCellHtmlHyperlink: null,
    onIgnoreRow: null,
    onTableExportBegin: null,
    onTableExportEnd: null,
    outputMode: 'file',
    preserve: { leadingWS: false, trailingWS: false },
    preventInjection: true,
    sql: {
      tableEnclosure: '`',
      columnEnclosure: '`',
    },
  });
  // $('table').table2csv({
  //   filename: fileName + '.csv',
  //   separator: delimiter,
  //   newline: '\n',
  //   quoteFields: true,
  //   excludeColumns: '.noCsv',
  //   excludeRows: '.noCsv',
  //   appendTo: '#out',
  //   trimContent: true, // Trims the content of individual <th>, <td> tags of whitespaces.
  // });
}

function table2pdf(fileName = 'fileName', orientation = 'p') {
  var doc = new jsPDF({
    orientation: orientation,
    unit: 'pt',
    format: 'a4',
    margins: { left: 20, right: 10, top: 10, bottom: 10,width: 600, },
    onDocCreated: null,
  },);
  
  var pageHeight = 0;
  pageHeight = doc.internal.pageSize.height;
  specialElementHandlers = {
    '#bypassme': function (element, renderer) {
      return true;
    },
  };
  // var y = 20;
  doc.setLineWidth(2);
  // doc.text(200, (y = y + 30), 'TOTAL MARKS OF STUDENTS');
  doc.autoTable({
    html: '#export_table',
    startY: 70,
    theme: 'grid',
    // columnStyles: {
    //   0: {
    //     cellWidth: 180,
    //   },
    //   1: {
    //     cellWidth: 180,
    //   },
    //   2: {
    //     cellWidth: 180,
    //   },
    // },
    styles: {
      cellPadding: 2,
      minCellHeight: 12,
      fontSize: 8,
      fillColor: 255,
      textColor: 50,
      fontStyle: 'normal',
      overflow: 'ellipsize',
      halign: 'inherit',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'inherit',
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: 245 },
    tableExport: {
      doc: null,
      onAfterAutotable: null,
      onBeforeAutotable: null,
      onAutotableText: null,
      onTable: null,
      outputImages: true,
    },
  });
  doc.save(fileName+'.pdf');
}

function table2json(fileName) {
  $('#export_table').tableHTMLExport({
    // csv, txt, json, pdf
    type: 'json',
    filename: fileName + '.json',
    ignoreColumns: '',
    ignoreRows: '',
    htmlContent: false,
    consoleLog: false,
    utf8BOM: true,
    charSet: 'utf-8',
  });
}

function table2excel(fileName) {
  $('#export_table').table2excel({
    exclude: '.noExl',
    name: fileName + ' data',
    filename: fileName, //do not include extension
    fileext: '.xlsx', // file extension
    preserveColors: true, // preserve the background and font colors.Default: false
    // exclude_img: true,
    // exclude_links: true,
    // exclude_inputs: true
  });
}

function printTable(fileName) {
   var divToPrint=document.getElementById("export_table");
   newWin= window.open("");
   newWin.document.write(divToPrint.outerHTML);
   newWin.print();
   newWin.close();
}

// function sortTable(tableId) {  
//     $('#'+tableId).on('click', 'th', function () {  
//         var index = $(this).index(),  
//             rows = [],  
//             thClass = $(this).hasClass('asc') ? 'desc' : 'asc';  
//         $('#'+tableId+' th').removeClass('asc desc');  
//         $(this).addClass(thClass);  

//         $('#'+tableId+' tbody tr').each(function (index, row) {  
//           rows.push($(row).detach());  
//         });  
//         rows.sort(function (a, b) {  
//           var aValue = $(a).find('td').eq(index).text(),  
//               bValue = $(b).find('td').eq(index).text();  
//           return aValue > bValue  
//                ? 1  
//                : aValue < bValue  
//                ? -1  
//                : 0;  
//         });  
//         if ($(this).hasClass('desc')) {  
//           rows.reverse();  
//         }  
//         $.each(rows, function (index, row) {  
//           $('#'+tableId+' tbody').append(row);  
//         });  
//       });  
//   }

function sortTable(tableId) {  
  $('#'+tableId).on('click', 'th',function(){
    var table = $(this).parents('table').eq(0);
    // var rows = table.find('tbody tr:gt(0)').toArray().sort(comparer($(this).index()));
    var rows = table.find('tbody tr').toArray().sort(comparer($(this).index()));
    this.asc = !this.asc
    if (!this.asc){rows = rows.reverse()}
    for (var i = 0; i < rows.length; i++){table.append(rows[i])}
  })
 }

  
function comparer(index) {
  return function(a, b) {
      var valA = getCellValue(a, index), valB = getCellValue(b, index)
      return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
  }
}
function getCellValue(row, index){ return $(row).children('td').eq(index).text() }


function initJsGridTable(id, dataArrayOfJson, fields) {
  $('#' + id).jsGrid({
    height: '100%',
    width: '100%',
    sorting: true,
    paging: false,
    // filtering: true,
    // editing: true,
    // inserting: true,
    // deleting: true,
    autoload: true,

    data: dataArrayOfJson,
    fields: fields,
  });
}

$(document).ready(function () {
  //   initDataTable('thinkmd_datatable');
  //   initDataTable('medic_datatable');
  //   initDataTable('sync_chws_datatable');
  //   initDataTable('sync_orgunits_datatable');

  /* MESSAGE BOX */
  $('.mb-control').on('click', function () {
    var box = $($(this).data('box'));
    if (box.length > 0) {
      box.toggleClass('open');
      var sound = box.data('sound');
      if (sound === 'alert') playAudio('alert');
      if (sound === 'fail') playAudio('fail');
    }
    return false;
  });

  $('.mb-control-close, .mb-control-confirm').on('click', function () {
    $(this).parents('.message-box').removeClass('open');
    return false;
  });
  /* END MESSAGE BOX */

  /* PLAY SOUND FUNCTION */
  function playAudio(file) {
    if (file === 'alert') document.getElementById('audio-alert').play();
    if (file === 'fail') document.getElementById('audio-fail').play();
  }
  /* END PLAY SOUND FUNCTION */
});

function showToast(icon, title) {
  var Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
  });

  Toast.fire({
    icon: icon, //'success','info','error', 'warning','question',
    title: title, // text to show
  });
}

// $(document).ready(function () {
//   const boxElem = document.getElementById("box");
//   if (boxElem!=null && boxElem!=undefined) {

//     boxElem.addEventListener("mousedown", logEvent);
//     boxElem.addEventListener("mouseup", logEvent);
//     boxElem.addEventListener("click", logEvent);
//     boxElem.addEventListener("mouseenter", logEvent);
//     boxElem.addEventListener("mouseleave", logEvent);
//   }
// });

// function pageTouched(event){
//   logEvent(event)
// }

// function logEvent(event) {
//   const msg = `Event <strong>${event.type}</strong> at <em>${event.clientX}, ${event.clientY}</em>`;
//   log(msg);
// }

// function log(msg) {
//   const logElem = document.querySelector(".log");

//   const time = new Date();
//   const timeStr = time.toLocaleTimeString();
//   logElem.innerHTML += `${timeStr}: ${msg}<br/>`;
// }

$(document).ready(function () {
  $('.toastrDefaultSuccess').click(function () {
    toastr.success('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.');
  });
  $('.toastrDefaultInfo').click(function () {
    toastr.info('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.');
  });
  $('.toastrDefaultError').click(function () {
    toastr.error('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.');
  });
  $('.toastrDefaultWarning').click(function () {
    toastr.warning('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.');
  });

  $('.toastsDefaultDefault').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultTopLeft').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      position: 'topLeft',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultBottomRight').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      position: 'bottomRight',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultBottomLeft').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      position: 'bottomLeft',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultAutohide').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      autohide: true,
      delay: 750,
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultNotFixed').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      fixed: false,
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultFull').click(function () {
    $(document).Toasts('create', {
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      icon: 'fas fa-envelope fa-lg',
    });
  });
  $('.toastsDefaultFullImage').click(function () {
    $(document).Toasts('create', {
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      image: '../../assets/img/user3-128x128.jpg',
      imageAlt: 'User Picture',
    });
  });
  $('.toastsDefaultSuccess').click(function () {
    $(document).Toasts('create', {
      class: 'bg-success',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultInfo').click(function () {
    $(document).Toasts('create', {
      class: 'bg-info',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultWarning').click(function () {
    $(document).Toasts('create', {
      class: 'bg-warning',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultDanger').click(function () {
    $(document).Toasts('create', {
      class: 'bg-danger',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
  $('.toastsDefaultMaroon').click(function () {
    $(document).Toasts('create', {
      class: 'bg-maroon',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
    });
  });
});
