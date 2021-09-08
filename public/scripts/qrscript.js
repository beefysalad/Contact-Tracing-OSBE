let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
Instascan.Camera.getCameras()
.then(function(cameras){
    // for(let i=0; i<cameras.length; i++){
        // const camBut = document.createElement('button')
        // camBut.classList.add('btn','btn-warning','mx-2','mt-2','tea')
        // camBut.innerText = `Camera ${i+1}`
        // console.log(`Greetings from button: ${i+1}`)
            
        scanner.addListener('scan', function (content) {
        console.log(content);
        });
        let camUse = 0
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
            },1000)
            
            // setTimeout(()=>{
                
            //     // document.querySelector('#qrText').value = ""
            // },500)
        })
        // camBut.addEventListener('click',()=>{
        //    camUse = 0
        //    scanner.start(cameras[camUse])

        // })
        // document.querySelector('.tik').append(camBut)
    // }
    
})
