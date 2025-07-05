// This file is the new entry point for the CLI's renderer process.
// Vite will bundle this file and all its dependencies.
import { YankoviCInterpreter } from './core/yankovicInterpreter.js';

class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentColor = '#FFFFFF';
        this.uiState = {
            mouse: { x: 0, y: 0, clicked: false, isDown: false },
            buttons: {}
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', e => {
            this.uiState.mouse.x = e.offsetX;
            this.uiState.mouse.y = e.offsetY;
        });
        this.canvas.addEventListener('mousedown', e => {
            this.uiState.mouse.isDown = true;
            this.uiState.mouse.clicked = true;
            for (const id in this.uiState.buttons) {
                const b = this.uiState.buttons[id];
                if (e.offsetX >= b.x && e.offsetX <= b.x + b.width && e.offsetY >= b.y && e.offsetY <= b.y + b.height) {
                    b.clicked = true;
                }
            }
        });
        this.canvas.addEventListener('mouseup', () => { this.uiState.mouse.isDown = false; });
    }

    resetPerFrameState() {
        this.uiState.mouse.clicked = false;
        for (const id in this.uiState.buttons) {
            this.uiState.buttons[id].clicked = false;
        }
    }

    getUHFOverrides() {
        // Color constants as separate entries
        const colors = {
            AL_RED: { r: 237, g: 28,  b: 36,  a: 255 },
            WHITE_ZOMBIE: { r: 240, g: 240, b: 240, a: 255 },
            BLACK_MAGIC: { r: 16,  g: 16,  b: 16,  a: 255 },
            SPAM_GREEN: { r: 0,   g: 255, b: 0,   a: 255 },
            TWINKIE_GOLD: { r: 255, g: 242, b: 0,   a: 255 },
            ORANGE_CHEESE: { r: 255, g: 127, b: 39,  a: 255 },
            SKY_BLUE_FOR_YOU: { r: 135, g: 206, b: 235, a: 255 },
            SILVER_SPATULA: { r: 200, g: 200, b: 200, a: 255 },
        };

        return {
            start_the_show: (args) => {
                console.log('[CLI-MAIN] start_the_show called with:', args);
                this.canvas.width = args[0]; this.canvas.height = args[1];
                window.cliAPI.setWindow({ width: args[0], height: args[1], title: args[2] });
                console.log('[CLI-MAIN] Canvas resized to:', this.canvas.width, 'x', this.canvas.height);
            },
            paint_the_set: (args) => {
                console.log('[CLI-MAIN] paint_the_set called with:', args);
                let color = args[0];
                
                // Handle wrapped color constants - they can be either NativeFunction or Literal objects
                if (color && typeof color === 'object') {
                    if (color.type === 'NativeFunction' && color.call) {
                        console.log('[CLI-MAIN] Extracting background color from NativeFunction wrapper');
                        color = color.call;
                    } else if (color.type === 'Literal' && color.value) {
                        console.log('[CLI-MAIN] Extracting background color from Literal wrapper');
                        color = color.value;
                    }
                    console.log('[CLI-MAIN] Processed background color:', color);
                }
                
                if (!color) { 
                    this.ctx.fillStyle = '#000'; 
                    console.log('[CLI-MAIN] No color provided, using black background');
                } else if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
                    const alpha = color.a !== undefined ? color.a / 255 : 1;
                    this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                    console.log('[CLI-MAIN] Valid background color processed. Background set to:', this.ctx.fillStyle);
                } else {
                    this.ctx.fillStyle = '#000';
                    console.log('[CLI-MAIN] Invalid background color received, using black fallback:', color);
                }
                
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                console.log('[CLI-MAIN] Background painted with color:', this.ctx.fillStyle);
            },
            pick_a_hawaiian_shirt: (args) => {
                console.log('[CLI-MAIN] pick_a_hawaiian_shirt called with:', args);
                let color = args[0];
                
                // Handle color objects wrapped in NativeFunction or Literal format
                if (color && typeof color === 'object') {
                    if (color.type === 'NativeFunction' && color.call) {
                        console.log('[CLI-MAIN] Extracting color from NativeFunction wrapper');
                        color = color.call;
                    } else if (color.type === 'Literal' && color.value) {
                        console.log('[CLI-MAIN] Extracting color from Literal wrapper');
                        color = color.value;
                    }
                }
                
                console.log('[CLI-MAIN] Processed color:', color);
                
                if (color && typeof color === 'object' && 
                    typeof color.r === 'number' && 
                    typeof color.g === 'number' && 
                    typeof color.b === 'number') {
                    // Use alpha if provided, otherwise default to 255 (fully opaque)
                    const alpha = typeof color.a === 'number' ? color.a : 255;
                    this.currentColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha / 255})`;
                    console.log('[CLI-MAIN] Valid color processed. Current color set to:', this.currentColor);
                } else {
                    console.log('[CLI-MAIN] Invalid color received, using white fallback:', color);
                    this.currentColor = 'rgba(255, 255, 255, 1)'; // Fallback to white
                }
                console.log('[CLI-MAIN] Current color set to:', this.currentColor);
            },
            draw_a_spamsicle: (args) => { 
                console.log('[CLI-MAIN] draw_a_spamsicle called with:', args);
                this.ctx.fillStyle = this.currentColor; 
                this.ctx.fillRect(...args); 
                console.log('[CLI-MAIN] Rectangle drawn');
            },
            draw_a_big_ol_wheel_of_cheese: (args) => {
                console.log('[CLI-MAIN] draw_a_big_ol_wheel_of_cheese called with:', args);
                this.ctx.fillStyle = this.currentColor; this.ctx.beginPath();
                this.ctx.arc(args[0], args[1], args[2], 0, 2 * Math.PI); this.ctx.fill();
                console.log('[CLI-MAIN] Circle drawn');
            },
            print_a_string_at: (args) => {
                console.log('[CLI-MAIN] print_a_string_at called with:', args);
                this.ctx.fillStyle = this.currentColor; this.ctx.font = '16px Arial';
                this.ctx.textBaseline = 'top'; this.ctx.fillText(...args);
                console.log('[CLI-MAIN] Text drawn');
            },
            draw_a_button: (args) => {
                console.log('[CLI-MAIN] draw_a_button called with:', args);
                const [x, y, w, h, text, id] = args;
                if (!this.uiState.buttons[id]) this.uiState.buttons[id] = { x, y, width: w, height: h, clicked: false };
                this.ctx.fillStyle = '#ddd'; this.ctx.fillRect(x, y, w, h);
                this.ctx.strokeStyle = '#999'; this.ctx.lineWidth = 2; this.ctx.strokeRect(x, y, w, h);
                this.ctx.fillStyle = '#000'; this.ctx.font = '14px Arial'; this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle'; this.ctx.fillText(text, x + w / 2, y + h / 2);
                this.ctx.textAlign = 'start'; this.ctx.textBaseline = 'alphabetic';
                console.log('[CLI-MAIN] Button drawn');
            },
            get_mouse_x: () => this.uiState.mouse.x,
            get_mouse_y: () => this.uiState.mouse.y,
            mouse_was_clicked: () => this.uiState.mouse.clicked,
            the_shows_over: () => false,
            roll_the_camera: () => {
                console.log('[CLI-MAIN] roll_the_camera called');
                this.resetPerFrameState();
            },
            that_is_a_wrap: () => {
                console.log('[CLI-MAIN] that_is_a_wrap called');
            },
            set_polka_speed: () => {
                console.log('[CLI-MAIN] set_polka_speed called');
            },
            button_was_clicked: (args) => this.uiState.buttons[args[0]]?.clicked || false,
            // Math functions
            sin: (args) => Math.sin(args[0]),
            cos: (args) => Math.cos(args[0]),
            random_spatula: () => Math.floor(Math.random() * 100),
            yoda: (args) => args[0] % args[1],
            // Color constants - spread them into the main object
            ...colors
        };
    }
}

// --- Main Execution ---
const initializeCliMain = async () => {
    console.log('[CLI-MAIN] DOM Content Loaded');
    const canvas = document.getElementById('display');
    console.log('[CLI-MAIN] Canvas element:', canvas);
    if (!canvas) {
        console.error('[CLI-MAIN] Canvas element not found!');
        return;
    }
    
    const renderer = new CanvasRenderer(canvas);
    console.log('[CLI-MAIN] Canvas renderer created');
    
    // The interpreter now takes the overrides in its constructor
    const interpreter = new YankoviCInterpreter(renderer.getUHFOverrides());
    console.log('[CLI-MAIN] Interpreter created with overrides');
    
    // The interpreter's internal uiState needs to be a direct reference to the renderer's
    interpreter.uiState = renderer.uiState;

    // The code is now on the window object, placed there by cli-runner.html
    const codeToRun = window.yankovicCodeToRun;
    console.log('[CLI-MAIN] Code to run:', codeToRun ? `${codeToRun.length} characters` : 'null');

    if (codeToRun) {
        console.log('[CLI-MAIN] Received bundled code, running with full interpreter...');
        try {
            await interpreter.run(codeToRun);
            console.log('[CLI-MAIN] Initial run completed');

            if (interpreter.polkaLoop) {
                console.log('[CLI-MAIN] Starting animation loop');
                const runAnimationLoop = async () => {
                    if (!interpreter.polkaLoop) return;
                    await interpreter.runFrame();
                    requestAnimationFrame(runAnimationLoop);
                };
                requestAnimationFrame(runAnimationLoop);
            } else {
                console.log('[CLI-MAIN] No polka loop found');
            }
        } catch (error) {
            console.error('[CLI-MAIN] Error running code:', error);
        }
    } else {
        console.error("[CLI-MAIN] No YankoviC code found to run.");
    }
};

// Execute immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCliMain);
} else {
    initializeCliMain();
}