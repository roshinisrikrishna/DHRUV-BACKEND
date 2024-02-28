// Import axios for making HTTP requests
import axios from 'axios';
// Import dotenv for environment variable management
import dotenv from 'dotenv';
// Load environment variables from a .env file into process.env
dotenv.config();

// Function to perform ShipRocket login and get token
const srlogin = async () => {
    // Define the login data as a JSON string
    let srlogindata = JSON.stringify({
        "email": "roshinitharanair@gmail.com",
        "password": "Vishal8398"
    });

    try {
        // Configuration for the axios request
        var config = {
            method: 'post', // HTTP method
            maxBodyLength: Infinity, // No limit on the body length
            url: 'https://apiv2.shiprocket.in/v1/external/auth/login', // URL of the login endpoint
            headers: {
                'Content-Type': 'application/json' // Set content type as JSON
            },
            data: srlogindata // Data to be sent in the request body
        };
       
        // Send the request and wait for the response
        const response = await axios(config);
        // Log the response data for debugging
        console.log('Login response:', response.data); 

        // Check if the response contains a token
        if (response.data && response.data.token) {
            // Return the token if present
            return {
                status: true,
                message: 'Success!!',
                mainToken: response.data.token
            };
        } else {
            // Log and return an error if the expected token is not present
            console.error('Unexpected response structure:', response.data);
            return { status: false, message: "Login failed: Unexpected response structure" };
        }
    } catch (error) {
        // Log and return any error that occurs during the request
        console.error('Login error:', error);
        return { status: false, message: `Login failed: ${error.message}` };
    }
};

// Function to extract courier details from the response
// Function to extract courier details from the response and exclude specific couriers
const extractCourierDetails = (response) => {
    // Define a list of couriers to exclude
    const excludedCouriers = ['Blue Dart', 'Amazon Surface COD 500gm', 'Xpressbees', 'Ekart Logistics'];

    if (response && response.data && response.data.data && response.data.data.available_courier_companies) {
        // Filter out excluded couriers and map the remaining ones
        return response.data.data.available_courier_companies
            .filter(courier => !excludedCouriers.includes(courier.courier_name))
            .map(courier => ({
                name: courier.courier_name,
                estimated_delivery_days: courier.estimated_delivery_days,
                amount: courier.rate,
                id: courier.id,
                pickup_performance: courier.pickup_performance,
                rating: courier.rating
            }));
    } else {
        console.error("Invalid response structure");
        return [];
    }
}


// Function to calculate the shipping rate
const srShippingRateCalculation = async (pickup_postcode, delivery_postcode, weight, declared_value) => {
    try {
        // Log in to ShipRocket and get a token
        let getToken = await srlogin();
        // Define query parameters for the request
        let params = `pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=1&declared_value=${declared_value}&rate_calculator=1&blocked=1&is_return=0&is_web=1&is_dg=0&only_qc_couriers=0`;

        // Check if token retrieval was successful
        if (getToken.status) {
            // Configuration for the axios request to get shipping rates
            var config = {
                method: 'get', // HTTP method
                maxBodyLength: Infinity, // No limit on the body length
                url: `https://apiv2.shiprocket.in/v1/external/courier/serviceability?${params}`, // URL with query parameters
                headers: {
                    'Content-Type': 'application/json', // Set content type as JSON
                    'Authorization': `Bearer ${getToken.mainToken}` // Authorization header with the token
                }
            };
            // Send the request and wait for the response
            const response = await axios(config);

            console.log("ship response ",response)
            // Extract courier details from the response
            let courierDetails = extractCourierDetails(response);

            // Log the courier details for debugging
            console.log("Courier details:", courierDetails)
            // Return the courier details and the status message
            return {
                status: true,
                message: 'Success!!',
                courierDetails: courierDetails,
                mainset: response.data
            };
        } else {
            // Throw an error if the token was not retrieved successfully
            throw new Error('Token generation failed');
        }
    } catch (e) {
        // Log and return any error that occurs during the process
        console.error(e);
        return {
            status: false,
            message: 'Error in srShippingRateCalculation: ' + e.message
        };
    }
};

// POST method function for rate calculation
export const rateCalculation = async (req, res) => {
    try {
        // Extract the required data from the request body
        const { pickup_postcode, delivery_postcode, weight, declared_value } = req.body;

        // Call the shipping rate calculation function with the extracted data
        let rs_data = await srShippingRateCalculation(pickup_postcode, delivery_postcode, weight, declared_value);

        // Send the calculated data in the response
        res.status(200).json({
            status: rs_data.status,
            message: rs_data.message,
            courierDetails: rs_data.courierDetails // Include courier details in the response
        });
    } catch (error) {
        // Handle any error that occurs and send a 500 status
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
