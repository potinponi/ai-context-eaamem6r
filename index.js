const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// ✅ Webhook route for GitHub
app.post('/github-webhook', (req, res) => {
    console.log("🔹 Received a webhook event from GitHub!");
    console.log(JSON.stringify(req.body, null, 2));
    res.status(200).send('Webhook received');
});

// ✅ Root route to check if server is running
app.get('/', (req, res) => {
    res.send('✅ Server is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

