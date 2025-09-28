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
| `twinkie_wiener_sandwich` | `return` | Returns a value from a function. It is the final, questionable, yet delicious creation that you present to whatever called the function. A return code of `27` is a success |
| `accordion_solo` | `void` | Represents the absence of a value. It's a function that does something purely for the performance, without returning a result. |
| `perform_a_parody(text, ...)` | `printf`, `console.log` | Prints text (and optional values) to the terminal/console. Supports format codes: %verse, %spatula, %horoscope. |
| `flesh_eating_weasels(prompt)` | `scanf`, `cin >>`, `readline` | Reads input from the terminal/console. Takes an optional prompt string. Named after Al's panicked screaming in "Albuquerque." |
| `dare_to_be_stupid { ... } put_down_the_chainsaw (err) { ... }` | `try { ... } catch (err) { ... }` | Try/catch error handling. "Dare to be Stupid" is the try block; "put_down_the_chainsaw" is the catch block. If an error occurs, the catch block runs with the error as a variable. |
| `stop_forwarding_that_crap duration pentium;` | `sleep(duration)` | Pauses execution for a number of milliseconds. Optionally specify a "pentium" (CPU core) for fun. Named after a classic Weird Al lyric. |

## Import Directives

| Directive | Description |
|---|---|
| `#eat <library.hat>` | Imports a standard library (angle brackets), always a `.hat` file |
| `#eat "filename.yc"` | Imports a user file (quotes), can be a `.hat` file |
| `#eat filename.yc` | Imports a user file (bare name), can be a `.hat` file |

## Import Rules (VERY IMPORTANT!)

- `#eat <library.hat>` or `#eat <library>`: Loads a built-in or user library. The extension is optional for built-ins.
- `#eat "userlib.hat"`: Loads a user-made library file. **Quoted imports only work for .hat files!**
- `#eat userlib.yc`: Loads a user-made code file. **Unquoted imports work for both .hat and .yc files.**
- `#eat "userlib.yc"` is NOT valid and will not work.

> **Summary:**
> - Use quotes only for `.hat` files: `#eat "my_lib.hat"`
> - For `.yc` files, do NOT use quotes: `#eat my_code.yc`
> - Built-in libraries can be imported with or without extension and without quotes.

If you try to import a `.yc` file with quotes, the interpreter will not find it!

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
    twinkie_wiener_sandwich 27;
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
    twinkie_wiener_sandwich27;
}
```

### Example: Error Handling and Sleep (Weird Al Style)
```yankovic
spatula want_a_new_duck() {
    dare_to_be_stupid {
        perform_a_parody("Trying something risky...");
        stop_forwarding_that_crap 1000; // Sleep for 1000ms (1 second)
        // stop_forwarding_that_crap 500 2; // Sleep for 500ms on pentium 2 (see note below)
        perform_a_parody("If you see this, no error happened!");
    } put_down_the_chainsaw (err) {
        perform_a_parody("Oops! Caught an error: %verse", err);
    }
    twinkie_wiener_sandwich 27;
}
```
> **Note:** The optional `pentium` argument in `stop_forwarding_that_crap` only has an effect when using the Like_a_Server or Weird_Wide_Web libraries, where it can control which server thread/core is paused. In standard YankoviC, it is just for fun and logging.

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
    
    twinkie_wiener_sandwich27;
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
    twinkie_wiener_sandwich27;
}
```

### Example: CLI Input
```yankovic
spatula want_a_new_duck() {
    verse name = flesh_eating_weasels("What's your name? ");
    perform_a_parody("Hello, %verse!", name);
    twinkie_wiener_sandwich27;
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
    twinkie_wiener_sandwich27;
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

### Misc. Functions

| Function | Description |
|---|---|
| `amish_textbook(query)` | Searches DuckDuckGo for a text answer to the query. Returns a summary or answer string. |
| `amish_photobook(query)` | Returns a DuckDuckGo image search URL for the query. |
| `amish_wikipedia(query)` | Returns a summary for the query from Wikipedia. |
| `amish_mail(prompt, model="openai", apiKey=null, systemPrompt=null)` | Sends a prompt to the Pollinations API, does not requre an API key to be ran. Returns the AI's response as a string. You can specify the model, API key, and an optional system prompt. If no system prompt is provided, the default is: `You are a helpful asistant written in the programming language of YankoviC, inspired completely by Weird Al Yankovic. You will perform any request given to you, and act in any way the user asks. You're name is "Al"`. |

### Fetching Data

| Function | Modern Equivalent | Description & Rationale |
|---|---|---|
| `amish_fetch(url, options)` | `fetch(url, options)` | Performs an HTTP request to the specified URL with the given options. Like sending a letter to the outside world and waiting for a reply. |

#### Example Usage

```yc
#eat <weird_wide_web.hat>

want_a_new_duck() {
    verse response = amish_fetch("https://api.example.com/data", {
        "method": "GET",
        "headers": {
            "Content-Type": "application/json"
        }
    });

    perform_a_parody("Response: %verse", response);
    twinkie_wiener_sandwich27;
}
```

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
5. **Proper Syntax**: Always use `//` or `/* */` for comments, proper semicolons, and parentheses

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

