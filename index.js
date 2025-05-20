require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3001'
}));

// === Intent Parser ===
function parseIntent(message) {
    const lower = message.toLowerCase();
    let intent = null;

    if (lower.includes("pay")) {
        intent = "make_payment";
    } else if (lower.includes("detailed")) {
        intent = "query_bill_detailed";
    } else if (
        lower.includes("what is") ||
        lower.includes("total") ||
        lower.includes("amount") ||
        lower.includes("how much") ||
        lower.includes("query") ||
        lower.includes("bill for")
    ) {
        intent = "query_bill";
    }

    const subscriberMatch = message.match(/subscriber\s+(\d{4})/i);
    const subscriberNo = subscriberMatch ? subscriberMatch[1] : null;

    const monthMatch = message.match(
        /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i
    );
    const month = monthMatch ? convertMonthToNumber(monthMatch[1]) : null;

    const yearMatch = message.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;

    return { intent, subscriberNo, month, year };
}

function convertMonthToNumber(monthName) {
    const months = {
        january: 1,
        february: 2,
        march: 3,
        april: 4,
        may: 5,
        june: 6,
        july: 7,
        august: 8,
        september: 9,
        october: 10,
        november: 11,
        december: 12,
    };
    return months[monthName.toLowerCase()] || null;
}

// === Chat Endpoint ===
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const { intent, subscriberNo, month, year } = parseIntent(message);

        if (!intent || !subscriberNo || !month || !year) {
            return res.status(400).json({ error: 'Missing intent, subscriberNo, month, or year in message' });
        }

        const baseUrl = process.env.MIDTERM_API_URL;
        const token = process.env.GATEWAY_TOKEN;

        const headers = {
            Authorization: `Bearer ${token}`
        };

        let url, response;

        switch (intent) {
            case 'query_bill':
                url = `${baseUrl}?subscriberNo=${subscriberNo}&month=${month}&year=${year}`;
                response = await axios.get(url, { headers });
                return res.json({ response: response.data });

            case 'query_bill_detailed':
                try {
                    url = `${baseUrl}/detailed?subscriberNo=${subscriberNo}&month=${month}&year=${year}&page=0&size=10`;
                    response = await axios.get(url, { headers });
                    return res.json({ response: response.data });
                } catch (err) {
                    console.error("Detailed Bill Error:", err.response?.data || err.message);
                    return res.status(500).json({ error: 'Failed to fetch detailed bill.' });
                }

            case 'make_payment':
                url = `${baseUrl}/pay?subscriberNo=${subscriberNo}&month=${month}&year=${year}`;
                response = await axios.post(url, {}, { headers });
                return res.json({ response: response.data });

            default:
                return res.status(400).json({ error: 'Unknown intent' });
        }

    } catch (error) {
        console.error('Agent error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`AI Agent server running at http://localhost:${PORT}`);
});
