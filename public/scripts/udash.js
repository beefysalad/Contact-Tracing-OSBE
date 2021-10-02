const modal = document.querySelector('#trigger-modal')
        let mymap = L.map('map')
        const lat = document.querySelectorAll('#latitude') 
        const long = document.querySelectorAll('#longitude')
        const geoaddress = document.querySelectorAll('#geoaddress')
        let geolocation
        let tableObject = document.querySelector('.table-data')
        let marker
        const api_key = document.querySelector('.api_key')
        const target = document.querySelectorAll('.target-index')
        const latitude = document.querySelectorAll('.latz')
        const longitude = document.querySelectorAll('.longz')
        
        for(let i=0; i<lat.length; i++){
            console.log(lat[i].innerText)
            console.log(long[i].innerText)
        }
        
        for(let i=0; i<target.length; i++){
            target[i].innerHTML = tableObject.children[1].children[i].rowIndex
        }
        for(let i=0; i<target.length; i++){
            console.log(target[i].innerText)
        }
        const geocodeService = L.esri.Geocoding.geocodeService({
            apikey: api_key.innerText
        });
        for(let i =0; i<geoaddress.length; i++){
            geocodeService.reverse().latlng([lat[i].innerText,long[i].innerText]).run(function (error, result) {
            if (error) {
                return;
            }
            
            geolocation = result.address.Match_addr
            geoaddress[i].innerText = geolocation
                
        });
        }
        function showModal(element){
            modal.click()
            let y = (element.parentNode.parentNode.rowIndex)-1
            let index = tableObject.children[1].children[y].children[3].children[0].innerText
            
            console.log(`latitude: ${lat[index-1].innerText}`)
            console.log(`longitude: ${long[index-1].innerText}`)
        
            mymap.setView([lat[index-1].innerText, long[index-1].innerText], 20);
            mymap.on('move',()=>{
                mymap.invalidateSize()
            })
            if(typeof(marker)==='undefined'){
                marker = L.marker([lat[index-1].innerText, long[index-1].innerText]).addTo(mymap)
            }else{
                marker.setLatLng([lat[index-1].innerText, long[index-1].innerText])
            }
            const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            const tiles = L.tileLayer(tileUrl,{attribution})
            tiles.addTo(mymap)
           
        }