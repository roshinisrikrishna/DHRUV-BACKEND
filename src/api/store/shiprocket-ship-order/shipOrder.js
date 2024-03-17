// Import axios for making HTTP requests and Medusa for e-commerce operations.
import axios from 'axios';
import Medusa from "@medusajs/medusa-js";
import { MEDUSA_BACKEND_URL } from "../config";

// Constants for Medusa backend URL and initialization of Medusa client.
const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 })

// Asynchronously logs in to ShipRocket to obtain an authentication token.
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

// Asynchronously retrieves the first active channel ID from ShipRocket using the authentication token.
const getFirstActiveChannelId = async (token) => {
    try {
        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/channels', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const activeChannel = response.data.data.find(channel => channel.status === 'Active');
        return activeChannel ? activeChannel.id : null;
    } catch (error) {
        console.error('Error fetching channels:', error);
        throw error;
    }
};

// Asynchronously generates a pickup request for an order shipment on ShipRocket.
const generatePickup = async (token, shipmentId) => {
    console.log('shipmentId', shipmentId)
    const pickupData = {
        "shipment_id": [shipmentId],
        "pickup_date": [new Date().toISOString().split('T')[0]] // Format today's date as YYYY-MM-DD
    };

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Attempt to generate a pickup
    try {
        const pickupResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', pickupData, { headers });
        console.log('Pickup generated successfully:', pickupResponse.data);
        return pickupResponse.data; // Return the response data
    } catch (error) {
        console.error('Error generating pickup:', error);
    }
};


// Asynchronously creates a new order on ShipRocket, including shipping and courier details.
const shipNewOrder = async (req, res, token, channelId) => {
    // Omitted detailed comments for brevity, similar to the above functions, this section includes:
    // - Logging the channel ID.
    // - Extracting order details and courier ID from the request.
    // - Constructing the data payload for creating a shipment.
    // - Making a POST request to ShipRocket to create the shipment.
    // - Handling and logging the response or errors accordingly.

    try {

        console.log('channelId ship', channelId)
        // Get the order details and courier ID from the request body
        const { order, courierId } = req.body;
        // console.log('order req.body ship', order)
        // console.log('courierId ship', courierId)
        if (!order || !courierId) {
            return res.status(400).json({ error: 'Missing order details or courier ID' });
        }

        const shipData = {
            "order_id": order.id,
            "order_date": order.updated_at,
            "channel_id": channelId,
            "courier_id": courierId,
            "billing_customer_name": order.shipping_address.first_name,
            "billing_last_name": order.shipping_address.last_name,
            "billing_address": `${order.shipping_address.address_1}, ${order.shipping_address.address_2}`,
            "billing_city": order.shipping_address.city,
            "billing_pincode": order.shipping_address.postal_code,
            "billing_state": order.shipping_address.province,
            "billing_country": order.shipping_address.country_code.toUpperCase() === 'IN' ? "India" : "Country Not Mapped",
            "billing_email": order.email,
            "billing_phone": order.shipping_address.phone,
            "shipping_is_billing": true, // Assuming this to be true as per the requirement
            "order_items": order.items.map(item => ({
                "name": `${item.title} - ${item.description}`,
                "sku": `SKU-${item.id}`, // Assuming 'SKU-id' is a placeholder. Replace with actual logic if SKU is available.
                "units": item.quantity,
                "selling_price": item.unit_price / 100, // Assuming unit_price is in cents
                "hsn": 441122 // Assuming HSN code is static. Replace with actual logic if HSN varies.
            })),
            "payment_method": "Prepaid",
            "sub_total": order.subtotal / 100, // Assuming subtotal is in cents
            "length": 10,
            "breadth": 5,
            "height": 1,
            "weight": 0.20,
            "pickup_location": "Roshini Home",
            "vendor_details": {
                "email": "roshinisparx@gmail.com",
                "phone": 9362204990,
                "name": "Roshini R",
                "address": "13 Savitri nagar",
                "address_2": "",
                "city": "Coimbatore",
                "state": "TamilNadu",
                "country": "India",
                "pin_code": "641001",
                "pickup_location": "Roshini Home"
            }
        }

        // console.log('shipData', shipData)
        // Prepare the headers with authorization token
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Send the POST request to ShipRocket API to create a forward shipment
        const shipmentResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/shipments/create/forward-shipment', shipData, { headers });

        // Log the response or handle it as needed
        console.log('Shipment created successfully:', shipmentResponse.data);

        return shipmentResponse;
        // Return the success response
        // res.json({ message: 'Shipment created successfully', data: shipmentResponse.data });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ error: 'Failed to create shipment', details: error.message });
    }
};

