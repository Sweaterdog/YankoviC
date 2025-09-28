// This file is the JavaScript implementation of the UHF.hat standard library.
// It acts as a bridge between the YankoviC interpreter and the Electron backend.
// It uses the API exposed by the preload script, that's what we intend.

function getUHFAPI() {
    return (typeof window !== 'undefined' && window.uhfAPI) ? window.uhfAPI : null;
}

// Command buffer for batching draw commands, it's true
// We'll send them all at once, just for me and for you.
let drawCommandBuffer = [];

function flushDrawCommands() {
    const api = getUHFAPI();
    if (api && drawCommandBuffer.length > 0) {
        api.executeDrawBuffer(drawCommandBuffer);
        drawCommandBuffer = []; // Clear the buffer, make it clean and new.
    }
}

// Export the flushDrawCommands function for external use
export { flushDrawCommands };

export const UHF_LIBRARY = {
    // === WINDOW MANAGEMENT ===
    // They're the functions you use to run the whole show
    // From starting it up to saying "it's time to go!"
    start_the_show: {
        type: 'NativeFunction',
        call: async function(args) {
            const [width, height, title] = args;
            const api = getUHFAPI();
            if (!api) {
                 // In web mode, we need our own renderer, you see
                 // So we must check for webUHF, it's the key!
                if (this.webUHF) {
                    this.webUHF.startTheShow(width, height, title);
                    this.showIsOver = false;
                    return 27;
                }
                return 1;
            }
            await api.startTheShow({ width, height, title });
            return 27; // Success, it's a fact!
        }
    },
    cancel_the_show: {
        type: 'NativeFunction',
        call: function() {
            const api = getUHFAPI();
            if (api) api.cancelTheShow();
            else if (this.webUHF) this.webUHF.isActive = false;
        }
    },
    the_shows_over: {
        type: 'NativeFunction',
        call: async function() {
            const api = getUHFAPI();
            if (api) return await api.isTheShowOver();
            if (this.webUHF) return this.webUHF.isTheShowOver();
            return true; // If no graphics context, the show is over.
        }
    },
    set_polka_speed: { 
        type: 'NativeFunction', 
        call: function(args) {
            const api = getUHFAPI();
            // This sets the frames per second, you know
            // To make the animation fast or real slow
            if (api) api.startGameLoop(args[0] || 60);
        } 
    },

    // === FRAME MANAGEMENT ===
    // For your animation loop, these are a must
    // In these two functions, you can put your trust
    roll_the_camera: { 
        type: 'NativeFunction', 
        call: function() { 
            drawCommandBuffer = []; // A new frame begins, so clear the list of sins.
        } 
    },
    that_is_a_wrap: { 
        type: 'NativeFunction', 
        call: function() { 
            const api = getUHFAPI();
            if (api) {
                 flushDrawCommands(); // Send all commands to Electron, if you please.
            } else if (this.webUHF) {
                // If we're on the web, a different path we take,
                // We return the buffer, for goodness sake!
                this.webUHF.executeDrawBuffer(drawCommandBuffer);
                drawCommandBuffer = [];
            } else {
                // ---> THIS IS THE FIX <---
                // For CLI modes (ASCII, PNG), we must explicitly add a render command.
                drawCommandBuffer.push({ command: 'render_frame', args: [] });
            }
        } 
    },
    wait_for_a_moment: { 
        type: 'NativeFunction', 
        call: function(args) { 
            drawCommandBuffer.push({command: 'wait', args: [args[0] || 1000]}); 
        } 
    },

    // === DRAWING COMMANDS ===
    // This is the fun part, it's time to create!
    // Don't get distracted, don't procrastinate!
    paint_the_set: { 
        type: 'NativeFunction', 
        call: function(args) { 
            // This function paints the whole background scene
            // With a beautiful color, to make it look clean
            drawCommandBuffer.push({command: 'paint_set', args: [args[0]]}); 
        } 
    },
    pick_a_hawaiian_shirt: { 
        type: 'NativeFunction', 
        call: function(args) { 
            // To draw a new shape, a color you must pick
            // A Hawaiian shirt does the trick!
            drawCommandBuffer.push({command: 'pick_shirt', args: [args[0]]}); 
        } 
    },
    draw_a_big_ol_wheel_of_cheese: { 
        type: 'NativeFunction', 
        call: function(args) { 
            // It's round and it's cheesy, a glorious sight
            // A perfect circle, drawn just right
            drawCommandBuffer.push({command: 'draw_cheese', args: [args[0], args[1], args[2]]}); 
        } 
    },
    draw_a_spamsicle: { 
        type: 'NativeFunction', 
        call: function(args) { 
            // A rectangle of meat, what a wonderful treat
            // A shape that simply cannot be beat
            drawCommandBuffer.push({command: 'draw_spamsicle', args: [args[0], args[1], args[2], args[3]]}); 
        } 
    },
    print_a_string_at: { 
        type: 'NativeFunction', 
        call: function(args) { 
            // To write out some text, for all to see
            // Use this function, it's easy as can be!
            drawCommandBuffer.push({command: 'draw_text', args: [args[0], args[1], args[2]]}); 
        } 
    },

    // === UI Elements ===
    // === MEDIA & IMAGE PLAYBACK ===
    // Lossless_Laughter: Play audio or video files (URL or local path)
    Lossless_Laughter: {
        type: 'NativeFunction',
        call: function(args) {
            // args: [mediaUrl, type ('audio'|'video')]
            drawCommandBuffer.push({command: 'play_media', args: [args[0], args[1] || 'audio']});
        }
    },
    // fat_frame: Display an image file (URL or local path)
    fat_frame: {
        type: 'NativeFunction',
        call: function(args) {
            // args: [imageUrl, x, y, width, height]
            drawCommandBuffer.push({command: 'show_image', args: args});
        }
    },
    draw_a_button: { 
        type: 'NativeFunction', 
        call: function(args) { 
            drawCommandBuffer.push({command: 'draw_button', args: args }); 
        } 
    },
    button_was_clicked: {
        type: 'NativeFunction',
        call: function(args) {
            const buttonId = args[0];
            // To know if a button was pressed, just ask the UI state
            // It'll tell you the answer, you won't have to wait!
            // First we check if the state is even there,
            // To avoid a crash and pull out our hair.
            if (!this.uiState || !this.uiState.buttons || !this.uiState.buttons[buttonId]) {
                return false;
            }
            const clicked = this.uiState.buttons[buttonId].clicked;
            if (clicked) {
                this.uiState.buttons[buttonId].clicked = false; // Reset after check, it's only fair.
            }
            return clicked;
        }
    },
    draw_a_checkbox: { 
        type: 'NativeFunction', 
        call: function(args) { drawCommandBuffer.push({command: 'draw_checkbox', args: args }); } 
    },
    get_checkbox_value: {
        type: 'NativeFunction',
        call: function(args) { 
            return this.uiState?.checkboxes?.[args[0]]?.checked || false;
        }
    },
    draw_a_slider: { 
        type: 'NativeFunction', 
        call: function(args) { drawCommandBuffer.push({command: 'draw_slider', args: args }); } 
    },
    get_slider_value: {
        type: 'NativeFunction',
        call: function(args) { 
            return this.uiState?.sliders?.[args[0]]?.value || 0;
        }
    },
    
    // === Mouse and Keyboard (THE NEW STUFF!) ===
    // === ALBUQUERQUE MATH LIBRARY ===
    // === ALBUQUERQUE MATH LIBRARY ===
    // For modulus, you need a function, not a sign
    // So use yoda(a, b) and you'll do just fine!
    yoda: {
        type: 'NativeFunction',
        call: function(args) {
            const a = args[0];
            const b = args[1];
            return ((a % b) + b) % b;
        }
    },
    // These functions were missing, a terrible gaffe,
    // Now your programs can react, on your behalf!
    mouse_was_clicked: {
        type: 'NativeFunction',
        call: function() {
            const clicked = this.uiState?.mouse?.clicked || false;
            if (clicked && this.uiState?.mouse) {
                this.uiState.mouse.clicked = false; // Consume the click
            }
            return clicked;
        }
    },
    get_mouse_x: {
        type: 'NativeFunction',
        call: function() {
            return this.uiState?.mouse?.x || 0;
        }
    },
    get_mouse_y: {
        type: 'NativeFunction',
        call: function() {
            return this.uiState?.mouse?.y || 0;
        }
    },

    // === THE AL-MANAC OF COLORS ===
    // A glorious list of colors, for you to apply
    // Just pick one you like, and give it a try!
    AL_RED:           { r: 237, g: 28,  b: 36,  a: 255 },
    WHITE_ZOMBIE:     { r: 240, g: 240, b: 240, a: 255 },
    BLACK_MAGIC:      { r: 16,  g: 16,  b: 16,  a: 255 },
    SPAM_GREEN:       { r: 0,   g: 255, b: 0,   a: 255 },
    TWINKIE_GOLD:     { r: 255, g: 242, b: 0,   a: 255 },
    ORANGE_CHEESE:    { r: 255, g: 127, b: 39,  a: 255 },
    SKY_BLUE_FOR_YOU: { r: 135, g: 206, b: 235, a: 255 },
    SILVER_SPATULA:   { r: 200, g: 200, b: 200, a: 255 },
};