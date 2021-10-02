window.addEventListener("DOMContentLoaded",(e)=>{
    if(screen.width<478){
     $(document).ready(function() {
         $('#example').DataTable({
             "scrollX":true
         });
     } );
    }
    else{
     $(document).ready(function() {
         $('#example').DataTable();
     } );
    }
})
 window.onresize = resize
 
 if(screen.width)
 function resize(){
     if(screen.width<389){
         $(document).ready(function() {
             $('#example').DataTable({
                 destroy: true,
                 "scrollX": true
             });
         } );
     }
     else{
         $(document).ready(function() {
             $('#example').DataTable({
                 destroy: true,
                 "scrollX": false
             });
         } );
     }
 }