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

app.post("/github-webhook", async (req, res) => {
    try {
        const commits = req.body.commits;
        
        if (!commits || commits.length === 0) {
            return res.status(400).send("No commits found");
        }

        for (const commit of commits) {
            const { id, message, url, author, added, removed, modified } = commit;

            // Insert commit into AI Context API Supabase
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
                    },
                ]);

            if (error) {
                console.error("Error inserting commit:", error);
            }
        }

        console.log("🔹 Commit saved to AI Context API Supabase");
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


