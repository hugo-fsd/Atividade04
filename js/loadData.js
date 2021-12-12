$('#myTable').DataTable({
    ajax: {
        url: '/api/gpus',
        dataSrc: ""
    },

    columns:
    [
      {data: "gpuName"},
      {data: "price"},
      {data: "sellerName"}, 
      {data: "url"}
      
    ],

    columnDefs:
    [{
        targets: 3,
        render: $.fn.dataTable.render.hyperLink("Go to Product Page")      
    }]
});