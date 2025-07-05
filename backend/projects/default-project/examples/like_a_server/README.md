# Like_a_Server Library Examples

This directory contains server-side web development examples using the Like_a_Server library - building web servers the Amish way!

## Files

### `amish_web_server.ycw`
A complete web server example demonstrating routing, request handling, and response generation.

**How to run:**
```bash
yankovic amish_web_server.ycw
```

**What it does:**
- Creates a web server on port 2727
- Sets up multiple routes (GET, POST)
- Handles JSON and HTML responses
- Demonstrates request parameter extraction
- Shows proper Amish-themed server management

## Key Library Functions Demonstrated:

### Server Management
- `amish_barn_raising(port)` - Start the server
- `amish_barn_still_standing()` - Check server status
- `amish_barn_teardown()` - Stop the server

### Routing
- `amish_buggy_trail_get(path, handler)` - GET routes
- `amish_barn_delivery_post(path, handler)` - POST routes

### Request/Response
- `eat_it_extract_body(request)` - Get request body
- `like_a_surgeon_slice_params(name)` - Get URL parameters
- `amish_butter_churn_json(data, status)` - Send JSON response
- `amish_quilt_html_response(html, status)` - Send HTML response

## Why this example:

Shows how YankoviC can be used for serious web development while maintaining its humorous Amish theme. Demonstrates that despite the fun naming conventions, the library provides real server-side functionality comparable to Express.js or similar frameworks.

## Expected Output:

When run, this creates a local web server that you can access in your browser at `http://localhost:2727`. The server provides both API endpoints and HTML pages, showing the full range of server-side capabilities.
