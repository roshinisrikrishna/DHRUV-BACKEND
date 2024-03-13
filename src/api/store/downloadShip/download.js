// Imports axios for making HTTP requests.
import axios from 'axios';

// Asynchronously logs in to Shiprocket and retrieves an authentication token.
const loginAndGetToken = async () => {
    // Prepares login credentials.
    const loginData = JSON.stringify({
        "email": "roshinitharanair@gmail.com",
        "password": "Vishal8398"
    });

    try {
        // Sends a POST request to Shiprocket's login endpoint with the credentials.
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', loginData, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Returns the authentication token from the response.
        return response.data.token;
    } catch (error) {
        // Logs any errors that occur during login.
        console.error('Login error:', error);
        throw error; // Rethrows the error to be handled by the caller.
    }
};

// Asynchronously fetches order details from a local server by order ID.
const getOrderDetails = async (orderId) => {
    try {
        // Sends a GET request to a predefined URL with the order ID as a query parameter.
        const response = await axios.get(`http://195.35.20.220:9000/store/shiprocket-get-order?orderId=${orderId}`);
        return response.data.matchingOrder; // Assumes 'matchingOrder' contains the required details and returns it.
    } catch (error) {
        // Logs any errors that occur when fetching order details.
        console.error('Error fetching order details:', error);
        throw error; // Rethrows the error for caller handling.
    }
};

// Asynchronously generates shipping documents for an order with Shiprocket.
const generateDocuments = async (manifest_generated, shiporder_id, shipment_id) => {
    const token = await loginAndGetToken(); // Logs in to get an authentication token.

    // Sets common headers for subsequent requests, including the authorization token.
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
   
    // Prepares and sends requests to generate an invoice and a label.
    const invoiceRequest = axios.post('https://apiv2.shiprocket.in/v1/external/orders/print/invoice', 
        { "ids": [shiporder_id] }, { headers });
    const labelRequest = axios.post('https://apiv2.shiprocket.in/v1/external/courier/generate/label', 
        { "shipment_id": [shipment_id] }, { headers });

    // Checks if the manifest hasn't already been generated, and if so, generates it.
    if(!manifest_generated) {
        await axios.post('https://apiv2.shiprocket.in/v1/external/manifests/generate', 
        { "shipment_id": [shipment_id] }, { headers });
    }

    // Prepares a request to print the manifest.
    const manifestRequest = axios.post('https://apiv2.shiprocket.in/v1/external/manifests/print', 
        { "order_ids": [shiporder_id] }, { headers });

    // Executes all document generation requests simultaneously and waits for all to complete.
    try {
        const results = await Promise.all([invoiceRequest, labelRequest, manifestRequest]);

        // Returns the responses from each document generation request.
        return {
            invoice: results[0].data,
            label: results[1].data,
            manifest: results[2].data
        };
    } catch (error) {
        // Logs any errors that occur during document generation.
        console.error('Error generating documents:', error);
        throw error; // Rethrows the error for caller handling.
    }
};

// Main orchestration function that uses the above functionalities to fetch order details and generate documents.
export const download = async (req, res) => {
    try {
        // Extracts the order ID from the request's query parameters.
        const orderId = req.query.orderId;
        // Fetches order details using the order ID.
        const orderDetails = await getOrderDetails(orderId);
        // Logs the order details, particularly checking for manifest generation.
        console.log('orderDetails manifest', orderDetails);

        // Proceeds to generate documents if the manifest hasn't been generated.
        const shiporder_id = orderDetails.id;
        const shipment_id = orderDetails.shipments[0].id; // Assumes at least one shipment exists.
        const documents = await generateDocuments(orderDetails.manifest_generated, shiporder_id, shipment_id);
        console.log('Documents:', documents); // Logs the generated documents.

        // Returns the generated documents.
        return documents;
    } catch (error) {
        // Logs any errors that occur within the main function.
        console.error('Error in main function:', error);
    }
};
