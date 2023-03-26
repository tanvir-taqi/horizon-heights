

// load all the rooms details
const loadRooms = async () => {
    try {
        loader(true)
        const data = await fetch('https://horizon-heights-server.vercel.app/rooms')
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
            </div>`
            loader(false)
            roomCardContainer.appendChild(roomCard)
        });

        
    } catch (error) {
        loader(false)
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}



// load a single room data
const loadSingleRoom = async (id) => {
    try {
        loader(true)
        const data = await fetch(`https://horizon-heights-server.vercel.app/room/${id}`)
        const room = await data.json()
        const roomInCart = getStoredCart() // check if is in the cart

        const detailsContainer = document.getElementById('detailsContainer')
        detailsContainer.innerHTML = ''
        const row = document.createElement('div')
        row.classList.add('row')
        detailsContainer.classList.add('details-card')
        detailsContainer.classList.remove('d-none')

        //amenities list
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
        // beds list
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
            <p> ${id in roomInCart ? 'Already in Cart' : ''}</p>       
            <button class="btn btn-primary my-btn" disable="${id in roomInCart ? true : false}" onclick="addToCart('${room?._id}')" >Book Now</button>
            <button class="btn btn-danger " onclick="closeDetails()">Close Details</button>
        </div>
        `
        loader(false)
        detailsContainer.appendChild(row)
    }
    finally {
        loader(false)
    }
}

// cart number 
const cartNumber = () => {
    const cartObject = getStoredCart()
    let sum = 0;
    for (let e in cartObject) {
        sum += cartObject[e];
    }
    const cartNumberContainer = document.getElementById('cart-num')
    cartNumberContainer.innerText = sum

}
// add the room to the local storage as a cart
const addToCart = (id) => {
    let roomCart = {};

    //get the shopping cart from local storage
    const storedCart = localStorage.getItem('room-cart');
    if (storedCart) {
        roomCart = JSON.parse(storedCart);
    }

    // add quantity
    const quantity = roomCart[id];
    if (quantity) {
        const newQuantity = quantity + 1;
        roomCart[id] = newQuantity;
    }
    else {
        roomCart[id] = 1;
    }
    localStorage.setItem('room-cart', JSON.stringify(roomCart));
    closeDetails()
    successModal()
    cartNumber()
    cartLoadData()
}
// cart modal 

const cartBtn = document.getElementById('cart-btn')
const cartClose = document.getElementById('cart-close')

cartClose.addEventListener('click', () => {
    cartClosed()
})
cartBtn.addEventListener('click', () => {

    const cartSection = document.getElementById('cart-section')
    cartSection.classList.toggle('show-success')
    cartSection.classList.toggle('hide-success')


})

// load cart data
const cartLoadData = async () => {
    const cartData = getStoredCart()
    const cartContainer = document.getElementById('cart-container')
    cartContainer.innerHTML = ''
    if (Object.keys(cartData).length !== 0) {
        loader(true)
        let bookingData = []

        for (let element in cartData) {
            const data = await fetch(`https://horizon-heights-server.vercel.app/room/${element}`)
            const room = await data.json()

            const bookingElement = {
                room: room.name,
                count: cartData[element]
            }
            if (bookingData.indexOf(bookingElement) == -1) {
                bookingData.push(bookingElement)
            }

            const div = document.createElement('div')
            div.innerHTML = `<div class="container">
            <div class="row justify-content-between">
              <div class="col-auto">
                <h5 class="mb-0">${room.name}</h5>
              </div>
              <div class="col-auto">
                <span>Quantity: ${cartData[element]}</span>
              </div>
              <div class="col-auto">
                <span>Price: $${room.price}</span>
              </div>
            </div>
       
          </div>`
            cartContainer.appendChild(div)

        }
        const booking = JSON.stringify({ bookingData: bookingData })
        console.log('====================================');
        console.log(booking);
        console.log('====================================');
        const div2 = document.createElement('div')
        div2.innerHTML = ` <div class="container pt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
       
              <div class="form-group">
                <label for="name" style="color: white;">Name</label>
                <input type="text" class="form-control" id="name" placeholder="Enter your name" style="background-color: #4d4d4d; color: white;">
              </div>
              <div class="form-group">
                <label for="email" style="color: white;">Email address</label>
                <input type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="Enter email" style="background-color: #4d4d4d; color: white;">
              </div>
              <div class="form-group">
                <label for="phone" style="color: white;">Phone</label>
                <input type="tel" class="form-control" id="phone" placeholder="Enter phone number" style="background-color: #4d4d4d; color: white;">
              </div>
              <div class="form-group">
             <label for="start-date" style="color: white;">Start Date</label>
                 <input type="date" class="form-control" id="start-date" style="background-color: #4d4d4d; color: white;">
                    </div>
            <div class="form-group">
        <label for="end-date" style="color: white;">End Date</label>
        <input type="date" class="form-control" id="end-date" style="background-color: #4d4d4d; color: white;">
            </div>
              <button type="submit" class="btn my-btn text-white my-4" onclick='postbooking(${booking})'>Order Confirm</button>
              
              </div>
              </div>
              <button type="submit" class="btn btn-danger btn-sm text-white my-4" onclick='cartClear()'>Clear Cart </button>
      </div>`
        cartContainer.appendChild(div2)
        loader(false)
    } else {
        const div = document.createElement('div')
        div.innerHTML = `<div class="container">
            <div class="text-white">
              There is Nothing in the Cart
          </div>`
        cartContainer.appendChild(div)
    }

}

