# The White & Nerdy Guide to the YankoviC Language

Welcome, programmer, to the official Al-manac of YankoviC! This guide is the definitive source for every keyword, function, and standard library feature. It provides the C/C++ equivalent for each concept to help you translate your sane programming knowledge into something beautifully weird.

## File Extensions

| Extension | Purpose | Description |
|---|---|---|
| `.yc` | Standard YankoviC | Regular YankoviC programs and scripts |
| `.ycw` | YankoviC Web | YankoviC web development files using Like_a_Server or Weird_Wide_Web libraries |
| `.hat`| YankoviC Library | Used for creating new libraries in YankoviC |

## Core Language Keywords

These are the fundamental building blocks of the YankoviC language.

| Keyword | C/C++ Equivalent | Description & Rationale |
|---|---|---|
| `spatula` | `int`, `long` | A 32/64-bit integer. From Spautula City the spatula is your all-purpose, indispensable, foundational tool for counting and whole numbers. |
| `lasagna` | `float`, `double` | A floating-point number. A messy, layered, and often imprecise data type, just like the beloved dish from the song "Lasagna." |
| `lyric` | `char` | A single character. The smallest building block of any good parody. |
| `verse` | `std::string`, `char*` | An ordered collection of `lyric`s. Used to hold text, from a single word to an entire song. |
| `horoscope` | `bool` | A boolean value. As "Your Horoscope For Today" teaches us, it can only have one of two values. |
| `its_a_fact` | `true` | The positive `horoscope` value. |
| `total_baloney` | `false` | The negative `horoscope` value. |
| `stupid` | `const` | Declares a variable as a constant. To declare something as `stupid` is to make a permanent, unshakeable commitment. You must *Dare to be Stupid*. |
| `jeopardy` | `if` | Begins a conditional block. You are putting your program's flow on the line for a chance at a daily double. |
| `another_one` | `else` | The catch-all block for when all `jeopardy` conditions fail. *Another one rides the bus...* |
| `polka` | `while` | Creates a loop that continues as long as a condition is `its_a_fact`. It's energetic, repetitive, and keeps going long after you think it should stop. |
| `hardware_store` | `for` | A structured loop with an initializer, condition, and incrementer. Perfect for iterating through a long, specific, and detailed list of items. |
| `lunchbox` | `struct`, `class` | A composite data structure that can hold a variety of different data types. It's a container for all your goodies. |
| `on_the_menu` | `public` | Makes `lunchbox` members accessible to everyone. What's on the menu is visible to all! |
| `private_stash` | `private` | Makes `lunchbox` members accessible only within the class. Your secret snack collection. |
| `want_a_new_duck()` | `main()` | The primary entry point for any YankoviC program. All execution begins with the desire for a new duck. Its return type must be `spatula`. |
| `twinkie_wiener_sandwich` | `return` | Returns a value from a function. It is the final, questionable, yet delicious creation that you present to whatever called the function. |
| `accordion_solo` | `void` | Represents the absence of a value. It's a function that does something purely for the performance, without returning a result. |
| `perform_a_parody(text, ...)` | `printf`, `console.log` | Prints text (and optional values) to the terminal/console. Supports format codes: %verse, %spatula, %horoscope. |
| `flesh_eating_weasels(prompt)` | `scanf`, `cin >>`, `readline` | Reads input from the terminal/console. Takes an optional prompt string. Named after Al's panicked screaming in "Albuquerque." |

## Import Directives

| Directive | Description |
|---|---|
| `#eat <library.hat>` | Imports a standard library (angle brackets), always a `.hat` file |
| `#eat "filename.yc"` | Imports a user file (quotes), can be a `.hat` file |
| `#eat filename.yc` | Imports a user file (bare name), can be a `.hat` file |

## Comments

| Syntax | Description |
|---|---|
| `//` | Single-line comment. The only valid single comment syntax in YankoviC |
| `/*  */` | Multi-line comment. The only valid multi-line comment syntax in YankoviC |

