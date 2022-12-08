// Resolve conflict in jQuery UI tooltip with Bootstrap tooltip
$.widget.bridge("uibutton", $.ui.button);

function initMultipleSelect() {
  //Initialize Select2 Elements
  $(".select2bs4").select2();
}

function initSeleted(id) {
  $("#" + id).multiselect({
    minWidth: 300,
    height: 150,
    header: false,
    nonSelectedText: " - - - - - - - - ",
    selectedList: 3,
    required: "required",
    includeSelectAllOption: true,
    selectAllText: " Tout sélectionner",
    allSelectedText: "Tous",

    // enableFiltering: true,
    // enableCaseInsensitiveFiltering: true,
    // enableClickableOptGroups: true,
    // filterPlaceholder: 'Rechercher',
  });
}

function initDataTable(tableId, paging = true) {
  $("#" + tableId)
    .DataTable({
      paging: paging,
      searching: false,
      ordering: true,
      info: true,
      responsive: true,
      lengthChange: true,
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
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      // "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
    })
    .buttons()
    .container()
    .appendTo("#" + tableId + "_wrapper .col-md-6:eq(0)");
}

function initJsGridTable(id, dataArrayOfJson, fields) {
  $("#" + id).jsGrid({
    height: "100%",
    width: "100%",
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
  $(".mb-control").on("click", function () {
    var box = $($(this).data("box"));
    if (box.length > 0) {
      box.toggleClass("open");
      var sound = box.data("sound");
      if (sound === "alert") playAudio("alert");
      if (sound === "fail") playAudio("fail");
    }
    return false;
  });

  $(".mb-control-close, .mb-control-confirm").on("click", function () {
    $(this).parents(".message-box").removeClass("open");
    return false;
  });
  /* END MESSAGE BOX */

  /* PLAY SOUND FUNCTION */
  function playAudio(file) {
    if (file === "alert") document.getElementById("audio-alert").play();
    if (file === "fail") document.getElementById("audio-fail").play();
  }
  /* END PLAY SOUND FUNCTION */
});


function showToast(icon, title){
  var Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  });

  Toast.fire({
    icon: icon, //'success','info','error', 'warning','question',
    title: title // text to show
  })

}


$(document).ready(function () {
  $('.toastrDefaultSuccess').click(function () {
    toastr.success('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.')
  });
  $('.toastrDefaultInfo').click(function () {
    toastr.info('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.')
  });
  $('.toastrDefaultError').click(function () {
    toastr.error('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.')
  });
  $('.toastrDefaultWarning').click(function () {
    toastr.warning('Lorem ipsum dolor sit amet, consetetur sadipscing elitr.')
  });

  $('.toastsDefaultDefault').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultTopLeft').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      position: 'topLeft',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultBottomRight').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      position: 'bottomRight',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultBottomLeft').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      position: 'bottomLeft',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultAutohide').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      autohide: true,
      delay: 750,
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultNotFixed').click(function () {
    $(document).Toasts('create', {
      title: 'Toast Title',
      fixed: false,
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultFull').click(function () {
    $(document).Toasts('create', {
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      icon: 'fas fa-envelope fa-lg',
    })
  });
  $('.toastsDefaultFullImage').click(function () {
    $(document).Toasts('create', {
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      image: '../../assets/img/user3-128x128.jpg',
      imageAlt: 'User Picture',
    })
  });
  $('.toastsDefaultSuccess').click(function () {
    $(document).Toasts('create', {
      class: 'bg-success',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultInfo').click(function () {
    $(document).Toasts('create', {
      class: 'bg-info',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultWarning').click(function () {
    $(document).Toasts('create', {
      class: 'bg-warning',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultDanger').click(function () {
    $(document).Toasts('create', {
      class: 'bg-danger',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
  $('.toastsDefaultMaroon').click(function () {
    $(document).Toasts('create', {
      class: 'bg-maroon',
      title: 'Toast Title',
      subtitle: 'Subtitle',
      body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    })
  });
});

