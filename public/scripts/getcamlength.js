const cameras_but = document.querySelector('.cameras_but')
Instascan.Camera.getCameras()
    .then(function(cameras){
        for(let i=0; i<cameras.length; i++){
           let newA = document.createElement('a')
           newA.classList.add('nav-link')
           newA.href = `/establishments-scanqr/${i+1}`
           newA.innerText = `Camera ${i+1}`
           cameras_but.append(newA)
        }
    })