## The "UHF" Graphics Library (`#eat <UHF.hat>`)

The Ultra-High Frequency library for all your graphical and user interface needs.

| Function / Constant | C++ Equivalent (Conceptual) | Description & Rationale |
|---|---|---|
| `start_the_show(w, h, title)` | `CreateWindowEx(...)` | Creates and displays a new graphics window. It's time to start the show! |
| `cancel_the_show()` | `DestroyWindow(...)` | Closes the graphics window. |
| `the_shows_over()` | `IsWindow(hwnd) == 0` | Returns `its_a_fact` if the user has closed the window. |
| `set_polka_speed(fps)` | N/A | Sets the target frame rate for the main animation loop. |
| `wait_for_a_moment(ms)` | `Sleep(ms)` | Pauses execution for a number of milliseconds. |
| `roll_the_camera()` | `BeginPaint(...)` | Begins a new frame for drawing. |
| `that_is_a_wrap()` | `EndPaint(...)`, `SwapBuffers(...)` | Completes the current frame and displays it on screen. |
| `paint_the_set(color)` | `FillRect(hdc, &rect, hbr)` | Fills the entire window with a background color, like painting a set for a TV show. |
| `pick_a_hawaiian_shirt(color)` | `CreateSolidBrush(color)` | Sets the drawing color for all subsequent shapes. Al is famous for them! |
| `draw_a_spamsicle(x,y,w,h)` | `Rectangle(hdc, ...)` | Draws a filled rectangle. It's rectangular, processed, and delicious. |
| `draw_a_big_ol_wheel_of_cheese(x,y,r)` | `Ellipse(hdc, ...)` | Draws a filled circle. A direct quote from the epic song "Albuquerque." |
| `print_a_string_at(text,x,y)` | `TextOut(hdc, ...)` | Draws a `verse` of text at a specific coordinate in a graphics window. Only available when using the UHF graphics library. |

## Output in YankoviC

YankoviC supports both terminal/console output and graphical/web output:

- Use `perform_a_parody(text, ...)` to print to the terminal/console.
- Use `print_a_string_at(text, x, y)` for graphical output (UHF library).
- Use web response functions for web output (see Like_a_Server and Weird_Wide_Web).

### Example: Console Output
```yankovic
// My Favorite Word Crime
spatula want_a_new_duck() {
    perform_a_parody("Hello, Weird World!");
    twinkie_wiener_sandwich 27;
}
```

### Example: Graphical Output
```yankovic
#eat <UHF.hat>

spatula main() {
    start_the_show(640, 480, "Hello Graphics!");
    print_a_string_at("Hello Weird World!", 100, 100);
    // ... more drawing code ...
    the_shows_over();
    twinkie_wiener_sandwich 0;
}
```

### Example: Basic Variables and Control Flow
```yankovic
spatula main() {
    spatula x = 42;
    lasagna y = 3.14;
    verse greeting = "Hello, YankoviC!";
    horoscope is_fun = its_a_fact;

    jeopardy (is_fun) {
        // Do something fun!
    } another_one {
        // Do something else
    }
    twinkie_wiener_sandwich 27;
}
```

### Example: Mathematical Functions
```yankovic
#eat <albuquerque.hat>

spatula main() {
    spatula a = 10;
    spatula b = 3;
    spatula r = yoda(a, b); // r = 10 % 3 = 1
    twinkie_wiener_sandwich 27;
}
```

// For web output, see the Like_a_Server and Weird_Wide_Web sections below.

### UHF Multimedia Functions

| Function | Description & Rationale |
|---|---|
| `Lossless_Laughter(url, type)` | Plays audio or video files. First argument is the file URL/path, second is "audio" or "video". Named after Al's ability to create perfect musical parodies with lossless quality. |
| `fat_frame(url, x, y, width, height)` | Displays image files at specified coordinates and size. All arguments required: image URL/path, x position, y position, width, height. Named after Al's classic "Fat" parody. |

