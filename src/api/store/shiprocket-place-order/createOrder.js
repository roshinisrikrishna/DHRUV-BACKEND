import axios from 'axios';

// Function to log in to ShipRocket and get a token
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

// Function to get the ID of the first active channel
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

// Function to fetch all orders from ShipRocket
const fetchAllOrders = async () => {
    try {
      const token = await loginAndGetToken();
      if (token) {
        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/orders', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
  
        // console.log('Orders fetched successfully:', response.data);
        return response.data; // or handle the data as needed
      } else {
        console.error('Failed to login and obtain token');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };
  
 // Function to assign courier and generate AWB
const assignCourierAndGenerateAWB = async (shipmentId, courierId, token) => {

    const postData = {
      "shipment_id": shipmentId,
      "courier_id": courierId,
      "status": "reassign",
      "is_return": "1" // Assuming you want to mark this as a return shipment, change as per your requirement
    };
  
    console.log('postData', postData)
    try {
      const response = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', postData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log('response assignCourierAndGenerateAWB', response)
      return response.data; // Return the response data for further processing
    } catch (error) {
      console.error('Error assigning courier and generating AWB:', error);
      throw error;
    }
  }; 

// Function to create a new order on ShipRocket
const createNewOrder = async (req,res,token, channelId) => {

    try {
        // Log in to ShipRocket and get a token
        const token = await loginAndGetToken();
        if (!token) {
            return res.status(401).json({ error: 'Failed to authenticate with ShipRocket' });
        }

        // Get the order details and courier ID from the request body
        const { order, courierId } = req.body;
        console.log('order req.body', order)
        console.log('courierId', courierId)
        if (!order || !courierId) {
            return res.status(400).json({ error: 'Missing order details or courier ID' });
        }

    // console.log('inside new order function')
    const orderData = {
        "order_id": order.id,
        "order_date": order.updated_at,
        "pickup_location": "Roshini Home",
        "channel_id": channelId,
        "comment": "Test",
        "billing_customer_name": order.shipping_address.first_name,
        "billing_last_name": order.shipping_address.last_name,
        "billing_address": order.shipping_address.address_1,
        "billing_address_2": order.shipping_address.address_2,
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
        "shipping_charges": order.shipping_total / 100,
        "payment_method": "Prepaid", // Assuming static as 'Prepaid'. Replace logic if dynamic.
        "sub_total": order.subtotal / 100, // Assuming subtotal is in cents
        "length": 10, // Static value as per requirement
        "breadth": 15, // Static value as per requirement
        "height": 1, // Static value as per requirement
        "weight": 0.1 // Static value as per requirement
      };

    // Create the order in ShipRocket
        const orderResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', orderData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('orderResponse.data', orderResponse.data)
        // Check if order creation was successful and get the shipment ID
        const shipmentId = orderResponse.data.shipment_id;

        console.log('shipmentId', shipmentId)
        // Assign courier and generate AWB
        const awbResponse = await assignCourierAndGenerateAWB(shipmentId, courierId, token);

        // Send the response back with order and AWB details
        res.json({ order: orderResponse.data, awb: awbResponse });
    } catch (error) {
        console.error('Order creation or courier assignment failed:', error);
        res.status(500).json({ error: 'Failed to create order or assign courier' });
    }
};
// Main function to execute the login, fetch the first active channel ID, and create a new order
export const executeOrderCreation = async (req,res) => {
    try {
        const token = await loginAndGetToken();
        const channelId = await getFirstActiveChannelId(token);
        if (channelId) {
            // console.log('token order', token)
            // console.log('channelId order', channelId)
            await createNewOrder(req,res,token, channelId);
        } else {
            console.error('No active channels found.');
        }
    } catch (error) {
        console.error('Failed to execute order creation:', error);
    }
};

// Execute the main function
