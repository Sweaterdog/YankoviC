import * as genAI from '@google/genai';
import axios from 'axios';

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai';

// This function now uses the correct import and instantiation
export async function streamGeminiResponse(messages, tools, config, modelName) {
  const apiKey = config.apiKeys.gemini;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    throw new Error("Word Crime! Your Gemini API key is missing from public/config.json.");
  }

  // THE FIX IS HERE:
  // 1. We use the namespace import `genAI`.
  // 2. We instantiate the class using `genAI.default`.
  const googleAI = new genAI.default(apiKey);

  const geminiTools = [{ functionDeclarations: tools.map(t => t.function) }];
  
  const model = googleAI.getGenerativeModel({
    model: modelName,
    tools: geminiTools,
    systemInstruction: messages.find(m => m.role === 'system')?.content || '',
  });

  const history = messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(0, -1);
  const lastMessage = messages[messages.length - 1].content;
  
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage);
  
  return result.stream;
}

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
// NEW: AI Code Completion Function (Blocking)
// =============================================================

const yankovicDocs = `
YankoviC Language Documentation:
- Keywords: spatula, lasagna, lyric, verse, horoscope, accordion_solo, jeopardy, another_one, polka, hardware_store, twinkie_wiener_sandwich, stupid, its_a_fact, total_baloney, lunchbox, on_the_menu, #eat.
- Entry Point: Every program must have 'spatula want_a_new_duck()'.
- Success Code: All successful programs must end with 'twinkie_wiener_sandwich 27;'.
- Modules: Use '.hat' files for headers. Use 'on_the_menu' to export functions/structs. Use '#eat "local.hat"' or '#eat <global.hat>' to import.
Further documentation:

### **The Official White & Nerdy Guide to YankoviC**

Welcome, programmer, to YankoviC! This is a language for those who know their TCP/IP from their Fozzie Bear, who dare to be stupid, and who believe that the best way to write code is with the frantic, accordion-powered energy of a polka medley. A well-organized project is a thing of beauty, like a perfectly layered Twinkie Wiener Sandwich.

This guide provides the full list of keywords and core concepts. To write in YankoviC is to commit to the parody. The syntax is a joke, but your logic must be impeccable. Never commit a word crime.

### **Fundamental Data Types**

The very ingredients of your code sandwich.

**Keyword: spatula**
*   C/C++ Equivalent: int
*   Description & Rationale: Represents a 32-bit or 64-bit integer. From "I Want a New Duck," it is your all-purpose, indispensable, foundational tool.

**Keyword: lasagna**
*   C/C++ Equivalent: float, double
*   Description & Rationale: Represents a floating-point number. A messy, layered, and often imprecise data type, just like the beloved dish from the song "Lasagna".

**Keyword: lyric**
*   C/C++ Equivalent: char
*   Description & Rationale: Represents a single character. The smallest building block of any good parody.

**Keyword: verse**
*   C/C++ Equivalent: string
*   Description & Rationale: An ordered collection of lyrics. Used to hold text, from a single word to an entire song.

**Keyword: horoscope**
*   C/C++ Equivalent: bool
*   Description & Rationale: A boolean value. As "Your Horoscope For Today" teaches us, it can only have one of two values: its_a_fact or total_baloney.

**Keyword: accordion_solo**
*   C/C++ Equivalent: void
*   Description & Rationale: Represents the absence of a value. It's a function that does something purely for the performance, without returning a result.

### **Control Flow**

How to make decisions and do things over and over... and over.

**Keyword: jeopardy**
*   C/C++ Equivalent: if
*   Description & Rationale: Begins a conditional block. You are putting your program's flow on the line for a chance at a daily double or absolute failure.

**Keyword: what_if_god_was_one_of_us**
*   C/C++ Equivalent: else if
*   Description & Rationale: For when the first jeopardy condition is total_baloney. It poses an alternative, often philosophical, question to check.

**Keyword: another_one**
*   C/C++ Equivalent: else
*   Description & Rationale: The catch-all block for when all jeopardy conditions fail. Another condition rides the bus.

**Keyword: polka**
*   C/C++ Equivalent: while
*   Description & Rationale: Creates a loop that continues as long as a condition is its_a_fact. It's energetic, repetitive, and keeps going long after you think it should stop.

**Keyword: do_the_polka ... polka**
*   C/C++ Equivalent: do ... while
*   Description & Rationale: A variation of the polka loop where the code block is executed at least once before the condition is checked. You must do_the_polka first!

**Keyword: hardware_store**
*   C/C++ Equivalent: for
*   Description & Rationale: A structured loop with an initializer, a condition, and an incrementer. Perfect for iterating through a long, specific, and detailed list of items. For example: hardware_store (spatula i=0; i < 10; i=i+1)

**Keyword: give_up**
*   C/C++ Equivalent: break
*   Description & Rationale: Immediately exits the current loop. For when you've lost on jeopardy and just want to go home.

**Keyword: do_it_again**
*   C/C++ Equivalent: continue
*   Description & Rationale: Skips the remainder of the current loop iteration and proceeds to the next one.

### **Functions, Memory, and Structure**

How to organize your code and manage your lunchbox.

**Keyword: want_a_new_duck()**
*   C/C++ Equivalent: main()
*   Description & Rationale: The primary entry point for any YankoviC program. All execution begins with the desire for a new duck. Its type must be spatula.

**Keyword: twinkie_wiener_sandwich**
*   C/C++ Equivalent: return
*   Description & Rationale: Returns a value from a function. It is the final, questionable, yet delicious creation that you present to whatever called the function.

**Keyword: lunchbox**
*   C/C++ Equivalent: struct, class
*   Description & Rationale: A composite data structure that can hold a variety of different data types and functions. It's a container for all your goodies.

**Keyword: gimme_a**
*   C/C++ Equivalent: new
*   Description & Rationale: Dynamically allocates memory on the heap. Used when you want the system to give you a new object, like gimme_a Duck;.

**Keyword: in_the_blender**
*   C/C++ Equivalent: delete
*   Description & Rationale: Deallocates memory that was created with gimme_a. It's a noisy, chaotic, but necessary way to clean up.

**Keyword: this_box**
*   C/C++ Equivalent: this
*   Description & Rationale: A pointer that refers to the current lunchbox instance you are inside of.

### **Literals & Constants**

The actual, unchangeable values you commit to.

**Keyword: its_a_fact**
*   C/C++ Equivalent: true
*   Description & Rationale: The positive horoscope value.

**Keyword: total_baloney**
*   C/C++ Equivalent: false
*   Description & Rationale: The negative horoscope value.

**Keyword: stupid**
*   C/C++ Equivalent: const
*   Description & Rationale: Declares a variable as a constant, whose value cannot be changed after initialization. To declare something stupid is to make a permanent, unshakeable commitment. You must Dare to be Stupid.

### **Creating and Using Header Files (Hats)**

#### **Philosophy**

A .hat file is more than just a list of declarations; it's a menu of services. You are not merely including a file; you are ordering from a menu of well-defined, thematically consistent functions and data structures. A good .hat file should be as focused as a song parody—it should do one thing and do it with style.

#### **Core Keywords: The Menu and The Kitchen**

**1. on_the_menu**
*   C/C++ Equivalent: export, extern (conceptually)
*   Purpose: This keyword declares that a function, lunchbox definition, or stupid constant is publicly available to any file that uses #eat on this .hat file. It is the most important keyword for modular programming. Anything not marked on_the_menu is considered private to the file.

**2. #eat**
*   C/C++ Equivalent: #include
*   Purpose: The directive to consume another file's public offerings.
    *   #eat "my_stuff.hat": Use double quotes for local files within your project. This is for eating your own cooking.
    *   #eat <word_crimes.hat>: Use angle brackets for the "Poodle Hat" Standard Library, which is globally available.

**3. private_stash**
*   C/C++ Equivalent: static (for functions/variables at file scope)
*   Purpose: Explicitly declares a function or global variable as being private to the file it's defined in. While this is the default behavior, using private_stash is considered good style for helper functions that should never be seen by other files, even by accident. It's your secret ingredient.

#### **File Naming Conventions**

*   .yc: A YankoviC source file containing an executable want_a_new_duck() function or functions that are part of a larger program.
*   .hat: A YankoviC header file. It should contain on_the_menu declarations, lunchbox definitions, and stupid constants. It generally should not contain executable code, only the definitions and function prototypes.
*   .menu: A data file, often in a JSON-like or custom format, for storing non-code assets like lists of parody ideas or high scores.

#### **The Al-gorithms of Style for .hat Files**

1.  **One Hat, One Purpose:** A hat file should manage one concept. string_operations.hat is good. random_stuff_i_wrote.hat is bad.
2.  **Comment Like You're Writing Liner Notes:** Use the header of your .hat file to explain its purpose, preferably with a rhyming couplet.
3.  **The Spatula-Duck Paradox (Circular Dependencies):** Avoid situations where spatula.hat uses #eat on duck.hat and duck.hat simultaneously uses #eat on spatula.hat. The compiler will get confused and might just start playing "The Carnival of the Animals, Part II."

#### **Example: A verse_operations.hat Library**

**File: verse_operations.hat**

    // File: verse_operations.hat
    //
    // Some functions for your lyrical prose,
    // Use them in your code, that's how it goes!

    #eat <word_crimes.hat> // We need this for the verse type definition.

    // This helper function is our little secret.
    private_stash lyric get_last_lyric(verse input_verse) {
        // Logic to get the last character would go here.
        twinkie_wiener_sandwich 'a'; // Placeholder
    }

    // This function is available for everyone to use!
    on_the_menu verse add_an_exclamation_mark(verse input_verse) {
        stupid verse new_verse = input_verse + "!";
        twinkie_wiener_sandwich new_verse;
    }

    on_the_menu stupid spatula THE_ANSWER_IS_ALWAYS = 27;

**File: main.yc**

    #eat "verse_operations.hat"
    #eat <word_crimes.hat>

    spatula want_a_new_duck() {
        verse my_song_title = "My Bologna";

        // This call works because the function is on_the_menu.
        verse excited_title = add_an_exclamation_mark(my_song_title);

        perform_a_parody("The new title is: %verse\n", excited_title);
        
        // This call would FAIL because get_last_lyric is a private_stash.
        // lyric l = get_last_lyric(my_song_title);
        // The compiler would report an error like "Function not on the menu!"

        perform_a_parody("The answer is always: %spatula\n", THE_ANSWER_IS_ALWAYS);

        twinkie_wiener_sandwich 27;
    }

### **Special Mandates: The Unspoken, Spoken**

**The Success Code:** A program that finishes successfully MUST return 27. No exceptions. twinkie_wiener_sandwich 27;

**The Entry Point:** Every program must contain exactly one spatula want_a_new_duck() function. This is where your story begins.

**The Style:** Remember the Al-gorithms of Style. Comment in rhyme, name your variables with flair, and never, ever write code that's hard to read. That's a word crime.

Now go forth and program. The world needs more spinning ducks.

### **UHF.hat - The Graphics and Window Management Library**

The UHF.hat library provides graphics capabilities and window management for YankoviC programs. It's named after Weird Al's movie "UHF" and allows you to create graphical windows, draw shapes, and handle animation loops.

#### **Window Management Functions**

**start_the_show(width, height, title)**
*   Purpose: Creates a new graphics window with the specified dimensions and title.
*   Parameters: spatula width, spatula height, verse title
*   Example: start_the_show(800, 600, "UHF Channel 62: The Duck Polka");
*   Notes: Must be called before any drawing operations. Opens a new window for graphics output.

**cancel_the_show()**
*   Purpose: Closes the graphics window and cleans up resources.
*   Parameters: None
*   Example: cancel_the_show();
*   Notes: Should be called before program termination to properly close the window.

**the_shows_over()**
*   Purpose: Returns whether the user has closed the graphics window.
*   Returns: horoscope (boolean) - its_a_fact if window is closed, total_baloney if still open
*   Example: polka (!the_shows_over()) { /* animation loop */ }
*   Notes: Commonly used in animation loops to check if the window is still open.

**set_polka_speed(fps)**
*   Purpose: Sets the frame rate for animation loops.
*   Parameters: spatula fps - frames per second (typically 30-60)
*   Example: set_polka_speed(60);
*   Notes: Should be called after start_the_show() and before the animation loop.

#### **Frame Management Functions**

**roll_the_camera()**
*   Purpose: Begins a new frame for drawing operations.
*   Parameters: None
*   Example: roll_the_camera();
*   Notes: Must be called at the start of each frame in an animation loop.

**that_is_a_wrap()**
*   Purpose: Completes the current frame and displays it on screen.
*   Parameters: None
*   Example: that_is_a_wrap();
*   Notes: Must be called at the end of each frame to actually render the graphics.

#### **Drawing Functions**

**paint_the_set(color)**
*   Purpose: Fills the entire window with a background color.
*   Parameters: Color constant (e.g., SKY_BLUE_FOR_YOU)
*   Example: paint_the_set(SKY_BLUE_FOR_YOU);
*   Notes: Usually called after roll_the_camera() to clear the screen.

**pick_a_hawaiian_shirt(color)**
*   Purpose: Sets the drawing color for subsequent shape drawing operations.
*   Parameters: Color constant (e.g., TWINKIE_GOLD, YELLOW_MUSTARD, ORANGE_CHEESE)
*   Example: pick_a_hawaiian_shirt(TWINKIE_GOLD);
*   Notes: Must be called before drawing shapes to set their color.

**draw_a_big_ol_wheel_of_cheese(x, y, radius)**
*   Purpose: Draws a filled circle at the specified position.
*   Parameters: lasagna x, lasagna y, lasagna radius
*   Example: draw_a_big_ol_wheel_of_cheese(400, 300, 50);
*   Notes: Uses the color set by pick_a_hawaiian_shirt().

**draw_a_spamsicle(x, y, width, height)**
*   Purpose: Draws a filled rectangle at the specified position.
*   Parameters: lasagna x, lasagna y, lasagna width, lasagna height
*   Example: draw_a_spamsicle(200, 150, 20, 10);
*   Notes: Uses the color set by pick_a_hawaiian_shirt().

#### **Color Constants**

The UHF.hat library provides several predefined color constants:
*   SKY_BLUE_FOR_YOU - Light blue background color
*   TWINKIE_GOLD - Golden yellow color
*   YELLOW_MUSTARD - Bright yellow color
*   ORANGE_CHEESE - Orange color
*   And many others...

#### **Typical UHF Program Structure**

    #eat <UHF.hat>

    spatula want_a_new_duck() {
        // 1. Set up the window
        start_the_show(800, 600, "My UHF Program");
        set_polka_speed(60);
        
        // 2. Initialize variables for animation
        lasagna rotation_angle = 0.0;
        
        // 3. Main animation loop
        polka (!the_shows_over()) {
            // Begin frame
            roll_the_camera();
            
            // Clear background
            paint_the_set(SKY_BLUE_FOR_YOU);
            
            // Set drawing color and draw shapes
            pick_a_hawaiian_shirt(TWINKIE_GOLD);
            draw_a_big_ol_wheel_of_cheese(400, 300, 50);
            
            // Update animation variables
            rotation_angle = rotation_angle + 0.05;
            
            // End frame
            that_is_a_wrap();
        }
        
        // 4. Clean up
        cancel_the_show();
        twinkie_wiener_sandwich 27;
    }

#### **Advanced UHF Techniques**

**Creating Custom Draw Functions:**
You can create your own drawing functions that use UHF primitives:

    accordion_solo draw_the_duck(Duck duck, lasagna angle) {
        lasagna head_x = duck.x + cos(angle) * duck.body_radius * 1.2;
        lasagna head_y = duck.y + sin(angle) * duck.body_radius * 1.2;
        
        // Draw body
        pick_a_hawaiian_shirt(TWINKIE_GOLD);
        draw_a_big_ol_wheel_of_cheese(duck.x, duck.y, duck.body_radius);
        
        // Draw head
        draw_a_big_ol_wheel_of_cheese(head_x, head_y, duck.head_radius);
        
        // Draw beak
        pick_a_hawaiian_shirt(ORANGE_CHEESE);
        draw_a_spamsicle(head_x + duck.head_radius, head_y - 5, 20, 10);
    }

**Animation Best Practices:**
*   Always check !the_shows_over() in your polka loop
*   Use set_polka_speed() to control frame rate (30-60 FPS recommended)
*   Update animation variables incrementally each frame
*   Call roll_the_camera() at the start and that_is_a_wrap() at the end of each frame
`;

