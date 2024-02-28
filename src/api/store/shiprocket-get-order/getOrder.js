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

export const getOrder = async (req, res) => {
    try {
        const token = await loginAndGetToken();
        const orderIdToMatch = req.query.orderId;

        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/orders', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Log each order_id to the console
        // response.data.data.forEach(order => console.log("order channel id", order.channel_order_id));
        const matchingOrder = response.data.data.find(order => order.channel_order_id === orderIdToMatch);

        if (matchingOrder && matchingOrder.status.toUpperCase() !== 'CANCELED') {
            // console.log('Matching order found:', matchingOrder);
            res.json({ matchingOrder: matchingOrder });
        } else if (matchingOrder && matchingOrder.status.toUpperCase() === 'CANCELED') {
            // console.log('Matching order is canceled.');
            res.status(404).json({ message: 'Matching order is canceled.' });
        } else {
            console.log('No matching order found.');
            res.status(404).json({ message: 'No matching order found.' });
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

