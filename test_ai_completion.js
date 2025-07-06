// Test script to verify AI completion functionality
import { getAiCodeCompletion } from './frontend/src/core/aiService.js';

// Mock config for testing
const testConfig = {
    apiKeys: {
        pollinations: "gsVU91PD7-aQ_W6k"
    }
};

// Test code to complete
const testCode = `spatula want_a_new_duck() {
    verse my_song = "`;

console.log("Testing AI completion with dynamically loaded WORDS.md...");
console.log("Test code:", testCode);

// Test completion
getAiCodeCompletion(testCode, testConfig).then(completion => {
    console.log("Completion result:", completion);
}).catch(error => {
    console.error("Error:", error);
});