const completionSystemPrompt = `You are an expert YankoviC code completion engine. Your task is to complete the code provided by the user.
Analyze the user's code and the position of their cursor. Provide only the most logical completion.
---
RULES:
1.  **YOU MUST ONLY RETURN RAW CODE.**
2.  **DO NOT** provide any explanations, comments, or markdown formatting like \`\`\`.
3.  Your response should be the text that would be typed next.
4.  Keep completions short and concise (a single line or a small block).
5. When finished with the code completion, either provide a double newline (\n\n), OR "// Completed request"
---
${yankovicDocs}
`;

export async function getAiCodeCompletion(code, config) {
    const apiKey = config.apiKeys.pollinations; // We will use Pollinations for this as requested.

    const messages = [
        { "role": "system", "content": completionSystemPrompt },
        { "role": "user", "content": `Complete the following YankoviC code. Here is the current file:\n\n\`\`\`yankovic\n${code}\n\`\`\`\n\nComplete the code.` }
    ];

    const payload = {
        model: 'openai-large', // Using the reliable 'openai' model at Pollinations
        messages: messages,
        temperature: 0.2, // Low temperature for predictable completions
        max_tokens: 512,   // Limit the completion length
        stop: ["\n\n", "// Completed request"] // Stop generation at double newlines or the end of a function
    };

    const headers = { 'Content-Type': 'application/json' };
    // THIS IS THE KEY: If an API key is provided, use it. If not, the request is made anonymously.
    if (apiKey && apiKey !== "YOUR_POLLINATIONS_API_KEY_OR_LEAVE_BLANK") {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
        const response = await axios.post(POLLINATIONS_URL, payload, { headers });
        const completion = response.data.choices[0].message.content;
        return completion.trim(); // Return only the clean code text
    } catch (error) {
        console.error("AI Code Completion Error:", error);
        return `// AI completion failed: ${error.message}`;
    }
}