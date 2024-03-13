// Import axios for making HTTP requests.
import axios from 'axios';

// Defines an asynchronous function to login to the Shiprocket API and retrieve an authentication token.
const loginAndGetToken = async () => {
    // Stringifies the login credentials.
    const loginData = JSON.stringify({
        "email": "roshinitharanair@gmail.com",
        "password": "Vishal8398"
    });

    try {
        // Attempts to post the login credentials to Shiprocket's login endpoint.
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', loginData, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Returns the authentication token from the response.
        return response.data.token;
    } catch (error) {
        // Logs any login errors to the console and rethrows the error for further handling.
        console.error('Login error:', error);
        throw error;
    }
};

// Defines an asynchronous function to fetch an order based on a given `orderId` query parameter.
export const getOrder = async (req, res) => {
    try {
        // Retrieves the authentication token by calling the `loginAndGetToken` function.
        const token = await loginAndGetToken();
        // Extracts the `orderId` from the request's query parameters.
        const orderIdToMatch = req.query.orderId;

        // Sends a GET request to Shiprocket's orders endpoint, authorized with the retrieved token.
        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/orders', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Filters the orders to find one that matches the provided `orderId`.
        const matchingOrder = response.data.data.find(order => order.channel_order_id === orderIdToMatch);

        // If a matching order is found and it's not canceled, responds with the matching order details.
        if (matchingOrder && matchingOrder.status.toUpperCase() !== 'CANCELED') {
            res.json({ matchingOrder: matchingOrder });
        } else if (matchingOrder && matchingOrder.status.toUpperCase() === 'CANCELED') {
            // If the matching order is found but is canceled, responds with a 404 status and message.
            res.status(404).json({ message: 'Matching order is canceled.' });
        } else {
            // If no matching order is found, logs a message and responds with a 404 status and message.
            console.log('No matching order found.');
            res.status(404).json({ message: 'No matching order found.' });
        }
    } catch (error) {
        // Logs any errors encountered during the order fetching process and responds with a 500 status and error message.
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};
