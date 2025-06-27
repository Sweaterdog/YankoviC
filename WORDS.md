# The White & Nerdy Guide to the YankoviC Language

Welcome, programmer, to the official Al-manac of YankoviC! This guide is the definitive source for every keyword, function, and standard library feature. It provides the C/C++ equivalent for each concept to help you translate your sane programming knowledge into something beautifully weird.

## Core Language Keywords

These are the fundamental building blocks of the YankoviC language.

| Keyword | C/C++ Equivalent | Description & Rationale |
|---|---|---|
| `spatula` | `int`, `long` | A 32/64-bit integer. From "I Want a New Duck," the spatula is your all-purpose, indispensable, foundational tool for counting and whole numbers. |
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
| `want_a_new_duck()` | `main()` | The primary entry point for any YankoviC program. All execution begins with the desire for a new duck. Its return type must be `spatula`. |
| `twinkie_wiener_sandwich` | `return` | Returns a value from a function. It is the final, questionable, yet delicious creation that you present to whatever called the function. |
| `accordion_solo` | `void` | Represents the absence of a value. It's a function that does something purely for the performance, without returning a result. |

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
| `print_a_string_at(text,x,y)` | `TextOut(hdc, ...)` | Draws a `verse` of text at a specific coordinate. |
| `draw_a_button(...)` | `CreateWindow("BUTTON", ...)` | Draws a clickable button UI element. |
| `button_was_clicked(id)` | `(msg.message == WM_LBUTTONUP)` | Checks if a button with a specific ID has been clicked in the last frame. |
| `get_mouse_x()`, `get_mouse_y()` | `GET_X_LPARAM(lParam)` | Gets the current X or Y coordinate of the mouse cursor. |
| `mouse_was_clicked()` | `(msg.message == WM_LBUTTONDOWN)` | Checks if the mouse has been clicked anywhere in the window. |
| `AL_RED`, `WHITE_ZOMBIE`, etc. | `RGB(r,g,b)` | Pre-defined color constants stored as objects. |

## The "Albuquerque" Math Library (`#eat <albuquerque.hat>`)

For when you need to do some number crunching on your way to the Donut Shop.

| Function | C/C++ Equivalent | Description & Rationale |
|---|---|---|
| `sin(angle)` | `sin(angle)` from `<cmath>` | Calculates the sine of an angle (in radians). A standard, just like coleslaw. |
| `cos(angle)` | `cos(angle)` from `<cmath>` | Calculates the cosine of an angle (in radians). |
| `random_spatula()` | `rand() % 100` | Returns a random `spatula` (integer) between 0 and 99. |
| `polka_mod(a, b)` | `a % b` or `fmod(a, b)` | Calculates the remainder of `a` divided by `b`. A necessary function because the parser is a bit shy about the `%` operator. |