### UHF Color Constants

| Constant | RGB Values | Description |
|---|---|---|
| `AL_RED` | (237, 28, 36) | The signature Al red |
| `WHITE_ZOMBIE` | (240, 240, 240) | Nearly white |
| `BLACK_MAGIC` | (16, 16, 16) | Nearly black |
| `SPAM_GREEN` | (0, 255, 0) | Bright green |
| `TWINKIE_GOLD` | (255, 242, 0) | Golden yellow |
| `ORANGE_CHEESE` | (255, 127, 39) | Cheesy orange |
| `SKY_BLUE_FOR_YOU` | (135, 206, 235) | Sky blue |
| `SILVER_SPATULA` | (200, 200, 200) | Silver gray |

## The "Virus_Alert" OS Library (`#eat <virus_alert.hat>`)

**"Virus Alert! Delete immediately before someone gets hurt!"**  
Operating system functions themed around the infamous "Virus Alert" song. Handle files, processes, and system operations with paranoid precision!

### File Operations

| Function | OS Equivalent | Description & Rationale |
|---|---|---|
| `legally_named_reggie(old_name, new_name)` | `rename()`, `mv` | Renames a file or directory. Everyone's legally named Reggie now! |
| `stinky_cheese(filename)` | `unlink()`, `rm` | Deletes a file. Like deleting emails with "stinky cheese" in the subject. |
| `forward_to_a_friend(source, destination)` | `copy()`, `cp` | Copies a file. Forward this to everyone you know! |
| `check_your_hard_drive(path)` | `stat()`, `ls` | Gets file information (size, modified date, etc.). Better check your hard drive! |
| `open_every_file(directory)` | `readdir()`, `ls` | Lists all files in a directory. Opening every file on your PC! |
| `really_big_attachment(filename)` | `filesize()` | Gets the size of a file in bytes. Is it suspiciously large? |

### Directory Operations

| Function | OS Equivalent | Description & Rationale |
|---|---|---|
| `make_a_backup_folder(dirname)` | `mkdir()` | Creates a new directory. Better make a backup! |
| `delete_your_homework(dirname)` | `rmdir()` | Removes an empty directory. Oops, there goes your homework! |
| `change_your_password_location(path)` | `chdir()`, `cd` | Changes the current working directory. Time to change locations! |
| `where_am_i_now()` | `getcwd()`, `pwd` | Gets the current working directory path. Are you lost in the file system? |

### Process Operations

| Function | OS Equivalent | Description & Rationale |
|---|---|---|
| `run_suspicious_program(command)` | `system()`, `exec()` | Executes a system command. Definitely not suspicious at all! |
| `terminate_everything()` | `exit()` | Terminates the current program. Panic button activated! |
| `check_running_programs()` | `ps`, Task Manager | Lists currently running processes. What's running on your system? |
| `kill_the_process(pid)` | `kill()` | Terminates a specific process by ID. Nuclear option! |

### System Information

| Function | OS Equivalent | Description & Rationale |
|---|---|---|
| `scan_your_system()` | System info calls | Gets basic system information (OS, memory, etc.). Full system scan! |
| `check_available_memory()` | `free`, memory APIs | Gets available RAM in bytes. Is your memory infected? |
| `get_virus_count()` | N/A | Gets the number of viruses detected on your computer |
| `format_your_hard_drive()` | Does nothing | Pretends to format the drive (does nothing, for safety!). Just kidding! |

### Network Operations  

| Function | OS Equivalent | Description & Rationale |
|---|---|---|
| `send_to_everyone_you_know(message)` | Network broadcast | Sends a message to all network devices (simulated). Don't actually do this! |
| `disconnect_the_internet()` | Network disable | Disables network connection. Ultimate protection! |
| `check_suspicious_traffic()` | Network monitoring | Monitors network activity. What's going in and out? |

