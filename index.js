const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const app = express();
app.use(express.json());

// AI Context API Supabase connection
const aiSupabase = createClient(process.env.AI_SUPABASE_URL, process.env.AI_SUPABASE_ANON_KEY);

// Supabase Edge Function URL (Replace with your real function URL)
const EMBEDDING_FUNCTION_URL = "https://mdnijgzbkracortlwbgi.supabase.co/functions/v1/my-function"; // Update this URL

// Function to generate embeddings using Supabase Edge Function
async function generateEmbedding(text) {
    try {
        const response = await axios.post(EMBEDDING_FUNCTION_URL, { text });
        return response.data.embedding;
    } catch (error) {
        console.error("Embedding error:", error.response ? error.response.data : error);
        return null;
    }
}

// Store GitHub commits + embeddings in Supabase
app.post("/github-webhook", async (req, res) => {
    try {
        const commits = req.body.commits;
        if (!commits || commits.length === 0) {
            return res.status(400).send("No commits found");
        }

        for (const commit of commits) {
            const { id, message, url, author, added, removed, modified } = commit;
            
            // Generate embedding
            const embedding = await generateEmbedding(message);
            if (!embedding) {
                console.error("Failed to generate embedding for commit:", id);
                continue; // Skip this commit if embedding generation fails
            }

            // Insert commit + embedding into AI Context API Supabase
            const { error } = await aiSupabase
                .from("commits")
                .insert([
                    {
                        id,
                        message,
                        author: author.username,
                        url,
                        addedFiles: added,
                        removedFiles: removed,
                        modifiedFiles: modified,
                        embedding
                    },
                ]);

            if (error) {
                console.error("Error inserting commit:", error);
            }
        }

        console.log("🔹 Commit and embedding saved to AI Context API Supabase");
        res.status(200).send("Commit stored successfully");
    } catch (error) {
        console.error("Error handling webhook:", error);
        res.status(500).send("Server error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

