import axios from 'axios';

const loginAndGetToken = async () => {
    const loginData = JSON.stringify({
        "email": "roshinitharanair@gmail.com",
        "password": "Vishal8398"
    });

    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', loginData, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data.token;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Function to get order details from local server
const getOrderDetails = async (orderId) => {
    try {
        const response = await axios.get(`http://195.35.20.220:9000/store/shiprocket-get-order?orderId=${orderId}`);
        return response.data.matchingOrder; // Assuming this contains the required details
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};

// Function to send requests to Shiprocket APIs for Invoice, Label, and Manifest
const generateDocuments = async (manifest_generated, shiporder_id, shipment_id) => {
    // console.log('shiporder_id', shiporder_id)
    // console.log('shipment_id', shipment_id)
    const token = await loginAndGetToken(); // Login to get auth token

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
   
    // Prepare requests for each document
    const invoiceRequest = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/print/invoice', 
        { "ids": [shiporder_id] }, { headers });
    const labelRequest = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/generate/label', 
        { "shipment_id": [shipment_id] }, { headers });

        if(!manifest_generated)
        {
            const generateManifest = await axios.post('https://apiv2.shiprocket.in/v1/external/manifests/generate', 
            { "shipment_id": [shipment_id] }, { headers });
        }

    const manifestRequest = await axios.post('https://apiv2.shiprocket.in/v1/external/manifests/print', 
        { "order_ids": [shiporder_id] }, { headers });

        // console.log('invoiceRequest', invoiceRequest)
        // console.log('labelRequest', labelRequest)
        // console.log('manifestRequest', manifestRequest)
    // Execute all requests simultaneously and combine responses
    try {
        const results = await Promise.all([invoiceRequest, labelRequest, manifestRequest]);

        // console.log('results', results)
        return {
            invoice: results[0].data,
            label: results[1].data,
            manifest: results[2].data
        };
    } catch (error) {
        console.error('Error generating documents:', error);
        throw error;
    }
};

// Main function to orchestrate the operations
export const download = async (req,res) => {
    try {
        const orderId = req.query.orderId;
        const orderDetails = await getOrderDetails(orderId);
        console.log('orderDetails manifest', orderDetails)
        // Check if manifest is already generated
        if (orderDetails.manifest_generated) {
            console.log('Manifest already generated. Skipping generation.');
            // return; // Exit the function early
        }
        const shiporder_id = orderDetails.id;
        const shipment_id = orderDetails.shipments[0].id; // Assuming there is at least one shipment
        const documents = await generateDocuments(orderDetails.manifest_generated,shiporder_id, shipment_id);
        console.log('Documents:', documents);
        return documents;
    } catch (error) {
        console.error('Error in main function:', error);
    }
};



