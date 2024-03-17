// Imports the axios library for making HTTP requests.
import axios from 'axios';

// Asynchronously logs in to the Shiprocket API and retrieves an authentication token.
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

        // Returns the authentication token from the response data.
        return response.data.token;
    } catch (error) {
        // Logs any errors encountered during login.
        console.error('Login error:', error);
        throw error; // Rethrows the error for handling by the caller.
    }
};

// Asynchronously checks the serviceability of courier services for given parameters.
export const getServiceability = async (req, res) => {
    try {
        // Retrieves the authentication token by logging in.
        const token = await loginAndGetToken();
        // Destructures the required query parameters from the incoming request.
        const { pickup_postcode, delivery_postcode, cod, weight, declared_value } = req.query;
        // Constructs the URL for the serviceability check with the provided parameters.
        const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&cod=${cod}&weight=${weight}&declared_value=${declared_value}`;

        // Sends a GET request to the constructed URL with the authentication token.
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Processes the response to sort the available courier companies by rate in ascending order,
        // then selects the top 5 (or top 20, as per the `.slice(0, 20)` comment mismatch) with the lowest freight charge.
        const sortedCouriers = response.data.data.available_courier_companies
            .sort((a, b) => a.rate - b.rate)
            .slice(0, 20) // Takes the first 20 elements, not 5 as initially suggested.
            .map(courier => ({
                // Maps each courier company to a simplified object containing only the required fields.
                courier_company_id: courier.courier_company_id,
                courier_name: courier.courier_name,
                freight_charge: courier.freight_charge,
                id: courier.id,
                is_rto_address_available: courier.is_rto_address_available,
                others: courier.others,
                rto_performance: courier.rto_performance
             }));

        // Responds with the sorted and simplified list of courier companies.
        res.json(sortedCouriers);
    } catch (error) {
        // Logs any errors encountered during the serviceability check.
        console.error('Error fetching serviceability:', error);
        // Responds with a 500 status code and an error message.
        res.status(500).json({ message: 'Failed to fetch serviceability', error: error.message });
    }
};