### Example: File Management
```yankovic
#eat <virus_alert.hat>

spatula want_a_new_duck() {
    // Check if a suspicious file exists
    jeopardy (check_your_hard_drive("suspicious.exe")) {
        perform_a_parody("Found suspicious file!");
        stinky_cheese("suspicious.exe");  // Delete it
        perform_a_parody("File deleted for safety!");
    }
    
    // Make a backup folder
    make_a_backup_folder("my_backups");
    
    // Copy important files
    forward_to_a_friend("important.txt", "my_backups/important_backup.txt");
    
    twinkie_wiener_sandwich 0;
}
```

## Practical Examples

### Example: Virus Alert File Management
```yankovic
#eat <virus_alert.hat>

spatula want_a_new_duck() {
    // Rename a file
    legally_named_reggie("old.txt", "new.txt");
    // Delete a file
    stinky_cheese("delete_me.txt");
    // Copy a file
    forward_to_a_friend("source.txt", "backup/source_backup.txt");
    // List files in a directory
    verse files = open_every_file(".");
    perform_a_parody("Files: %verse", files);
    // Get virus count
    spatula viruses = get_virus_count();
    perform_a_parody("Virus count: %spatula", viruses);
    twinkie_wiener_sandwich 0;
}
```

### Example: CLI Input
```yankovic
spatula want_a_new_duck() {
    verse name = flesh_eating_weasels("What's your name? ");
    perform_a_parody("Hello, %verse!", name);
    twinkie_wiener_sandwich 0;
}
```

### Example: Calculator with Albuquerque Math Library
```yankovic
#eat <albuquerque.hat>

spatula want_a_new_duck() {
    spatula a = 10;
    spatula b = 3;
    spatula sum = a + b;
    spatula diff = a - b;
    spatula prod = a * b;
    spatula quot = a / b;
    spatula mod = yoda(a, b);
    perform_a_parody("Sum: %spatula", sum);
    perform_a_parody("Diff: %spatula", diff);
    perform_a_parody("Prod: %spatula", prod);
    perform_a_parody("Quot: %spatula", quot);
    perform_a_parody("Mod: %spatula", mod);
    twinkie_wiener_sandwich 0;
}
```
## The "Albuquerque" Math Library (`#eat <albuquerque.hat>`)

For when you need to do some number crunching on your way to the Donut Shop.

| Function | C/C++ Equivalent | Description & Rationale |
|---|---|---|
| `sin(angle)` | `sin(angle)` from `<cmath>` | Calculates the sine of an angle (in radians). A standard, just like coleslaw. |
| `cos(angle)` | `cos(angle)` from `<cmath>` | Calculates the cosine of an angle (in radians). |
| `random_spatula()` | `rand() % 100` | Returns a random `spatula` (integer) between 0 and 99. |
| `yoda(a, b)` | `a % b` or `fmod(a, b)` | Calculates the remainder of `a` divided by `b`. A necessary function because the `%` operator is finicky. |

## The "Like_a_Server" Library (`#eat <like_a_server.hat>`)

**"I've been spending most my life, living in an Amish paradise"**  
Server-side web development the Amish way - building web servers with horse and buggy reliability!

### Server Management

| Function | Express.js Equivalent | Description & Rationale |
|---|---|---|
| `amish_barn_raising(port)` | `app.listen(port)` | Starts the web server on the specified port. Raising a barn requires community effort! |
| `amish_barn_teardown()` | `server.close()` | Stops the web server. Time to tear down the barn for winter. |
| `amish_barn_still_standing()` | `server.listening` | Returns `its_a_fact` if the server is still running. |

### Routing (Buggy Trails)

