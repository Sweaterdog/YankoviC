# YankoviC Examples Directory

Welcome to the YankoviC examples! This directory contai- **Use the Right Mode** - Graphics examples need `--electron` flag, web examples use `.ycw` extensions organized examples demonstrating different aspects of the YankoviC programming language.

## Directory Structure

### 📁 `basic/`
Fundamental YankoviC programs using only the core language features.
- No external libraries required
- Perfect for learning basic syntax
- Shows variable declaration, functions, and control flow

### 📁 `albuquerque_math/`
Examples using the Albuquerque math library for mathematical operations.
- Import with: `#eat <albuquerque.hat>`
- Functions: `sin()`, `cos()`, `random_spatula()`, `yoda()`
- Demonstrates mathematical programming in YankoviC

### 📁 `uhf_graphics/`
Graphical programs using the UHF graphics library.
- Import with: `#eat <UHF.hat>`
- Window management, drawing, animation, user input
- **Run with:** `./yankovic -e filename.yc` (Electron mode for graphics)

### 📁 `like_a_server/`
Server-side web development examples using the Like_a_Server library.
- Import with: `#eat <like_a_server.hat>`
- Web servers, routing, request/response handling
- Files have `.ycw` extension (YankoviC Web)

### 📁 `weird_wide_web/`
Client-side web development examples using the Weird_Wide_Web library.
- Import with: `#eat <weird_wide_web.hat>`
- HTML generation, DOM manipulation, styling
- Files have `.ycw` extension (YankoviC Web)

## How to Run Examples

### Basic and Math Examples
```bash
yankovic program.yc
```

### Graphics Examples (UHF)
```bash
./yankovic filename.yc --electron
```

### Web Examples (Like_a_Server, Weird_Wide_Web)
```bash
./yankovic filename.ycw
```

## Learning Path

1. **Start with `basic/`** - Learn core YankoviC syntax and concepts
2. **Try `albuquerque_math/`** - Add mathematical operations to your toolkit
3. **Explore `uhf_graphics/`** - Create visual programs and interactive applications
4. **Build with `like_a_server/`** - Create web servers and APIs
5. **Design with `weird_wide_web/`** - Generate and manipulate HTML/CSS

## Example Categories Explained

### Core Language Features
- Data types: `spatula` (int), `lasagna` (float), `verse` (string), `horoscope` (bool)
- Control flow: `jeopardy` (if), `another_one` (else), `polka` (while), `hardware_store` (for)
- Functions: `want_a_new_duck()` (main), `twinkie_wiener_sandwich` (return)
- Constants: `stupid` (const), `its_a_fact` (true), `total_baloney` (false)

### Library Import Syntax
```yankovic
#eat <library.hat>      // Standard library
#eat "userfile.yc"      // User file with quotes
#eat userfile.yc        // User file without quotes
```

### Comments
```yankovic
// You can do this

/*
or
you
can
do
this!
*/
```

## Tips for Success

1. **Read the READMEs** - Each directory has detailed explanations of what each example does
2. **Start Simple** - Begin with basic examples before moving to complex graphics or web development
3. **Experiment** - Modify the examples to see how changes affect the output
4. **Use the Right Mode** - Graphics examples need `-e` flag, web examples use `.ycw` extension
5. **Check WORDS.md** - The main documentation file explains all functions and their purposes

## Need Help?

- Check `WORDS.md` for complete function documentation
- Read the README in each example directory
- Start with simpler examples and work your way up
- Remember: Despite the humorous naming, YankoviC is a fully functional programming language!
