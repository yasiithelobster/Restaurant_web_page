document.addEventListener('DOMContentLoaded', function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- Cart Page Functions ---
    function displayCartItems() { // Display cart items in the cart table
        const cartTable = document.querySelector('.cart-table'); // Cart table element
        const cartContainer = document.querySelector('.cart-container'); // Cart container element
        const subtotalElement = cartContainer ? cartContainer.querySelector('h2:nth-child(2)') : null; // Subtotal element

        if (!cartTable) return; // Check if cartTable is defined

        // Clear previous items except header 
        while (cartTable.rows.length > 1) { 
            cartTable.deleteRow(1); // Delete all rows except the header
        }
 
        let total = 0; // Initialize total to 0
 
        if (cart.length === 0) { // If cart is empty
            const row = cartTable.insertRow(); // Create a new row
            const cell = row.insertCell(); // Create a new cell
            cell.colSpan = 5; // Span all columns
            cell.textContent = "Your cart is empty."; 
        } else {
            cart.forEach((item, index) => { // For each item in the cart
                const row = cartTable.insertRow(); // Create a new row

                // Image Cell
                const imageCell = row.insertCell();
                const img = document.createElement('img'); // Create an image element
                img.src = item.image; // Set the image source
                img.alt = item.name; // Set alt text for accessibility
                img.style.width = '80px'; // Set width for the image
                imageCell.appendChild(img); // Append image to the cell

                // Name Cell
                const nameCell = row.insertCell();
                nameCell.textContent = item.name;

                // Quantity Cell (+ / -)
                const quantityCell = row.insertCell(); 
                const quantityControls = document.createElement('div');// Create a div for quantity controls
                quantityControls.style.display = 'flex'; // Set display to flex
                quantityControls.style.alignItems = 'center'; // Align items to center
                quantityControls.style.gap = '5px'; // Add gap between buttons and span

                const minusBtn = document.createElement('button'); // Create a button for decreasing quantity
                minusBtn.textContent = '−'; // Set button text
                minusBtn.classList.add('qty-btn'); // Add class for styling
                minusBtn.onclick = () => updateQuantity(index, -1); // Decrease quantity

                const qtySpan = document.createElement('span'); // Create a span for displaying quantity
                qtySpan.textContent = item.quantity; // Set initial quantity

                const plusBtn = document.createElement('button'); // Create a button for increasing quantity
                plusBtn.textContent = '+'; // Set button text
                plusBtn.classList.add('qty-btn'); // Add class for styling
                plusBtn.onclick = () => updateQuantity(index, 1); // Increase quantity

                quantityControls.appendChild(minusBtn); // Append minus button
                quantityControls.appendChild(qtySpan); // Append quantity span
                quantityControls.appendChild(plusBtn); // Append plus button
                quantityCell.appendChild(quantityControls); // Append controls to the cell

                // Price Cell
                const priceCell = row.insertCell(); 
                priceCell.textContent = `Rs.${(item.price * item.quantity).toFixed(2)}`;  // Set price text

                // Delete Cell (🗑️ icon)
                const deleteCell = row.insertCell();  // Create a new cell for delete button
                const deleteBtn = document.createElement('button'); // Create a button for deleting item
                deleteBtn.innerHTML = '🗑️'; // Set button text to trash icon
                deleteBtn.style.border = 'none'; // Remove border
                deleteBtn.style.background = 'none'; // Remove background
                deleteBtn.style.fontSize = '18px'; // Set size
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.title = 'Remove item';
                deleteBtn.onclick = () => removeItem(index);

                deleteCell.appendChild(deleteBtn); // Append delete button to the cell

                // Update total
                total += item.price * item.quantity; 
            });
        }

        if (subtotalElement) { // Check if subtotalElement is defined
            subtotalElement.textContent = `Rs.${total.toFixed(2)}`;  // Set subtotal text
        }

        localStorage.setItem('cart', JSON.stringify(cart)); // Save the cart to local storage
    }

    function updateQuantity(index, change) { // Update the quantity of an item in the cart
        cart[index].quantity += change; // Update quantity
        if (cart[index].quantity < 1) { // If quantity is less than 1, remove the item
            cart.splice(index, 1); 
        }
        displayCartItems(); // Refresh cart display
    }

    function removeItem(index) { // Remove an item from the cart
        cart.splice(index, 1); // Remove item from cart
        displayCartItems();  // Refresh cart display
    }

    // --- Menu Page Functions ---
    const filterSelectMenu = document.getElementById('menu-filter'); // Filter select element
    const menuItemsContainer = document.getElementById('menu-items-container'); // Container for menu items
    let menuData; // To store the fetched menu data

    async function loadMenu() { //Load menu data from XML
        try {
            const response = await fetch('xml_files/menu_data.xml'); // Adjust the path as needed
            const xmlString = await response.text(); // Read the XML file as text
            const parser = new DOMParser(); // Create a new DOMParser instance
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml'); // Parse the XML string into a DOM object
            menuData = Array.from(xmlDoc.querySelectorAll('item')).map(item => ({ // Convert NodeList to Array
                name: item.querySelector('name').textContent, // Get the name
                image: item.querySelector('image').textContent, // Get the image URL
                category: item.querySelector('category').textContent, // Get the category
                price: parseFloat(item.querySelector('price').textContent), // Get the price and convert to float
                description: item.querySelector('description').textContent // Get the description
            }));
            displayMenuItems(menuData); // Display all items initially
        } catch (error) { // Handle errors
            console.error('Error loading menu:', error); 
            if (menuItemsContainer) {
                menuItemsContainer.innerHTML = '<p>Failed to load menu.</p>'; // Display error message
            }
        }
    }
 
    function displayMenuItems(items) { // Display menu items in the container
        if (!menuItemsContainer) return;  // Check if menuItemsContainer is defined
        menuItemsContainer.innerHTML = ''; // Clear previous items
        items.forEach(item => { // For each item in the menu
            const menuItem = document.createElement('div'); // Create a new div for the menu item
            menuItem.classList.add('menu-item'); // Add class for styling
            menuItem.dataset.category = item.category; // Add data attributes for filtering

            const img = document.createElement('img'); // Create an image element
            img.src = item.image; // Set the image source
            img.alt = item.name; // Set alt text for accessibility
            img.width = 200; // Set width for the image
            img.height = 200; // Set height for the image

            const itemDetails = document.createElement('div'); // Create a div for item details
            itemDetails.classList.add('item-details'); // Add class for styling
            itemDetails.dataset.category = item.category; // Add data attributes for filtering
            itemDetails.dataset.name = item.name; // Add data attributes
            itemDetails.dataset.price = item.price; // Add data attributes
            itemDetails.dataset.image = item.image; 

            const namePara = document.createElement('p'); // Create a paragraph for the name
            namePara.textContent = item.name;

            const pricePara = document.createElement('p'); // Create a paragraph for the price
            pricePara.textContent = `Rs.${item.price}`;

            itemDetails.appendChild(namePara); // Append name paragraph to item details
            itemDetails.appendChild(pricePara); // Append price paragraph to item details

            const descriptionPara = document.createElement('p'); // Create a paragraph for the description
            descriptionPara.classList.add('description'); // Add class for styling
            descriptionPara.textContent = item.description; // Set the description text

            const addToCartButton = document.createElement('button'); // Create a button for adding to cart
            addToCartButton.classList.add('add-to-cart-btn'); // Add class for styling
            addToCartButton.dataset.name = item.name; // Add data attributes for the button
            addToCartButton.dataset.price = item.price; // Add data attributes
            addToCartButton.dataset.image = item.image;
            addToCartButton.textContent = 'Add to cart'; // Set button text

            addToCartButton.addEventListener('click', handleAddToCart); // Add event listener for the button

            menuItem.appendChild(img); // Append image to the menu item
            menuItem.appendChild(itemDetails); // Append item details to the menu item
            menuItem.appendChild(descriptionPara); // Append description to the menu item
            menuItem.appendChild(addToCartButton); // Add the button to the item

            menuItemsContainer.appendChild(menuItem); // Append the menu item to the container
        });
    }

    function filterMenu() { // Filter menu items based on selected category
        if (!filterSelectMenu || !menuData) return; // Check if filterSelectMenu and menuData are defined
        const selectedCategory = filterSelectMenu.value; // Get the selected category
        const filteredItems = selectedCategory === 'all'  // If 'all' is selected, show all items
            ? menuData 
            : menuData.filter(item => item.category === selectedCategory); // Filter items based on selected category
        displayMenuItems(filteredItems); // Display the filtered items
    } 

    // --- Add to Cart Functionality ---
    function handleAddToCart(event) { 
        const button = event.target; // Get the button that was clicked
        const name = button.dataset.name; // Get the name from data attributes
        const price = parseFloat(button.dataset.price);// Get the price from data attributes
        const image = button.dataset.image; // Get the image URL from data attributes

        const itemToAdd = { name, price, image, quantity: 1 }; // Create the item object to add to the cart

        const existingItemIndex = cart.findIndex(cartItem => cartItem.name === itemToAdd.name); // Check if the item already exists in the cart
        if (existingItemIndex > -1) {// If the item exists, increase its quantity
            cart[existingItemIndex].quantity++; 
        } else {
            cart.push(itemToAdd); // If the item doesn't exist, add it to the cart
        }
        localStorage.setItem('cart', JSON.stringify(cart)); // Save the cart to local storage
        alert(`Rasa Mandir says: ${name} added to your cart!`); // Show alert message
    }

    // --- Checkout Page Functions ---
    const orderSummaryTable = document.getElementById('order-summary-table'); // Order summary table element
    const orderTotalElement = document.getElementById('order-total'); // Order total element
    const billingForm = document.getElementById('billing-form'); // Billing form element

    function updateOrderSummary() { // Update the order summary table with cart items
        if (!orderSummaryTable || !orderTotalElement) return; // Check if elements are defined
        // Clear previous items
        orderSummaryTable.innerHTML = `
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
        `;
        let total = 0; 
        cart.forEach(item => { // For each item in the cart
            const row = document.createElement('tr'); // Create a new row
            row.innerHTML = ` 
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>Rs.${(item.price * item.quantity).toFixed(2)}</td>
            `;
            orderSummaryTable.appendChild(row); // Append the row to the table
            total += item.price * item.quantity; // Update total
        });

        orderTotalElement.textContent = `Total: Rs.${total.toFixed(2)}`; // Set the total text
    }

    function handleCheckoutSubmit(event) { // Handle form submission
        event.preventDefault();  // Prevent default form submission

        // Basic form validation (you might want more robust validation)
        const name = document.getElementById('name').value; 
        const email = document.getElementById('email').value; 
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        if (!name || !email || !phone || !address) { // Check if all fields are filled
            alert('Please fill in all required billing information.'); // Show alert message
            return;
        }

        // Display the thank you message
        alert('Thank you for your order! Your payment details will be processed.');

        // Clear cart after order is submitted
        localStorage.removeItem('cart');

        // Redirect to the home page after the thank you message (with a small delay)
        setTimeout(function() {
            window.location.href = 'restaurant_home.html'; // Redirect to your home page
        }, 500); // 0.5 seconds delay
    }

    // --- Initializations and Event Listeners ---
    if (window.location.pathname.includes('restaurant_cart.html')) {
        displayCartItems();
    }

    if (window.location.pathname.includes('restaurant_menu.html')) {
        if (filterSelectMenu) {
            filterSelectMenu.addEventListener('change', filterMenu);
        }
        loadMenu();
    }

    // Add to Cart' buttons on the home page
    const addToCartButtonsHomepage = document.querySelectorAll('.add-to-cart-btn'); 
    addToCartButtonsHomepage.forEach(button => { 
        button.addEventListener('click', handleAddToCart);
    });

    if (window.location.pathname.includes('checkout.html')) {
        updateOrderSummary();
        if (billingForm) {
            billingForm.addEventListener('submit', handleCheckoutSubmit);
        }
    }
});