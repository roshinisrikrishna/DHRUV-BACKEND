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

export const getCourierId = async (req, res) => {
    try {
        const token = await loginAndGetToken();
        const courier_name = req.query.courierName;

        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/courierListWithCounts', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Log each order_id to the console
        const matchingCourier = response.data.courier_data.find(courier => courier.name === courier_name);

        if (matchingCourier) {
            // console.log('Matching courier found:', matchingCourier);
            res.json({ id: matchingCourier.id });
        } else {
            console.log('No matching courier found.');
            res.status(404).json({ message: 'No matching courier found.' });
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};
