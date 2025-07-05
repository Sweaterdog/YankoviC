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
        return {
            start_the_show: (args) => {
                this.canvas.width = args[0]; this.canvas.height = args[1];
                window.cliAPI.setWindow({ width: args[0], height: args[1], title: args[2] });
            },
            paint_the_set: (args) => {
                const color = args[0];
                if (!color) { this.ctx.fillStyle = '#000'; }
                else { this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`; }
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            },
            pick_a_hawaiian_shirt: (args) => {
                const color = args[0];
                this.currentColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
            },
            draw_a_spamsicle: (args) => { this.ctx.fillStyle = this.currentColor; this.ctx.fillRect(...args); },
            draw_a_big_ol_wheel_of_cheese: (args) => {
                this.ctx.fillStyle = this.currentColor; this.ctx.beginPath();
                this.ctx.arc(args[0], args[1], args[2], 0, 2 * Math.PI); this.ctx.fill();
            },
            print_a_string_at: (args) => {
                 this.ctx.fillStyle = this.currentColor; this.ctx.font = '16px Arial';
                 this.ctx.textBaseline = 'top'; this.ctx.fillText(...args);
            },
            draw_a_button: (args) => {
                const [x, y, w, h, text, id] = args;
                if (!this.uiState.buttons[id]) this.uiState.buttons[id] = { x, y, width: w, height: h, clicked: false };
                this.ctx.fillStyle = '#ddd'; this.ctx.fillRect(x, y, w, h);
                this.ctx.strokeStyle = '#999'; this.ctx.lineWidth = 2; this.ctx.strokeRect(x, y, w, h);
                this.ctx.fillStyle = '#000'; this.ctx.font = '14px Arial'; this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle'; this.ctx.fillText(text, x + w / 2, y + h / 2);
                this.ctx.textAlign = 'start'; this.ctx.textBaseline = 'alphabetic';
            },
            get_mouse_x: () => this.uiState.mouse.x,
            get_mouse_y: () => this.uiState.mouse.y,
            mouse_was_clicked: () => this.uiState.mouse.clicked,
            the_shows_over: () => false,
            roll_the_camera: () => this.resetPerFrameState(),
            that_is_a_wrap: () => {},
            set_polka_speed: () => {},
            button_was_clicked: (args) => this.uiState.buttons[args[0]]?.clicked || false,
            // Math functions
            sin: (args) => Math.sin(args[0]),
            cos: (args) => Math.cos(args[0]),
            random_spatula: () => Math.floor(Math.random() * 100),
            yoda: (args) => args[0] % args[1],
            // Color constants
            AL_RED: { r: 237, g: 28,  b: 36,  a: 255 },
            WHITE_ZOMBIE: { r: 240, g: 240, b: 240, a: 255 },
            BLACK_MAGIC: { r: 16,  g: 16,  b: 16,  a: 255 },
            SPAM_GREEN: { r: 0,   g: 255, b: 0,   a: 255 },
            TWINKIE_GOLD: { r: 255, g: 242, b: 0,   a: 255 },
            ORANGE_CHEESE: { r: 255, g: 127, b: 39,  a: 255 },
            SKY_BLUE_FOR_YOU: { r: 135, g: 206, b: 235, a: 255 },
            SILVER_SPATULA: { r: 200, g: 200, b: 200, a: 255 },
        };
    }
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('display');
    const renderer = new CanvasRenderer(canvas);
    // The interpreter now takes the overrides in its constructor
    const interpreter = new YankoviCInterpreter(renderer.getUHFOverrides());
    // The interpreter's internal uiState needs to be a direct reference to the renderer's
    interpreter.uiState = renderer.uiState;

    // The code is now on the window object, placed there by cli-runner.html
    const codeToRun = window.yankovicCodeToRun;

    if (codeToRun) {
        console.log('Received bundled code, running with full interpreter...');
        await interpreter.run(codeToRun);

        if (interpreter.polkaLoop) {
            const runAnimationLoop = async () => {
                if (!interpreter.polkaLoop) return;
                await interpreter.runFrame();
                requestAnimationFrame(runAnimationLoop);
            };
            requestAnimationFrame(runAnimationLoop);
        }
    } else {
        console.error("No YankoviC code found to run.");
    }
});