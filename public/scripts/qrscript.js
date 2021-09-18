let scanner = new Instascan.Scanner({ video: document.getElementById('preview'), mirror:false});
if(document.referrer && sessionStorage.getItem('camUse')!==null){
    scanner.addListener('scan', function (content) {
        console.log(content);
        });
        let camUse = sessionStorage.getItem('camUse')
        sessionStorage.setItem('camUse',camUse)
        Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[camUse]);
            // alert(cameras.length)
        } else {
            console.error('No cameras found.');
        }
        }).catch(function (e) {
        console.error(e);
        });
        let audio = new Audio('/audio/nots.mp3')
        scanner.addListener('scan',function(c){
            audio.play()
            document.querySelector('#qrText').value = c
            setTimeout(()=>{
                // document.querySelector('#qrText').value = ""
                document.forms["uniqueid"].submit()
            },500)
        })
}else{
    console.info( "This page is not reloaded");
}
Instascan.Camera.getCameras()
.then(function(cameras){
    for(let i=0; i<cameras.length; i++){
        const camBut = document.createElement('button')
        camBut.classList.add('btn','btn-warning','mx-2','mt-2','tea')
        camBut.innerText = `Camera ${i+1}`
        // console.log(`Greetings from button: ${i+1}`) 
        // let camUse
                
        camBut.addEventListener('click',()=>{
            scanner.addListener('scan', function (content) {
                console.log(content);
                });
                let camUse = i
                sessionStorage.setItem('camUse',camUse)
                Instascan.Camera.getCameras().then(function (cameras) {
                if (cameras.length > 0) {
                    scanner.start(cameras[camUse]);
                    // alert(cameras.length)
                } else {
                    console.error('No cameras found.');
                }
                }).catch(function (e) {
                console.error(e);
                });
                let audio = new Audio('/audio/nots.mp3')
                scanner.addListener('scan',function(c){
                    audio.play()
                    document.querySelector('#qrText').value = c
                    setTimeout(()=>{
                        document.forms["uniqueid"].submit()
                        // document.querySelector('#qrText').value = ""
                    },500)
                })
            //end
        })
        document.querySelector('.tik').append(camBut)
    }
    
})