const camera_num = document.querySelector('.cam_num')
    let scanner = new Instascan.Scanner({ video: document.getElementById('preview'), mirror:false});
    Instascan.Camera.getCameras()
        .then(function(cameras){
            scanner.start(cameras[(camera_num.innerText)-1])
            let audio = new Audio('/audio/nots.mp3')
            scanner.addListener('scan',function(c){
                audio.play()
                document.querySelector('#qrText').value = c
                setTimeout(()=>{
                    document.forms["uniqueid"].submit()
                },500)
            })
        })