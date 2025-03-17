// load all the rooms details
const loadRooms = async () => {
  try {
    loader(true);
    const data = await fetch("../Data/data.json");
    const rooms = await data.json();

    const roomCardContainer = document.getElementById("room-card-container");
    rooms.forEach((room) => {
      const roomCard = document.createElement("div");
      roomCard.classList.add("col");
      roomCard.innerHTML = `
                <div class="card room-card" onclick="loadSingleRoom('${
                  room?._id
                }')">
              <img src=${room?.image} class="card-img-top" alt="Room Image">
              <div class="card-body">
                <h5 class="card-title">${room?.name}</h5>
                <p class="card-text">${room?.description?.slice(0, 80)}...</p>
           
                <p class="card-text">Starting at $${room?.price} per night</p>
              </div>
            </div>`;
            roomCardContainer.appendChild(roomCard);
            loader(false);
    });
  } catch (error) {
    loader(false);
    console.log("====================================");
    console.log(error);
    console.log("====================================");
  }
};

// load a single room data
const loadSingleRoom = async (id) => {
  console.log(id); // Debugging: Check if the function is getting the correct ID

  try {
    loader(true);

    // Fetch the full JSON data
    const data = await fetch("../Data/data.json");
    const rooms = await data.json();

    // Find the specific room by ID
    const room = rooms.find((r) => r._id === parseInt(id));

    if (!room) {
      console.error("Room not found");
      loader(false);
      return;
    }

    console.log(room); // Debugging: Check if the room is found correctly

    const roomInCart = getStoredCart(); // Check if it's in the cart

    const detailsContainer = document.getElementById("detailsContainer");
    detailsContainer.innerHTML = "";
    const row = document.createElement("div");
    row.classList.add("row");
    detailsContainer.classList.add("details-card");
    detailsContainer.classList.remove("d-none");

    // Amenities list
    const amenitiesList = document.createElement("ul");
    amenitiesList.classList.add("list-group");
    room.amenities.forEach((amenity) => {
      const amenityItem = document.createElement("li");
      amenityItem.classList.add(
        "list-group-item",
        "list-group-item-action",
        "bg-dark",
        "text-light"
      );
      amenityItem.textContent = amenity;
      amenitiesList.appendChild(amenityItem);
    });

    // Beds list
    const bedList = document.createElement("ul");
    bedList.classList.add("list-group");
    room.beds.forEach((bed) => {
      const bedItem = document.createElement("li");
      bedItem.innerHTML = `<p class="list-group-item text-white bg-dark list-group-item-action">${bed.count} Bed ${bed.size} Size</p>`;
      bedList.appendChild(bedItem);
    });

    row.innerHTML = `
        <div class="col-md-6">
            <img src="${room.image}" class="img-fluid" alt="Room Image">
        </div>
        <div class="col-md-6 text-white">
            <h2 class="mb-3">${room.name}</h2>
            ${bedList.outerHTML}
            <p class="mb-3">${room.description}</p>
            ${amenitiesList.outerHTML}
            <p class="my-3">Starting at $${room.price} per night</p>
            <p> ${id in roomInCart ? "Already in Cart" : ""}</p>       
            <button class="btn btn-primary my-btn" ${
              id in roomInCart ? "disabled" : ""
            } onclick="addToCart('${room._id}')">Book Now</button>
            <button class="btn btn-danger" onclick="closeDetails()">Close Details</button>
        </div>`;

    detailsContainer.appendChild(row);
  } catch (error) {
    console.error(error);
  } finally {
    loader(false);
  }
};

// cart number
const cartNumber = () => {
  const cartObject = getStoredCart();
  let sum = 0;
  for (let e in cartObject) {
    sum += cartObject[e];
  }
  const cartNumberContainer = document.getElementById("cart-num");
  cartNumberContainer.innerText = sum;
};

// add the room to the local storage as a cart
const addToCart = (id) => {
  let roomCart = {};

  //get the cart from local storage
  const storedCart = localStorage.getItem("room-cart");
  if (storedCart) {
    roomCart = JSON.parse(storedCart);
  }

  // add quantity
  const quantity = roomCart[id];
  if (quantity) {
    const newQuantity = quantity + 1;
    roomCart[id] = newQuantity;
  } else {
    roomCart[id] = 1;
  }
  localStorage.setItem("room-cart", JSON.stringify(roomCart));
  closeDetails();
  successModal("Added to the cart");
  cartNumber();
  cartLoadData();
  loader(false);
};

// cart modal

const cartBtn = document.getElementById("cart-btn");
const cartClose = document.getElementById("cart-close");

cartClose.addEventListener("click", () => {
  cartClosed();
});
cartBtn.addEventListener("click", () => {
  const cartSection = document.getElementById("cart-section");
  cartSection.classList.toggle("show-success");
  cartSection.classList.toggle("hide-success");
});

