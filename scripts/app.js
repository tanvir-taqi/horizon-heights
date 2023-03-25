

// load all the rooms details
const loadRooms = async () => {
    try {
        const data = await fetch('http://localhost:5000/rooms')
        const rooms = await data.json()

        const roomCardContainer = document.getElementById('room-card-container')
        rooms.forEach(room => {
            const roomCard = document.createElement('div')
            roomCard.classList.add('col')
            roomCard.innerHTML = `
                <div class="card room-card" onclick="loadSingleRoom('${room?._id}')">
              <img src=${room?.image} class="card-img-top" alt="Room Image">
              <div class="card-body">
                <h5 class="card-title">${room?.name}</h5>
                <p class="card-text">${room?.description?.slice(0, 80)}...</p>
           
                <p class="card-text">Starting at $${room?.price} per night</p>
              </div>
            </div>
                `
            roomCardContainer.appendChild(roomCard)
        });


    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}



// load a single room data
const loadSingleRoom = async (id) => {
    try {
        const data = await fetch(`http://localhost:5000/room/${id}`)
        const room = await data.json()

        const detailsContainer = document.getElementById('detailsContainer')
        detailsContainer.innerHTML = ''
        const row = document.createElement('div')
        row.classList.add('row')
        detailsContainer.classList.add('details-card')
        detailsContainer.classList.remove('d-none')

        const amenitiesList = document.createElement('ul')
        amenitiesList.classList.add('list-group')
        for (let i = 0; i < room.amenities.length; i++) {
            const amenityItem = document.createElement('li')
            amenityItem.classList.add('list-group-item')
            amenityItem.classList.add('list-group-item-action')
            amenityItem.classList.add('bg-dark')
            amenityItem.classList.add('text-light')
            amenityItem.textContent = room.amenities[i]
            amenitiesList.appendChild(amenityItem)
        }
        const bedList = document.createElement('ul')
        bedList.classList.add('list-group')
        for (let i = 0; i < room.beds.length; i++) {
            const bedItem = document.createElement('li')
            bedItem.innerHTML = `<p class="list-group-item text-white bg-dark list-group-item-action">${room.beds[i].count} Bed ${room.beds[i].size} Size</p>`
            bedList.appendChild(bedItem)
        }

        row.innerHTML = `
        <div class="col-md-6">
            <img src=${room?.image} class="img-fluid" alt="Room Image">
        </div>
        <div class="col-md-6  text-white">
            <h2 class="mb-3">${room?.name}</h2>
            ${bedList.outerHTML}
            <p class="mb-3">${room?.description}</p>
            ${amenitiesList.outerHTML}
            <p class="my-3">Starting at $${room?.price} per night</p>
            <button class="btn btn-primary my-btn" onclick="addToCart('${room?._id}')" >Book Now</button>
            <button class="btn btn-danger " onclick="closeDetails()">Close Details</button>
        </div>
        `
        detailsContainer.appendChild(row)
    }
    finally {

    }
}

// add the room to the local storage as a cart
const addToCart = (id) => {
    
    

}


// closeDetails function
const closeDetails = ()=>{
    const detailsContainer = document.getElementById('detailsContainer')
    detailsContainer.classList.remove('details-card')
    detailsContainer.classList.add('d-none')
}


loadRooms()