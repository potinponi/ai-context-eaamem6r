const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const app = express();
app.use(express.json());

// AI Context API Supabase connection
const aiSupabase = createClient(process.env.AI_SUPABASE_URL, process.env.AI_SUPABASE_ANON_KEY);

// Chatbot Supabase connection (for future use)
const chatbotSupabase = createClient(process.env.CHATBOT_SUPABASE_URL, process.env.CHATBOT_SUPABASE_ANON_KEY);

// Supabase Edge Function URL for embeddings
const EMBEDDING_FUNCTION_URL = "https://mdnijgzbkracortlwbgi.supabase.co/functions/v1/my-function"; // Update this URL

// Function to generate embeddings using Supabase Edge Function
async function generateEmbedding(text) {
    try {
        const response = await axios.post(
            EMBEDDING_FUNCTION_URL,
            { input: text },
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.data && response.data.embedding) {
            return response.data.embedding;
        } else {
            console.error("Embedding generation failed:", response.data);
            return null;
        }
    } catch (error) {
        console.error("Error generating embedding:", error.response?.data || error.message);
        return null;
    }
}

// API endpoint to store text with embeddings
app.post("/store-embedding", async (req, res) => {
    try {
        const { content, metadata } = req.body;

        if (!content) {
            return res.status(400).json({ error: "Content is required" });
        }

        const embedding = await generateEmbedding(content);

        if (!embedding) {
            return res.status(500).json({ error: "Failed to generate embedding" });
        }

        // Store the embedding in project_embeddings table
        const { error } = await aiSupabase
            .from("project_embeddings")
            .insert([{ content, embedding, metadata }]);

        if (error) {
            console.error("Error inserting embedding:", error);
            return res.status(500).json({ error: "Failed to store embedding" });
        }

        console.log("✅ Embedding stored successfully!");
        res.status(200).json({ message: "Embedding stored successfully" });
    } catch (error) {
        console.error("Error storing embedding:", error);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