// Asynchronously generates an invoice on ShipRocket for specified order IDs.
const generateInvoice = async (token, orderIds) => {
    // Similar process as above functions, specifically tailored to invoice generation.
    // Involves constructing invoice data, setting headers, making a POST request, and handling the response or errors.
    const invoiceData = {
        "ids": orderIds // Array of order IDs
    };

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const invoiceResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/print/invoice', invoiceData, { headers });
        console.log('Invoice generated successfully:', invoiceResponse.data);
        return invoiceResponse.data; // Return the response data
    } catch (error) {
        console.error('Error generating invoice:', error);
        throw new Error(`Error generating invoice: ${error.response ? error.response.data : error.message}`);
    }
};

// Main function to execute the complete process including order shipment, pickup generation, and potentially creating a fulfillment in Medusa.
export const executeOrderShipment = async (req, res) => {
    // The function embodies a comprehensive process:
    // 1. Authenticates with ShipRocket to obtain a token.
    // 2. Retrieves an active channel ID.
    // 3. Proceeds with shipping the order using the `shipNewOrder` function.
    // 4. Based on the shipment response, it attempts to generate a pickup.
    // 5. Logs and handles responses from the shipment and pickup steps.
    // 6. Conditionally, if Medusa operations are required, it authenticates and performs order fulfillment on Medusa.
    // 7. Returns success response or handles errors appropriately.
    try {
        const token = await loginAndGetToken();
        const channelId = await getFirstActiveChannelId(token);

        if (!channelId) {
            throw new Error('No active channels found.');
        }

        // Ship the order and get the shipment response
        const shipmentResponse = await shipNewOrder(req, res, token, channelId);
        // if (!shipmentResponse || !shipmentResponse.data || !shipmentResponse.data.shipment_id) {
        //     throw new Error('Shipment ID not found in the response.');
        // }

        console.log('shipmentResponse.data', shipmentResponse)
        // Generate the pickup with the shipment ID
        const pickupResponse = await generatePickup(token, shipmentResponse.data.payload.shipment_id);
        console.log('pickupResponse', pickupResponse)
        // Send success response to client

        // Check if shipment and pickup were successful
        if (shipmentResponse.data.status === 1 && pickupResponse.pickup_status === 1) {
            // Create a session to get the API token for Medusa
            const sessionResponse = await medusa.admin.auth.createSession({
                email: 'admin@hb.com',
                password: 'admin'
            });

            const user = sessionResponse.user;
            let api_token = user.api_token;

            console.log('api_token', api_token)
            // Initialize Medusa with the obtained API token
            const medusaAccessed = new Medusa({
                baseUrl: MEDUSA_BACKEND_URL,
                maxRetries: 3,
                apiKey: api_token
            });

            // Assuming order ID and item ID are known or retrieved from previous responses
            const orderId = req.body.order.id; // Extract the order ID from the order object
           

            console.log('orderId', orderId)
            console.log('order items', req.body.order.items)
             const itemsForFulfillment = req.body.order.items.map(item => ({
                item_id: item.id,
                quantity: item.quantity
            }));
            console.log('itemsForFulfillment', itemsForFulfillment)
            // Use try...catch to handle asynchronous operation and potential errors
            try {
                // Create fulfillment for the order
                await medusaAccessed.admin.orders.createFulfillment(orderId, {
                    items: itemsForFulfillment
                }).then(({ order }) => {
                    console.log("Fulfillment created for order ID:", order);
                });
            } catch (error) {
                console.error("Error creating fulfillment:", error);
            }
        }

        // Send success response to client
        res.json({
            message: 'Shipment, pickup, and possibly fulfillment created successfully',
            shipmentData: shipmentResponse.data,
            pickupData: pickupResponse
        });

    } catch (error) {
        console.error('Failed to execute order shipment and generate pickup:', error);
        res.status(500).json({ message: 'Failed to execute order shipment and generate pickup', error: error.message });
    }
};