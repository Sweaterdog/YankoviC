// This file is the JavaScript implementation of the UHF.hat standard library.
// It acts as a bridge between the YankoviC interpreter and the Electron backend.
// It uses the API exposed by the preload script, that's what we intend.

function getUHFAPI() {
    return (typeof window !== 'undefined' && window.uhfAPI) ? window.uhfAPI : null;
}

// NOTE: The command buffer is now a property of the interpreter instance (`this.drawCommandBuffer`).
// The module-level `drawCommandBuffer` and `flushDrawCommands` function have been removed.

export const UHF_LIBRARY = {
    // === WINDOW MANAGEMENT ===
    start_the_show: {
        type: 'NativeFunction',
        call: async function(args) {
            const [width, height, title] = args;
            const api = getUHFAPI();
            if (!api) {
                if (this.webUHF) {
                    this.webUHF.startTheShow(width, height, title);
                    this.showIsOver = false;
                    return 27;
                }
                // For CLI, we push a command to the interpreter's buffer.
                this.drawCommandBuffer.push({ command: 'start_show', args });
                return 1;
            }
            await api.startTheShow({ width, height, title });
            return 27;
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
            // In CLI mode, the interpreter manages this state.
            return this.showIsOver;
        }
    },
    set_polka_speed: { 
        type: 'NativeFunction', 
        call: function(args) {
            const api = getUHFAPI();
            if (api) api.startGameLoop(args[0] || 60);
        } 
    },

    // === FRAME MANAGEMENT ===
    roll_the_camera: { 
        type: 'NativeFunction', 
        call: function() { 
            // A new frame begins, so clear the interpreter's command buffer for this frame.
            this.drawCommandBuffer = [];
        } 
    },
    that_is_a_wrap: { 
        type: 'NativeFunction', 
        call: function() { 
            const api = getUHFAPI();
            if (api) {
                 if (this.drawCommandBuffer.length > 0) {
                    api.executeDrawBuffer(this.drawCommandBuffer);
                    this.drawCommandBuffer = [];
                }
            } else if (this.webUHF) {
                this.webUHF.executeDrawBuffer(this.drawCommandBuffer);
                this.drawCommandBuffer = [];
            } else {
                // For CLI modes (ASCII, PNG), add the render command.
                this.drawCommandBuffer.push({ command: 'render_frame', args: [] });
            }
        } 
    },
    wait_for_a_moment: { 
        type: 'NativeFunction', 
        call: function(args) { 
            this.drawCommandBuffer.push({command: 'wait', args: [args[0] || 1000]}); 
        } 
    },

    // === DRAWING COMMANDS ===
    paint_the_set: { 
        type: 'NativeFunction', 
        call: function(args) { 
            this.drawCommandBuffer.push({command: 'paint_set', args: [args[0]]}); 
        } 
    },
    pick_a_hawaiian_shirt: { 
        type: 'NativeFunction', 
        call: function(args) { 
            this.drawCommandBuffer.push({command: 'pick_shirt', args: [args[0]]}); 
        } 
    },
    draw_a_big_ol_wheel_of_cheese: { 
        type: 'NativeFunction', 
        call: function(args) { 
            this.drawCommandBuffer.push({command: 'draw_cheese', args: [args[0], args[1], args[2]]}); 
        } 
    },
    draw_a_spamsicle: { 
        type: 'NativeFunction', 
        call: function(args) { 
            this.drawCommandBuffer.push({command: 'draw_spamsicle', args: [args[0], args[1], args[2], args[3]]}); 
        } 
    },
    print_a_string_at: { 
        type: 'NativeFunction', 
        call: function(args) { 
            this.drawCommandBuffer.push({command: 'draw_text', args: [args[0], args[1], args[2]]}); 
        } 
    },

    // === UI, MEDIA, and MATH ===
    Lossless_Laughter: {
        type: 'NativeFunction',
        call: function(args) {
            this.drawCommandBuffer.push({command: 'play_media', args: [args[0], args[1] || 'audio']});
        }
    },
    fat_frame: {
        type: 'NativeFunction',
        call: function(args) {
            this.drawCommandBuffer.push({command: 'show_image', args: args});
        }
    },
    draw_a_button: { 
        type: 'NativeFunction', 
        call: function(args) { 
            this.drawCommandBuffer.push({command: 'draw_button', args: args }); 
        } 
    },
    button_was_clicked: {
        type: 'NativeFunction',
        call: function(args) {
            const buttonId = args[0];
            if (!this.uiState || !this.uiState.buttons || !this.uiState.buttons[buttonId]) {
                return false;
            }
            const clicked = this.uiState.buttons[buttonId].clicked;
            if (clicked) {
                this.uiState.buttons[buttonId].clicked = false;
            }
            return clicked;
        }
    },
    draw_a_checkbox: { 
        type: 'NativeFunction', 
        call: function(args) { this.drawCommandBuffer.push({command: 'draw_checkbox', args: args }); } 
    },
    get_checkbox_value: {
        type: 'NativeFunction',
        call: function(args) { 
            return this.uiState?.checkboxes?.[args[0]]?.checked || false;
        }
    },
    draw_a_slider: { 
        type: 'NativeFunction', 
        call: function(args) { this.drawCommandBuffer.push({command: 'draw_slider', args: args }); } 
    },
    get_slider_value: {
        type: 'NativeFunction',
        call: function(args) { 
            return this.uiState?.sliders?.[args[0]]?.value || 0;
        }
    },
    yoda: {
        type: 'NativeFunction',
        call: function(args) {
            const a = args[0];
            const b = args[1];
            return ((a % b) + b) % b;
        }
    },
    mouse_was_clicked: {
        type: 'NativeFunction',
        call: function() {
            const clicked = this.uiState?.mouse?.clicked || false;
            if (clicked && this.uiState?.mouse) {
                this.uiState.mouse.clicked = false;
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

    // === COLOR CONSTANTS ===
    AL_RED:           { r: 237, g: 28,  b: 36,  a: 255 },
    WHITE_ZOMBIE:     { r: 240, g: 240, b: 240, a: 255 },
    BLACK_MAGIC:      { r: 16,  g: 16,  b: 16,  a: 255 },
    SPAM_GREEN:       { r: 0,   g: 255, b: 0,   a: 255 },
    TWINKIE_GOLD:     { r: 255, g: 242, b: 0,   a: 255 },
    ORANGE_CHEESE:    { r: 255, g: 127, b: 39,  a: 255 },
    SKY_BLUE_FOR_YOU: { r: 135, g: 206, b: 235, a: 255 },
    SILVER_SPATULA:   { r: 200, g: 200, b: 200, a: 255 },
};