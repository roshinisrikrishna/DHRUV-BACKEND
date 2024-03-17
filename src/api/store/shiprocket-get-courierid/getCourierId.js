// Import the axios library for making HTTP requests.
import axios from 'axios';

// Defines an asynchronous function to log in to Shiprocket and retrieve an authentication token.
const loginAndGetToken = async () => {
    // Prepare login credentials as a JSON string.
    const loginData = JSON.stringify({
        "email": "roshinitharanair@gmail.com",
        "password": "Vishal8398"
    });

    try {
        // Send a POST request to Shiprocket's login endpoint with the login credentials.
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', loginData, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Return the authentication token from the response data.
        return response.data.token;
    } catch (error) {
        // Log any errors that occur during the login process.
        console.error('Login error:', error);
        throw error; // Rethrow the error for further handling.
    }
};

// Define an asynchronous function to find a courier's ID by their name.
export const getCourierId = async (req, res) => {
    try {
        // Obtain the authentication token by calling the loginAndGetToken function.
        const token = await loginAndGetToken();
        // Extract the courier's name from the query parameters of the request.
        const courier_name = req.query.courierName;

        // Send a GET request to Shiprocket's endpoint for fetching a list of couriers, authorized with the token.
        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/courierListWithCounts', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Attempt to find a courier in the response data whose name matches the requested courier name.
        const matchingCourier = response.data.courier_data.find(courier => courier.name === courier_name);

        // If a matching courier is found, respond with their ID.
        if (matchingCourier) {
            res.json({ id: matchingCourier.id });
        } else {
            // If no matching courier is found, log a message and respond with a 404 status.
            console.log('No matching courier found.');
            res.status(404).json({ message: 'No matching courier found.' });
        }
    } catch (error) {
        // Log any errors that occur during the process of fetching couriers.
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};
