// Import the axios library for making HTTP requests
import axios from 'axios';

// Define an asynchronous function to login and retrieve an authentication token
const loginAndGetToken = async () => {
    // Prepare login credentials as a JSON string
    const loginData = JSON.stringify({
        "email": "roshinitharanair@gmail.com",
        "password": "Vishal8398"
    });

    try {
        // Attempt to post the login data to the Shiprocket authentication endpoint
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', loginData, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Return the authentication token from the response
        return response.data.token;
    } catch (error) {
        // Log any login errors to the console and rethrow the error
        console.error('Login error:', error);
        throw error;
    }
};

// Define an asynchronous function to cancel a shipment using its AWB (Air Waybill) ID
const cancelShipmentWithAWB = async (awbId) => {
    try {
        // Obtain the authentication token by calling the login function
        const token = await loginAndGetToken();

        // Prepare the data for canceling the shipment, including the AWB ID
        const cancelData = JSON.stringify({
            "awbs": [awbId]
        });

        // Attempt to post the cancellation request to Shiprocket's cancellation endpoint
        const cancelResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs', cancelData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Log the response from the cancellation request to the console
        console.log('Cancel shipment response:', cancelResponse.data);
        return cancelResponse.data;
    } catch (error) {
        // Log any errors encountered during the cancellation to the console and rethrow the error
        console.error('Error cancelling shipment:', error);
        throw error;
    }
};

// Define an asynchronous function to handle a request to cancel a shipment
export const cancelShip = async (req, res) => {
    try {
        // Obtain the authentication token by calling the login function
        const token = await loginAndGetToken();
        // Extract the order ID from the request body
        const orderIdToMatch = req.body.orderId;

        // Make a GET request to Shiprocket to fetch all orders
        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/orders', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Find an order matching the provided order ID
        const matchingOrder = response.data.data.find(order => order.channel_order_id === orderIdToMatch);

        // Check if a matching order was found and if its status is not already 'CANCELED'
        if (matchingOrder && matchingOrder.status.toUpperCase() !== 'CANCELED') {
            // If a matching order is found and not canceled, return its details
            res.json({ matchingOrder: matchingOrder });

            // Extract the AWB ID from the matching order
            const awbId = matchingOrder.shipments[0].awb;
            console.log('awbId', awbId)
            // Attempt to cancel the shipment using the extracted AWB ID
            cancelShipmentWithAWB(awbId).then(response => {
                // Log the response from the cancellation attempt and return it
                console.log(response)
                res.json({response: response})
            }).catch(error => console.error(error));

        } else if (matchingOrder && matchingOrder.status.toUpperCase() === 'CANCELED') {
            // If a matching order is found but is already canceled, inform the client
            res.status(404).json({ message: 'Matching order is canceled.' });
        } else {
            // If no matching order is found, inform the client
            console.log('No matching order found.');
            res.status(404).json({ message: 'No matching order found.' });
        }
    } catch (error) {
        // If any errors occur while fetching orders or during any other process, inform the client
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};