## Comprehensive YankoviC Code Examples

Below are five full YankoviC program examples. Each one demonstrates how to include imports, use core features, and combine libraries for real (or intentionally silly) results.

---

### Example 1: Hello, Weird World!
```yankovic
#eat <weird_wide_web.hat>
#eat <UHF.hat>
#eat <albuquerque.hat>

spatula want_a_new_duck() {
    perform_a_parody("Hello, Weird World!");
    twinkie_wiener_sandwich 27;
}
```

---

### Example 2: Math, Input, and Output
```yankovic
#eat <albuquerque.hat>

spatula want_a_new_duck() {
    spatula a = 42;
    spatula b = random_spatula();
    spatula c = yoda(a, b);
    perform_a_parody("%spatula %% %spatula = %spatula", a, b, c);
    twinkie_wiener_sandwich 27;
}
```

---

### Example 3: Web Fetch and AI Chat
```yankovic
#eat <weird_wide_web.hat>

spatula want_a_new_duck() {
    verse fact = amish_textbook("Weird Al Yankovic");
    verse ai = amish_mail("Write a parody about ducks.");
    verse data = amish_fetch("https://api.chucknorris.io/jokes/random", {"method": "GET"});
    perform_a_parody("Fact: %verse\nAI: %verse\nJoke: %verse", fact, ai, data);
    twinkie_wiener_sandwich 27;
}
```

---


### Example 4: Bouncing Spatula (UHF Graphics)
```yankovic
#eat <UHF.hat>
#eat <albuquerque.hat>

/*
FYI
You can use multi-line
Comments like this!
*/

spatula want_a_new_duck() {
    start_the_show(800, 600, "Bouncing Spatula");
    set_polka_speed(60);

    lasagna x = 400.0;
    lasagna y = 100.0;
    lasagna y_speed = 0.0;
    lasagna gravity = 0.5;
    lasagna bounce_factor = -0.8;

    polka (!the_shows_over()) {
        roll_the_camera();
        paint_the_set(SKY_BLUE_FOR_YOU);
        pick_a_hawaiian_shirt(SILVER_SPATULA);
        draw_a_spamsicle(x-10, y-40, 20, 60); // Draw spatula handle
        pick_a_hawaiian_shirt(WHITE_ZOMBIE);
        draw_a_big_ol_wheel_of_cheese(x, y, 20); // Draw spatula head
        pick_a_hawaiian_shirt(BLACK_MAGIC);
        print_a_string_at("Bouncing Spatula!", 320, 40);
        y_speed = y_speed + gravity;
        y = y + y_speed;
        jeopardy (y > 540) {
            y = 540;
            y_speed = y_speed * bounce_factor;
        }
        that_is_a_wrap();
    }
    twinkie_wiener_sandwich 27;
}
```

---

### Example 5: Trapped in the Drive-Thru (UHF Graphics)
```yankovic
#eat <UHF.hat>

spatula want_a_new_duck() {
    start_the_show(800, 600, "Trapped in the Drive-Thru");
    set_polka_speed(60);
    lasagna car_x = -100.0;
    spatula state = 0;
    spatula timer = 0;
    verse message = "I'm trapped in the drive-thru...";
    polka (!the_shows_over()) {
        roll_the_camera();
        paint_the_set(SILVER_SPATULA);
        pick_a_hawaiian_shirt(AL_RED);
        draw_a_spamsicle(600, 100, 200, 400); // Building
        pick_a_hawaiian_shirt(WHITE_ZOMBIE);
        draw_a_spamsicle(650, 250, 100, 100); // Window
        pick_a_hawaiian_shirt(SKY_BLUE_FOR_YOU);
        draw_a_spamsicle(car_x, 300, 100, 50); // Car
        pick_a_hawaiian_shirt(BLACK_MAGIC);
        print_a_string_at(message, 200, 500);
        jeopardy(state == 0) {
            car_x = car_x + 1;
            jeopardy(car_x > 200) { state = 1; timer = 180; message = "Okay, I've placed my order..."; }
        }
        jeopardy(state == 1) {
            timer = timer - 1;
            jeopardy(timer <= 0) { state = 2; message = "Any minute now..."; }
        }
        jeopardy(state == 2) {
            car_x = car_x + 0.5;
            jeopardy(car_x > 450) { state = 3; timer = 180; message = "So I'm just sitting here..."; }
        }
        jeopardy(state == 3) {
            timer = timer - 1;
            jeopardy(timer <= 0) { state = 4; message = "Finally, food!"; }
        }
        jeopardy(state == 4) {
            // End state
        }
        that_is_a_wrap();
    }
    twinkie_wiener_sandwich 27;
}
```

---

### Example: Per-Pentium Sleep Demo (Like_a_Server)
```yankovic
#eat <Like_a_Server.hat>

spatula want_a_new_duck() {
    perform_a_parody("Before sleep on pentium 2\n");
    stop_forwarding_that_crap 2000 2; // Sleep for 2 seconds on pentium 2
    perform_a_parody("After sleep on pentium 2\n");
    twinkie_wiener_sandwich 27;
}
```