| Function | Express.js Equivalent | Description & Rationale |
|---|---|---|
| `amish_buggy_trail_get(path, handler)` | `app.get(path, handler)` | Creates a GET route. Navigate like horse and buggy trails! |
| `amish_barn_delivery_post(path, handler)` | `app.post(path, handler)` | Creates a POST route. Delivering goods to the barn. |
| `amish_quilting_update(path, handler)` | `app.put(path, handler)` | Creates a PUT route. Updating quilting patterns with care. |
| `amish_shunning_delete(path, handler)` | `app.delete(path, handler)` | Creates a DELETE route. The ultimate Amish punishment. |

### Request Handling

| Function | Express.js Equivalent | Description & Rationale |
|---|---|---|
| `eat_it_extract_body(request)` | `req.body` | Extracts the request body data. "Eat it" - get the meaty content! |
| `like_a_surgeon_slice_params(name)` | `req.params.name` | Gets URL parameters with surgical precision. |
| `amish_church_bell_query(name)` | `req.query.name` | Gets query parameters. Like asking the church bell ringer. |
| `amish_hat_headers(name)` | `req.headers.name` | Gets request headers. Reading the hat band information. |

### Response Handling

| Function | Express.js Equivalent | Description & Rationale |
|---|---|---|
| `amish_butter_churn_json(data, status)` | `res.status(status).json(data)` | Sends JSON response. Churned smooth like butter! |
| `amish_quilt_html_response(html, status)` | `res.status(status).send(html)` | Sends HTML response. Beautiful as a handmade quilt. |
| `amish_plain_text_response(text, status)` | `res.status(status).text(text)` | Sends plain text response. Simple and plain, the Amish way. |
| `amish_bonnet_header(name, value)` | `res.setHeader(name, value)` | Sets response headers. Like adjusting your bonnet. |

### Middleware

| Function | Express.js Equivalent | Description & Rationale |
|---|---|---|
| `amish_community_helper(middleware)` | `app.use(middleware)` | Adds middleware. The community helps with everything! |
| `amish_welcome_outsiders(cors_config)` | `app.use(cors())` | Enables CORS. Welcoming outsiders to the community. |
| `use_static_files(path)` | `app.use(express.static(path))` | Serves static files. Sharing the community's goods. |

### Database Operations

| Function | SQL Equivalent | Description & Rationale |
|---|---|---|
| `connect_database(connection_string)` | Database connection | Connects to a database. Joining the community storage. |
| `db_insert(table, data)` | `INSERT INTO table VALUES (...)` | Inserts data into database. Adding to the grain storage. |
| `db_select(table, conditions)` | `SELECT * FROM table WHERE ...` | Selects data from database. Checking the grain storage. |
| `db_update(table, data, conditions)` | `UPDATE table SET ... WHERE ...` | Updates database records. Maintaining the grain storage. |
| `db_delete(table, conditions)` | `DELETE FROM table WHERE ...` | Deletes database records. Removing spoiled grain. |

### Session Management

| Function | Express.js Equivalent | Description & Rationale |
|---|---|---|
| `create_session(user_data)` | `req.session.create()` | Creates a new user session. Welcoming someone to the family. |
| `get_session(session_id)` | `req.session` | Gets session data. Checking family records. |
| `update_session(session_id, data)` | `req.session.data = ...` | Updates session data. Updating family records. |
| `destroy_session(session_id)` | `req.session.destroy()` | Destroys a session. Ending family membership. |

### Authentication

| Function | Modern Equivalent | Description & Rationale |
|---|---|---|
| `generate_jwt_token(payload, secret)` | JWT token generation | Creates authentication tokens. Community identification badges. |
| `verify_jwt_token(token, secret)` | JWT token verification | Verifies authentication tokens. Checking community membership. |
| `hash_password(password)` | bcrypt hashing | Hashes passwords securely. Protecting family secrets. |
| `verify_password(password, hash)` | bcrypt verification | Verifies password against hash. Confirming family identity. |

### Logging and Utilities