// load cart data
const cartLoadData = async () => {
  const cartData = getStoredCart();
  console.log("Stored Cart Data:", cartData);

  const cartContainer = document.getElementById("cart-container");
  cartContainer.innerHTML = "";

  if (Object.keys(cartData).length === 0) {
    cartContainer.innerHTML = `<div class="container text-white p-5">There is Nothing in the Cart</div>`;
    return;
  }

  loader(true);

  const response = await fetch("../Data/data.json");
  const allRooms = await response.json();

  let bookingData = [];

  const cartContent = document.createElement("div");
  cartContent.className = "row"; // Bootstrap row for layout

  // Left Column: Room Details
  const roomDetailsDiv = document.createElement("div");
  roomDetailsDiv.className = "col-md-6"; // Bootstrap column

  for (let id in cartData) {
    const room = allRooms.find((r) => r._id == id);
    if (!room) continue;

    bookingData.push({ room: room.name, count: cartData[id] });

    const div = document.createElement("div");
    div.className = "card mb-3 bg-dark text-white";
    div.innerHTML = `
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${
                      room.image
                    }" class="img-fluid rounded-start" alt="${room.name}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${room.name}</h5>
                        <p class="card-text">Quantity: ${cartData[id]}</p>
                        <p class="card-text">Price: $${
                          room.price * cartData[id]
                        }</p>
                    </div>
                </div>
            </div>`;
    roomDetailsDiv.appendChild(div);
  }

  // Right Column: Booking Form
  const formDiv = document.createElement("div");
  formDiv.className = "col-md-6"; // Bootstrap column
  formDiv.innerHTML = `
        <div class="card bg-dark text-white p-4">
            <h4 class="text-center mb-3">Confirm Your Booking</h4>
            <div class="form-group mb-2">
                <label for="name">Name</label>
                <input type="text" class="form-control bg-secondary text-white" id="name" placeholder="Enter your name">
            </div>
            <div class="form-group mb-2">
                <label for="email">Email</label>
                <input type="email" class="form-control bg-secondary text-white" id="email" placeholder="Enter email">
            </div>
            <div class="form-group mb-2">
                <label for="phone">Phone</label>
                <input type="tel" class="form-control bg-secondary text-white" id="phone" placeholder="Enter phone number">
            </div>
            <div class="form-group mb-2">
                <label for="start-date">Start Date</label>
                <input type="date" class="form-control bg-secondary text-white" id="start-date">
            </div>
            <div class="form-group mb-2">
                <label for="end-date">End Date</label>
                <input type="date" class="form-control bg-secondary text-white" id="end-date">
            </div>
            <button type="submit" class="btn btn-success w-100 mt-3" onclick="postbooking()">Order Confirm</button>
            <button type="button" class="btn btn-danger w-100 mt-2" onclick="cartClear()">Clear Cart</button>
        </div>`;

  // Append both columns to the row container
  cartContent.appendChild(roomDetailsDiv);
  cartContent.appendChild(formDiv);

  // Append the structured layout to the main cart container
  cartContainer.appendChild(cartContent);

  loader(false);
};

// cartClear

const cartClear = () => {
  cartNumber();
  cartClosed();
  deleteCart();
};

//submit form
const postbooking = () => {


  cartNumber();
  cartClosed();
  deleteCart();

  successModal("Booking Confirmed");
  location.reload();
};

// get the local storage data
const getStoredCart = () => {
  let roomCart = {};

  //get the shopping cart from local storage
  const storedCart = localStorage.getItem("room-cart");
  if (storedCart) {
    roomCart = JSON.parse(storedCart);
  }
  return roomCart;
};
// success message
const successModal = (message) => {
  const successModalContainer = document.getElementById("successmodal");
  const successMessage = document.createElement("div")
  successMessage.innerHTML= `<div class="successmodal">
        <p>${message}</p>
      </div>`;
      successModalContainer.appendChild(successMessage)
  successModalContainer.classList.add("show-success");
  successModalContainer.classList.remove("hide-success");
  setTimeout(() => {
    successModalContainer.classList.remove("show-success");
    successModalContainer.classList.add("hide-success");
  }, 1500);
};
// closeDetails function
const closeDetails = () => {
  const detailsContainer = document.getElementById("detailsContainer");
  detailsContainer.classList.remove("details-card");
  detailsContainer.classList.add("d-none");
};
//clear cart
const deleteCart = () => {
  localStorage.removeItem("room-cart");
  location.reload();
};
const cartClosed = () => {
  const cartSection = document.getElementById("cart-section");
  cartSection.classList.remove("show-success");
  cartSection.classList.add("hide-success");
};

const loader = (isLoading) => {
  const loaderContainer = document.getElementById("loader");
  if (isLoading) {
    loaderContainer.classList.add("show-success");
    loaderContainer.classList.remove("hide-success");
  } else {
    loaderContainer.classList.remove("show-success");
    loaderContainer.classList.add("hide-success");
  }
};

cartLoadData();
cartNumber();
loadRooms();
