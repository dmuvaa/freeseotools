import { OpenRouter } from "@openrouter/sdk";
import dotenv from 'dotenv';
import path from 'path';

// Boilerplate to load env for the test script
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const openrouter = new OpenRouter({
    apiKey: apiKey
});

async function main() {
    try {
        const stream = await openrouter.chat.send({
            model: "perplexity/sonar-deep-research",
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Where is Kenya?"
                        }
                    ]
                }
            ],
            stream: true
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                process.stdout.write(content);
            }
        }
    } catch (e) {
        console.error("Script Error:", e);
    }
}

main();
