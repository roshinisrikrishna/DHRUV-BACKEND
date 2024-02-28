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

export const getServiceability = async (req, res) => {
    try {
        const token = await loginAndGetToken();
        const { pickup_postcode, delivery_postcode, cod, weight,declared_value } = req.query;
        const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&cod=${cod}&weight=${weight}&declared_value=${declared_value}`;

        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Process the response to find the top 5 courier companies with the lowest freight charge
        const sortedCouriers = response.data.data.available_courier_companies
            .sort((a, b) => a.rate - b.rate) // Sort by rate in ascending order
            .slice(0, 20) // Take the first 5 elements
            .map(courier => ({ // Map to required fields
                courier_company_id: courier.courier_company_id,
                courier_name: courier.courier_name,
                freight_charge: courier.freight_charge,
                id: courier.id,
                is_rto_address_available: courier.is_rto_address_available,
                others: courier.others,
                rto_performance: courier.rto_performance
             }));

        res.json(sortedCouriers);
    } catch (error) {
        console.error('Error fetching serviceability:', error);
        res.status(500).json({ message: 'Failed to fetch serviceability', error: error.message });
    }
};