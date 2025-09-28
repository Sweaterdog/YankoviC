import axios from 'axios';

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai';

export async function streamPollinationsResponse(messages, tools, config, modelName) {
  const apiKey = config.apiKeys.pollinations;
  
  const payload = {
    model: modelName,
    messages: messages,
    tools: tools,
    tool_choice: 'auto',
    stream: true,
  };

  const headers = { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' };
  if (apiKey && apiKey !== "YOUR_POLLINATIONS_API_KEY_OR_LEAVE_BLANK") {
      headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(POLLINATIONS_URL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pollinations API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.body.getReader();
}

// =============================================================
// AI Code Completion Function (Blocking)
// =============================================================

// Cache for WORDS.md content
let yankovicDocsCache = null;

// Function to load WORDS.md dynamically
async function loadYankovicDocs() {
  if (yankovicDocsCache) {
    return yankovicDocsCache;
  }
  
  try {
    // Try Electron/Node first
    // eslint-disable-next-line no-undef
    const fs = window.require ? window.require('fs') : undefined;
    const path = window.require ? window.require('path') : undefined;
    
    if (fs && path) {
      // In Electron, try to find WORDS.md in the project root
      let wordsPath = path.resolve(__dirname, '../../../WORDS.md');
      if (!fs.existsSync(wordsPath)) {
        wordsPath = path.resolve(__dirname, '../../../../WORDS.md');
      }
      if (!fs.existsSync(wordsPath)) {
        wordsPath = path.resolve(process.cwd(), 'WORDS.md');
      }
      yankovicDocsCache = fs.readFileSync(wordsPath, 'utf-8');
      return yankovicDocsCache;
    }
  } catch (e) {
    console.log('Not in Electron context, trying browser fetch...');
  }
  
  // Browser fallback - fetch from public folder
  try {
    const response = await fetch('/WORDS.md');
    if (response.ok) {
      yankovicDocsCache = await response.text();
      return yankovicDocsCache;
    }
  } catch (e) {
    console.error('Failed to load WORDS.md:', e);
  }
  
  // Fallback if loading fails
  return `YankoviC Programming Language Documentation
  
Basic syntax:
- Variables: variable_name(value) to declare
- Functions: function_name(parameters) { code }
- Control flow: if_you_are(condition) { code } otherwise { code }
- Loops: eat_it(times) { code }
- Output: show_me(value) to display
- HTTP: Like_a_Server() for web servers
- Media: fat_frame(image_path) for images, Lossless_Laughter(media_path) for audio/video
`;
}
export async function getAiCodeCompletion(code, config) {
    const apiKey = config.apiKeys.pollinations;
    
    // Load YankoviC documentation dynamically
    const yankovicDocs = await loadYankovicDocs();
    console.log('AI Completion - Loaded docs length:', yankovicDocs.length);
    console.log('AI Completion - First 200 chars of docs:', yankovicDocs.substring(0, 200));
    
    const completionSystemPrompt = `You are an expert YankoviC code completion engine. Your task is to complete the code provided by the user.
Analyze the user's code and the position of their cursor. Provide only the most logical completion.
---
RULES:
1.  **YOU MUST ONLY RETURN RAW CODE.**
2.  **DO NOT** provide any explanations, comments, or markdown formatting like \`\`\`.
3.  Your response should be the text that would be typed next.
4.  Keep completions short and concise (a single line or a small block).
5. When finished with the code completion, either provide a double newline (\n\n), OR "// Completed request"
6. **IMPORTANT: This is YankoviC language, NOT Python. Use YankoviC syntax only.**
---
The Albuquerque Math Library now includes a yoda(a, b) function for modulus operations. Use yoda() instead of the % operator in YankoviC code.

YankoviC Language Documentation:
${yankovicDocs}
`;

    const messages = [
        { "role": "system", "content": completionSystemPrompt },
        { "role": "user", "content": `Complete the following YankoviC code. Here is the current file:\n\n\`\`\`yankovic\n${code}\n\`\`\`\n\nComplete the code using YankoviC syntax only (NOT Python).` }
    ];
    
    console.log('AI Completion - System prompt length:', completionSystemPrompt.length);
    console.log('AI Completion - User code:', code.substring(0, 100) + '...');

    const payload = {
        model: 'openai-large',
        messages: messages,
        temperature: 0.2,
        max_tokens: 512,
        stop: ["\n\n", "// Completed request"]
    };

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey && apiKey !== "YOUR_POLLINATIONS_API_KEY_OR_LEAVE_BLANK") {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
        const response = await axios.post(POLLINATIONS_URL, payload, { headers });
        const completion = response.data.choices[0].message.content;
        return completion.trim();
    } catch (error) {
        console.error("AI Code Completion Error:", error);
        return `// AI completion failed: ${error.message}`;
    }
}