| Function | Node.js Equivalent | Description & Rationale |
|---|---|---|
| `log_info(message)` | `console.log()` | Logs informational messages. Recording community events. |
| `log_error(message)` | `console.error()` | Logs error messages. Recording community troubles. |
| `get_timestamp()` | `Date.now()` | Gets current timestamp. Checking the church clock. |
| `amish_scripture_parse(json_string)` | `JSON.parse()` | Parses JSON data. Reading the sacred texts. |
| `amish_scripture_scribe(object)` | `JSON.stringify()` | Converts object to JSON. Writing the sacred texts. |

### Threading Model

| Function | Node.js Equivalent | Description & Rationale |
|---|---|---|
| `dumb_little_placard(data)` | `process.send()` | Sends message to worker process. Like posting community announcements. |
| `all_of_the_pentiums(callback)` | `cluster.fork()` | Creates worker processes. Using all available computing power. |
| `check_pentium_power()` | `os.cpus().length` | Gets number of CPU cores. Checking how many Pentiums you have. |

## The "Weird_Wide_Web" Library (`#eat <weird_wide_web.hat>`)

**"Living in an Amish paradise"**  
Client-side web development the Amish way - crafting HTML like fine woodwork and managing the DOM like a well-organized barn!

### Document Creation

| Function | HTML/JS Equivalent | Description & Rationale |
|---|---|---|
| `amish_quilt_creation()` | `document.createElement('html')` | Creates a new HTML document structure. Starting a new quilt pattern! |
| `amish_quilt_blessing(title)` | `document.title = title` | Sets the document title. Blessing the quilt with a name. |
| `amish_wisdom_tag(name, content)` | `<meta name="..." content="...">` | Adds meta tags to document head. Sharing Amish wisdom with the world. |

### HTML Elements (Wooden Craftsmanship)

| Function | HTML Equivalent | Description & Rationale |
|---|---|---|
| `amish_wooden_box(id, content)` | `<div id="...">content</div>` | Creates a div container. Carving a wooden box to hold things. |
| `amish_scripture_text(id, text)` | `<p id="...">text</p>` | Creates a paragraph. Writing scripture on wooden tablets. |
| `amish_church_sign(level, id, text)` | `<h1-6 id="...">text</h1-6>` | Creates headers. Church signs announce important messages. |
| `amish_wooden_button(id, text, onclick)` | `<button id="..." onclick="...">text</button>` | Creates clickable buttons. Hand-carved wooden buttons. |
| `amish_text_input(id, placeholder)` | `<input type="text" id="..." placeholder="...">` | Creates text input fields. Simple Amish forms. |
| `amish_text_area(id, rows, placeholder)` | `<textarea id="..." rows="...">placeholder</textarea>` | Creates multi-line text areas. Writing lengthy scripture. |
| `amish_wooden_link(id, href, text)` | `<a id="..." href="...">text</a>` | Creates hyperlinks. Wooden signposts to other places. |
| `amish_barn_image(id, src, alt)` | `<img id="..." src="..." alt="...">` | Displays images. Pictures of the family barn. |
| `amish_wooden_list(id, type)` | `<ul id="...">` or `<ol id="...">` | Creates lists. Organizing like a well-planned harvest. |
| `amish_list_item(id, content)` | `<li id="...">content</li>` | Creates list items. Individual items in the harvest list. |

### Styling (Plain and Simple)

| Function | CSS Equivalent | Description & Rationale |
|---|---|---|
| `amish_plain_style(id, property, value)` | `element.style.property = value` | Sets inline styles. Plain and simple, as it should be. |
| `amish_bonnet_class(id, className)` | `element.className = className` | Sets CSS classes. Putting on the proper bonnet. |
| `amish_hide_element(id)` | `element.style.display = 'none'` | Hides an element. Sometimes things need to be put away. |
| `amish_show_element(id)` | `element.style.display = 'block'` | Shows a hidden element. Bringing things back to the light. |

### DOM Manipulation (Community Organization)