// cartClear 

const cartClear = () => {
    cartNumber()
    cartClosed()
    deleteCart()
}

//submit form 
const postbooking = (bookingData) => {
    loader(true)
    const name = document.getElementById('name')
    const email = document.getElementById('email')
    const phone = document.getElementById('phone')
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');


    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;
    const nameValue = name.value;
    const emailValue = email.value;
    const phoneValue = phone.value;

    


    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    const booking = {
        startDate,
        endDate,
        nameValue,
        emailValue,
        phoneValue,
        bookingData
    }

    fetch('https://horizon-heights-server.vercel.app/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(booking)
    })
        .then(response => response.json())
        .then(data => {
            console.log('====================================');
            console.log(data);
            console.log('====================================');
            if (data.acknowledged) {
                cartNumber()
                cartClosed()
                deleteCart()
                loader(false)
                location.reload();
            }
        })
        .catch(error =>{
            loader(false)
            console.error(error)
        } );
}

// get the local storage data
const getStoredCart = () => {
    let roomCart = {};

    //get the shopping cart from local storage
    const storedCart = localStorage.getItem('room-cart');
    if (storedCart) {
        roomCart = JSON.parse(storedCart);
    }
    return roomCart;
}
// success message
const successModal = () => {
    const successModalContainer = document.getElementById('successmodal')
    successModalContainer.classList.add('show-success')
    successModalContainer.classList.remove('hide-success')
    setTimeout(() => {
        successModalContainer.classList.remove('show-success')
        successModalContainer.classList.add('hide-success')
    }, 1500)
}
// closeDetails function
const closeDetails = () => {
    const detailsContainer = document.getElementById('detailsContainer')
    detailsContainer.classList.remove('details-card')
    detailsContainer.classList.add('d-none')
}
//clear cart
const deleteCart = () => {
    localStorage.removeItem('room-cart');
    location.reload();
}
const cartClosed = () => {
    const cartSection = document.getElementById('cart-section')
    cartSection.classList.remove('show-success')
    cartSection.classList.add('hide-success')
}

const loader = (isLoading) =>{
    const loaderContainer = document.getElementById('loader')
    if(isLoading){
        loaderContainer.classList.add('show-success')
        loaderContainer.classList.remove('hide-success')
    }else{
        loaderContainer.classList.remove('show-success')
        loaderContainer.classList.add('hide-success')
    }
}



cartLoadData()
cartNumber()
loadRooms()