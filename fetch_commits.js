require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const USERNAME = "potinponi";  // <-- Change this!
const REPO = "sb1-pqxaslsy";  // <-- Change this!

async function getCommits() {
    try {
        const response = await axios.get(`https://api.github.com/repos/${USERNAME}/${REPO}/commits`, {
            headers: { Authorization: `token ${ACCESS_TOKEN}` }
        });
        console.log("✅ Successfully connected to GitHub!");
        console.log(response.data[0]); // Print latest commit
    } catch (error) {
        console.error("❌ Error:", error.response.data);
    }
}

getCommits();
