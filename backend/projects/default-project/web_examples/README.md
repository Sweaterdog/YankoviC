# YankoviC Amish Paradise Web Development

*"I've been spending most my life, building webs in Amish paradise!"*

## Overview

YankoviC now includes a complete web development stack with an Amish theme (because it's hilariously ironic to build web technology using Amish terminology):

### Libraries
- **`like_a_server.hat`** - Server-side web development (Amish barn raising style)
- **`weird_wide_web.hat`** - Client-side web development (Amish quilting style)

### File Format
- **`.ycw`** - YankoviC Web files for web development projects

## How It Works

### 1. Client-Side Development (`.ycw` files)

Create web pages using Amish-themed functions:

```yankovic
#eat weird_wide_web.hat

# Create your web quilt
amish_quilt_creation "My Amish Paradise" "en"

# Add wooden elements
amish_wooden_box "container" ""
amish_church_sign 1 "title" "Welcome!"
amish_scripture_text "intro" "Plain and simple web design"

# Style with honest CSS
amish_plain_style "container" "background-color" "#f5f5dc"
amish_plain_style "title" "color" "#8B4513"

# Display the quilt
amish_quilt_display
```

### 2. Server-Side Development (`.ycw` files)

Create web servers using barn-raising terminology:

```yankovic
#eat like_a_server.hat

# Raise the barn (start server)
amish_barn_raising 3000

# Set up buggy trails (routes)
amish_buggy_trail_get "/" "home_page"
amish_barn_delivery_post "/contact" "handle_contact"

def home_page() {
    amish_quilt_html_response "<h1>Amish Paradise!</h1>" 200
}
```

### 3. Threading Models

Choose your processing power:
- **`dumb_little_placard`** - Single-threaded (like a simple wooden sign)
- **`all_of_the_pentiums`** - Multi-threaded ("All About the Pentiums" style!)

```yankovic
# Check community size
workers = amish_headcount

WHEN workers > 2 DO {
    all_of_the_pentiums "my_task" workers
} OR {
    dumb_little_placard "my_task"
}
```

## Key Functions

### Client-Side (weird_wide_web.hat)
- `amish_quilt_creation` - Create web page
- `amish_wooden_box` - Create div elements
- `amish_church_sign` - Create headings
- `amish_scripture_text` - Create paragraphs
- `amish_wooden_button` - Create buttons
- `amish_text_input` - Create input fields
- `amish_plain_style` - Add CSS styling
- `amish_community_gathering` - Add event listeners
- `amish_quilt_display` - Generate and display HTML

### Server-Side (like_a_server.hat)
- `amish_barn_raising` - Start server
- `amish_barn_teardown` - Stop server
- `amish_buggy_trail_get` - GET routes
- `amish_barn_delivery_post` - POST routes
- `amish_quilting_update` - PUT routes
- `amish_shunning_delete` - DELETE routes
- `amish_community_helper` - Add middleware
- `amish_butter_churn_json` - Send JSON response
- `amish_quilt_html_response` - Send HTML response

## Running Web Applications

### For Client-Side Apps:
```bash
yankovic your_web_quilt.ycw
# or
yankovic your_web_quilt.ycw --electron
```

The client-side apps will generate HTML and display it. In `--electron` mode, you'll see the rendered web page.

### For Server-Side Apps:
```bash
yankovic your_web_server.ycw
```

This will start a mock server (in the current implementation) that logs server activities and route handling.

## Examples

Check the `web_examples/` directory for:
- `simple_amish_quilt.ycw` - Basic client-side example
- `amish_web_server.ycw` - Server-side example
- `amish_web_quilt.ycw` - Advanced client-side example

## Philosophy

*"We don't use electricity, but somehow this works!"*

The Amish theme is intentionally ironic - building modern web technology using terminology from a community that traditionally avoids modern technology. It's pure Weird Al style: taking something serious (web development) and making it hilariously absurd while still being functional.

The threading terminology comes from "All About the Pentiums" - using `dumb_little_placard` for single-threaded work and `all_of_the_pentiums` for multi-threaded work.

Welcome to the most ironically themed web development framework ever created! 🎪
