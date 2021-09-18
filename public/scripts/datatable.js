$(document).ready(function() {
    $('#example').DataTable( {
        "scrollX": true
    } );
} );
    function ExportToExcel(type, fn, dl) {
    let elt = document.getElementById('example');
    let wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
   return dl ?
     XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
     XLSX.writeFile(wb, fn || ('Covid Tracer.' + (type || 'xlsx')));
}