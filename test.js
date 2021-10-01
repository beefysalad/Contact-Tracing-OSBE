function showPosition(position){
    console.log(`${position.coords.latitude} ${position.coords.longitude}`)
}
function getPosition(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition)
    }
}
getPosition()