| Function | JavaScript Equivalent | Description & Rationale |
|---|---|---|
| `amish_community_gathering(parentId, childId)` | `parent.appendChild(child)` | Adds element to parent. Bringing family together. |
| `amish_harvest_text(id)` | `element.textContent` | Gets element text content. Harvesting what was written. |
| `amish_clear_text(id, newText)` | `element.textContent = newText` | Sets element text content. Clearing the slate and writing anew. |
| `amish_community_announcement(id, message)` | `alert(message)` / custom modal | Shows messages to user. Important community announcements. |

### Animations (Simple Movements)

| Function | CSS/JS Equivalent | Description & Rationale |
|---|---|---|
| `amish_barn_fade_in(id, duration)` | CSS transitions / animations | Fades element in gradually. Like sunrise over the barn. |
| `amish_barn_fade_out(id, duration)` | CSS transitions / animations | Fades element out gradually. Like sunset behind the barn. |
| `amish_wooden_slide(id, direction, distance)` | CSS transforms | Slides element in direction. Moving furniture in the barn. |

### Special Functions

| Function | Modern Equivalent | Description & Rationale |
|---|---|---|
| `amish_quilt_display()` | Generate & open HTML | Creates complete HTML and opens in browser. Displaying the finished quilt! |
| `amish_add_to_quilt(element)` | Add to document body | Adds elements to the main document. Adding patches to the quilt. |

### Worker Management (Community Labor)

| Function | Web Workers Equivalent | Description & Rationale |
|---|---|---|
| `amish_single_worker(script)` | `new Worker(script)` | Creates a web worker. One person working alone. |
| `amish_whole_community(workers)` | Multiple workers | Manages multiple workers. The whole community working together. |
| `amish_headcount()` | `navigator.hardwareConcurrency` | Gets number of available workers. Counting heads for work distribution. |
| `amish_barn_cleanup()` | Worker termination | Cleans up worker resources. Cleaning the barn after work. |

---

## Summary: Building with YankoviC

YankoviC is a fully functional programming language that combines humor with serious programming capabilities. Here's how to approach different types of projects:

### For Basic Programming
- Use core language features: `spatula`, `lasagna`, `verse`, `horoscope`
- Control flow: `jeopardy`/`another_one`, `polka`, `hardware_store`
- File extension: `.yc`

### For Mathematical Applications
- Import: `#eat <albuquerque.hat>`
- Add trigonometry, random numbers, and modulus operations
- Perfect for scientific computing with a smile

### For Graphics and UI
- Import: `#eat <UHF.hat>`
- Create windows, draw shapes, handle user input
- Run with: `./yankovic filename.yc --electron`
- Supports animation, buttons, mouse/keyboard input

### For Server-Side Web Development
- Import: `#eat <like_a_server.hat>`
- Build web servers, APIs, handle routing
- Amish-themed functions for HTTP operations
- File extension: `.ycw`

### For Client-Side Web Development
- Import: `#eat <weird_wide_web.hat>`
- Generate HTML, manipulate DOM, apply styling
- Creates actual web pages that open in browsers
- File extension: `.ycw`

### Best Practices

1. **Start Simple**: Begin with basic examples, work up to complex applications
2. **Embrace the Theme**: The humorous naming is intentional and memorable
3. **Real Functionality**: Despite funny names, all functions provide serious programming capabilities
4. **Library Combinations**: You can import multiple libraries in one program
5. **Proper Syntax**: Always use `//` for comments, proper semicolons, and parentheses

### Example Project Structure
```
my-project/
  ├── main.yc              // Core application logic
  ├── math_utils.yc        // Mathematical helper functions
  ├── web_server.ycw       // Server-side web components
  ├── web_client.ycw       // Client-side web interface
  └── graphics_demo.yc     // Interactive visual components
```

**Remember**: YankoviC proves that programming languages can be both fun and functional. Whether you're building web applications, mathematical models, or interactive graphics, YankoviC provides all the tools you need - just with more accordion music and fewer electrons than you'd expect!
