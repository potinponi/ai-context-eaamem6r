const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const app = express();
app.use(express.json());

// Supabase connections
const aiSupabase = createClient(process.env.AI_SUPABASE_URL, process.env.AI_SUPABASE_ANON_KEY);
const chatbotSupabase = createClient(process.env.CHATBOT_SUPABASE_URL, process.env.CHATBOT_SUPABASE_ANON_KEY);

// Supabase Edge Function for generating embeddings
const EMBEDDING_FUNCTION_URL = "https://mdnijgzbkracortlwbgi.supabase.co/functions/v1/my-function"; // Update this

// Route to retrieve similar embeddings
app.post("/retrieve-embedding", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: "Missing query text" });
        }

        // Get embedding for the query
        const embeddingResponse = await axios.post(EMBEDDING_FUNCTION_URL, { text: query });
        const queryEmbedding = embeddingResponse.data.embedding;

        // Search for similar embeddings in Supabase
        const { data, error } = await aiSupabase.rpc("match_project_embeddings", {
            query_embedding: queryEmbedding,
            match_threshold: 0.75, // Adjust similarity threshold
            match_count: 5 // Number of results to return
        });

        if (error) {
            console.error("Error retrieving embeddings:", error);
            return res.status(500).json({ error: "Failed to retrieve embeddings" });
        }

        res.json({ results: data });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});



