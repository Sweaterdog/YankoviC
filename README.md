# 🎵 YankoviC Programming Language v1.0.0

*"Dare to be Stupid" - A Programming Language for the Accordion-Minded*

Welcome to **YankoviC**, the most ridiculously awesome programming language inspired by the legendary "Weird Al" Yankovic! YankoviC combines the power of structured programming with the whimsy of polka music and the humor of the world's greatest musical parodist.

>  # Please note!
> This is a very early version of YankoviC!
>
> Do not expect all code to run perfectly, and expect the need to change some of the interpreters code!
> 
> I am doing my best to make this work, since Weird Al is my favorite, but It takes time to make a perfect project!

## 🎪 Table of Contents

- [🎵 YankoviC Programming Language v1.0.0](#-yankovic-programming-language-v100)
  - [🎪 Table of Contents](#-table-of-contents)
  - [🚀 Quick Start](#-quick-start)
  - [🎯 Installation \& Setup](#-installation--setup)
    - [Prerequisites](#prerequisites)
    - [Starting the Accordion IDE](#starting-the-accordion-ide)
    - [CLI Usage](#cli-usage)
  - [🎼 Language Syntax](#-language-syntax)
    - [Basic Program Structure](#basic-program-structure)
    - [Data Types](#data-types)
    - [Variable Declarations](#variable-declarations)
    - [Functions](#functions)
    - [Control Flow](#control-flow)
    - [Comments](#comments)
    - [Operators](#operators)
  - [📚 Standard Libraries](#-standard-libraries)
    - [UHF Graphics Library](#uhf-graphics-library)
    - [Weird Math Library](#weird-math-library)
  - [📁 File Management \& Imports](#-file-management--imports)
    - [Hat Files (.hat)](#hat-files-hat)
    - [Import Syntax](#import-syntax)
    - [Visibility Modifiers](#visibility-modifiers)
  - [🏢 The Accordion IDE](#-the-accordion-ide)
    - [File Explorer ("Filing Cabinet")](#file-explorer-filing-cabinet)
    - [Code Editor](#code-editor)
    - [Console](#console)
    - [AI Assistant](#ai-assistant)
  - [🎨 Graphics Programming with UHF](#-graphics-programming-with-uhf)
  - [📖 Example Programs](#-example-programs)
    - [Hello World](#hello-world)
    - [Random Number Generator](#random-number-generator)
    - [Graphics Animation](#graphics-animation)
  - [🐛 Error Messages](#-error-messages)
  - [🤝 Contributing](#-contributing)
  - [📜 License](#-license)

## 🚀 Quick Start

```yankovic
// Your first YankoviC program
spatula want_a_new_duck() {
    perform_a_parody("Welcome to YankoviC! Dare to be stupid!\\n");
    twinkie_wiener_sandwich 27;
}
```

## 🎯 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Starting the Accordion IDE
```bash
# Start the backend server
cd backend && npm start

# Start the frontend IDE (in another terminal)
cd frontend && npm run dev

# Open your browser to http://localhost:5174
```

Or, if you use linux:
```bash
# In the root directory
./start.sh
```

### CLI Usage
```bash
# Run a YankoviC file directly
node cli.js path/to/your/file.yc
```

## 🎼 Language Syntax

### Basic Program Structure

Every YankoviC program must have a main function called `want_a_new_duck`:

```yankovic
spatula want_a_new_duck() {
    // Your code here
    twinkie_wiener_sandwich 27; // Return success
}
```

### Data Types

YankoviC uses Weird Al-themed data types:

| Type | Description | Example |
|------|-------------|---------|
| `spatula` | Integer numbers | `spatula count = 42;` |
| `lasagna` | Floating-point numbers | `lasagna price = 3.14;` |
| `lyric` | Single character | `lyric grade = 'A';` |
| `verse` | Text strings | `verse song = "Eat It";` |
| `horoscope` | Boolean values | `horoscope is_weird = its_a_fact;` |
| `accordion_solo` | Arrays/collections | `accordion_solo items;` |

**Boolean Values:**
- `its_a_fact` = true
- `total_baloney` = false

### Variable Declarations

```yankovic
// Mutable variables
spatula age = 25;
verse name = "Alfred";

// Immutable variables (constants)
stupid spatula MAX_POLKAS = 100;
stupid verse ALBUM_NAME = "Dare to be Stupid";
```

### Functions

```yankovic
// Function with return type and parameters
verse make_parody(verse original, spatula intensity) {
    verse result = "♪ " + original + " ♪";
    twinkie_wiener_sandwich result;
}

// Function call
spatula want_a_new_duck() {
    verse my_song = make_parody("Beat It", 11);
    perform_a_parody("New song: %verse\\n", my_song);
    twinkie_wiener_sandwich 27;
}
```

### Control Flow

**If Statements (Jeopardy):**
```yankovic
jeopardy (age >= 18) {
    perform_a_parody("You're an adult!\\n");
} another_one {
    perform_a_parody("Still a kid!\\n");
}
```

**For Loops (Hardware Store):**
```yankovic
hardware_store (spatula i = 0; i < 10; i = i + 1) {
    perform_a_parody("Count: %spatula\\n", i);
}
```

**Game Loops (Polka):**
```yankovic
// Frame-based animation loop
polka (!the_shows_over()) {
    roll_the_camera();
    // Draw stuff here
    that_is_a_wrap();
}
```

### Comments

```yankovic
// Single-line comments
/* Multi-line
   comments */

// Comments can appear anywhere, even above import statements!
// This is totally fine:
#eat "my_library.hat"
```

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `+` `-` `*` `/` `%` | Arithmetic | `result = a + b * c % d;` |
| `==` `!=` `<` `>` `<=` `>=` | Comparison | `jeopardy (x == 42)` |
| `&&` `!` | Logical | `jeopardy (x > 0 && y < 10)` |
| `=` | Assignment | `x = 5;` |

## 📚 Standard Libraries

### UHF Graphics Library

Import with: `#eat <UHF.hat>`

**Window Management:**
```yankovic
start_the_show(800, 600, "My Awesome Window"); // Create window
cancel_the_show();                            // Close window
horoscope over = the_shows_over();            // Check if window closed
```

**Drawing Functions:**
```yankovic
roll_the_camera();                     // Start new frame
paint_the_set(YELLOW_MUSTARD);         // Set background color
pick_a_hawaiian_shirt(ORANGE_CHEESE);  // Set draw color
draw_a_big_ol_wheel_of_cheese(x, y, radius);  // Draw circle
draw_a_spamsicle(x, y, width, height); // Draw rectangle
that_is_a_wrap();                      // End frame
```

**Built-in Colors:**
- `YELLOW_MUSTARD` - Classic yellow
- `ORANGE_CHEESE` - Bright orange  
- `TWINKIE_GOLD` - Golden yellow
- `SKY_BLUE_FOR_YOU` - Light blue

**Animation Loop:**
```yankovic
#eat <UHF.hat>

spatula want_a_new_duck() {
    start_the_show(800, 600, "Bouncing Ball");
    set_polka_speed(60); // 60 FPS
    
    spatula x = 100;
    spatula dx = 5;
    
    polka (!the_shows_over()) {
        roll_the_camera();
        paint_the_set(SKY_BLUE_FOR_YOU);
        pick_a_hawaiian_shirt(ORANGE_CHEESE);
        draw_a_big_ol_wheel_of_cheese(x, 300, 50);
        
        x = x + dx;
        jeopardy (x > 750 || x < 50) {
            dx = -dx;
        }
        
        that_is_a_wrap();
    }
    twinkie_wiener_sandwich 27;
}
```

**Note on 3D Support:** Currently, UHF only supports 2D rendering. 3D support might be added in future versions if there's demand!

### Weird Math Library

Import with: `#eat <albuquerque.hat>`

**Functions:**
```yankovic
spatula random_spatula();                    // Random number 0-99
lasagna sin(lasagna angle);                  // Sine function
lasagna cos(lasagna angle);                  // Cosine function
spatula yoda(spatula a, spatula b);          // Modulus operation (remainder)
// More functions coming in future versions!
```

## 📁 File Management & Imports

### Hat Files (.hat)

Hat files are YankoviC's library format.

```yankovic
// my_utilities.hat
on_the_menu verse make_joke(verse setup) {
    verse punchline = setup + "... NOT!";
    twinkie_wiener_sandwich punchline;
}

private_stash spatula secret_number() {
    twinkie_wiener_sandwich 42; // Only visible within this file
}
```

### Import Syntax

```yankovic
#eat <UHF.hat>                    // Built-in library
#eat "lib/my_utilities.hat"       // Custom library from the projects folder
#eat "./helpers/math_stuff.hat"   // Relative path
```

### Visibility Modifiers

- `on_the_menu` - Public functions (exported)
- `private_stash` - Private functions (internal only)

```yankovic
// In a .hat file:
on_the_menu verse public_function() {
    twinkie_wiener_sandwich "Everyone can use this!";
}

private_stash verse internal_helper() {
    twinkie_wiener_sandwich "Only this file can use this";
}
```

## 🏢 The Accordion IDE

The **Accordion IDE** provides a complete development environment for YankoviC programming.

### File Explorer ("Filing Cabinet")

- 📁 **Create folders**: Right-click → "New Folder"
- 📄 **Create files**: Right-click → "New File" 
- 🗑️ **Delete items**: Click the delete button (with confirmation)
- 🔄 **Refresh**: Auto-refreshes when files change
- 📂 **Browse projects**: Navigate through your YankoviC projects

### Code Editor

- **Syntax highlighting** for YankoviC keywords
- **Auto-save** functionality
- **Error highlighting** for syntax issues
- **Multi-file editing** with tabs

### Console

- **Program output** from `perform_a_parody()` calls
- **Error messages** with helpful details
- **Execution status** with exit codes
- **Interactive feedback** for running programs

### AI Assistant

- **Code help** and suggestions
- **Tab Autocomplete** using pollinations, so you can code with ease
- **Syntax explanations** 
- **Debugging assistance** with the Al-manac
- **Best practices** recommendations

## 🎨 Graphics Programming with UHF

UHF (Ultra High Frequency) is YankoviC's graphics library, inspired by Weird Al's movie "UHF". Here's a complete graphics program:

```yankovic
#eat <UHF.hat>

spatula want_a_new_duck() {
    // Create a window
    start_the_show(800, 600, "Weird Al's Graphic Adventure");
    set_polka_speed(30); // 30 FPS
    
    spatula frame_count = 0;
    
    polka (!the_shows_over()) {
        roll_the_camera();
        
        // Animated background
        paint_the_set(TWINKIE_GOLD);
        
        // Draw spinning cheese wheels
        spatula angle = frame_count * 5;
        spatula center_x = 400;
        spatula center_y = 300;
        
        hardware_store (spatula i = 0; i < 8; i = i + 1) {
            spatula x = center_x + cos(angle + i * 45) * 150;
            spatula y = center_y + sin(angle + i * 45) * 150;
            
            pick_a_hawaiian_shirt(ORANGE_CHEESE);
            draw_a_big_ol_wheel_of_cheese(x, y, 30);
        }
        
        frame_count = frame_count + 1;
        that_is_a_wrap();
    }
    
    twinkie_wiener_sandwich 27;
}
```

## 📖 Example Programs

### Dare To Be Stupid

```yankovic
spatula want_a_new_duck() {
    perform_a_parody("Hello, Weird World!\\n\\nDare to be stupid!");
    twinkie_wiener_sandwich 27;
}
```

### Random Number Generator

```yankovic
#eat "lib/random_helpers.hat"

spatula want_a_new_duck() {
    verse numbers = generate_random_list(5, 1, 100);
    perform_a_parody("Random numbers: %verse\\n", numbers);
    twinkie_wiener_sandwich 27;
}
```

### Graphics Animation

```yankovic
#eat <UHF.hat>

spatula want_a_new_duck() {
    start_the_show(400, 300, "Polka Dots");
    set_polka_speed(60);
    
    spatula dot_x = 200;
    spatula dot_y = 150;
    
    polka (!the_shows_over()) {
        roll_the_camera();
        paint_the_set(SKY_BLUE_FOR_YOU);
        
        pick_a_hawaiian_shirt(YELLOW_MUSTARD);
        draw_a_big_ol_wheel_of_cheese(dot_x, dot_y, 25);
        
        // Move the dot randomly
        dot_x = dot_x + (random_spatula() % 21) - 10;
        dot_y = dot_y + (random_spatula() % 21) - 10;
        
        // Keep dot on screen
        jeopardy (dot_x < 25) dot_x = 25;
        jeopardy (dot_x > 375) dot_x = 375;
        jeopardy (dot_y < 25) dot_y = 25;
        jeopardy (dot_y > 275) dot_y = 275;
        
        that_is_a_wrap();
    }
    
    twinkie_wiener_sandwich 27;
}
```
