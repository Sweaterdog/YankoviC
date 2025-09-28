#!/usr/bin/env node
// CLI Graphics Renderer for YankoviC - UHF Broadcasting System
import { createCanvas } from 'canvas';
import fs from 'fs';
import open from 'open';
import path from 'path';
// ---> NEW: Import 'url' to help find our script's location
import { fileURLToPath } from 'url';


// UHF Channel modes for different display outputs
const UHF_CHANNELS = {
    HEADLESS: 'headless',  // UHF Channel 1 - No display (for testing/API)
    ASCII: 'ascii',        // UHF Channel 3 - ASCII art display in terminal
    PNG: 'png',           // UHF Channel 13 - Save as PNG files
    ELECTRON: 'electron'   // UHF Channel 62 - Standard Electron window
};

export class CLIGraphicsRenderer {
    constructor(width = 800, height = 600, channel = UHF_CHANNELS.ASCII) {
        this.width = width;
        this.height = height;
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
        this.frameCount = 0;
        this.channel = channel;
        
        // YankoviC color constants
        this.colors = {
            AL_RED: '#FF0000',
            WHITE_ZOMBIE: '#FFFFFF', 
            BLACK_MAGIC: '#000000',
            SPAM_GREEN: '#00FF00',
            TWINKIE_GOLD: '#FFD700',
            ORANGE_CHEESE: '#FFA500',
            SKY_BLUE_FOR_YOU: '#87CEEB',
            SILVER_SPATULA: '#C0C0C0'
        };
        
        this.currentColor = '#FFFFFF';
        this.outputDir = './cli_output';
        
        // Ensure output directory exists only for PNG mode
        if (this.channel === UHF_CHANNELS.PNG) {
          if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
          }
        }
        
        // UHF Channel tuned - graphics system ready
    }
    
    getChannelNumber() {
        switch(this.channel) {
            case UHF_CHANNELS.HEADLESS: return 1;
            case UHF_CHANNELS.ASCII: return 3;
            case UHF_CHANNELS.PNG: return 13;
            case UHF_CHANNELS.ELECTRON: return 62;
            default: return 0;
        }
    }
    
    getChannelName() {
        switch(this.channel) {
            case UHF_CHANNELS.HEADLESS: return 'API Mode (No Display)';
            case UHF_CHANNELS.ASCII: return 'Terminal ASCII Display';
            case UHF_CHANNELS.PNG: return 'PNG File Output';
            case UHF_CHANNELS.ELECTRON: return 'Standard Display Mode';
            default: return 'Unknown Channel';
        }
    }
    
    // Execute a list of draw commands
    executeDrawCommands(commands = []) {
        this.lastCommandCount = commands.length;
        for (const cmd of commands) {
            this.executeCommand(cmd);
        }
    }
    
    executeCommand(cmd) {
        switch (cmd.command) {
            case 'start_show':
                this.startShow(cmd.args);
                break;
            case 'paint_set':
                this.paintTheSet(cmd.args);
                break;
            case 'pick_shirt':
                this.pickColor(cmd.args);
                break;
            case 'draw_spamsicle':
                this.drawRectangle(cmd.args);
                break;
            case 'draw_cheese':
                this.drawCircle(cmd.args);
                break;
            case 'print_string':
                this.drawText(cmd.args);
                break;
            case 'print_text':
                this.drawText(cmd.args);
                break;
            case 'draw_button':
                this.drawButton(cmd.args);
                break;
            case 'draw_checkbox':
                this.drawCheckbox(cmd.args);
                break;
            case 'draw_slider':
                this.drawSlider(cmd.args);
                break;
            case 'roll_the_camera':
                // Frame start - no action needed
                break;
            case 'render_frame':
                // Frame end - render frame
                this.renderFrame();
                break;
            case 'wait':
                // Wait command - no action needed in static renderer
                break;
            default:
                console.log(`[CLI Graphics] Unknown command: ${cmd.command}`);
        }
    }
    
    startShow(args) {
        const [width, height, title] = args;
        if (width && height) {
            this.width = width;
            this.height = height;
            this.canvas = createCanvas(width, height);
            this.ctx = this.canvas.getContext('2d');
        }
        console.log(`[CLI Graphics] Started show: ${title} (${this.width}x${this.height})`);
    }
    
    paintTheSet(args) {
        let [color] = args;
        
        // Handle case where color is an object (e.g., from YankoviC constants)
        if (typeof color === 'object' && color !== null && color.value) {
            color = color.value;
        }
        
        const bgColor = this.colors[color] || color || '#000000';
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    pickColor(args) {
        let [color] = args;
        
        // Handle case where color is an object (e.g., from YankoviC constants)
        if (typeof color === 'object' && color !== null && color.value) {
            color = color.value;
        }
        
        this.currentColor = this.colors[color] || color || '#FFFFFF';
        this.ctx.fillStyle = this.currentColor;
        this.ctx.strokeStyle = this.currentColor;
    }
    
    drawRectangle(args) {
        const [x, y, width, height] = args;
        this.ctx.fillStyle = this.currentColor;
        this.ctx.fillRect(x || 0, y || 0, width || 10, height || 10);
    }
    
    drawCircle(args) {
        const [x, y, radius] = args;
        this.ctx.fillStyle = this.currentColor;
        this.ctx.beginPath();
        this.ctx.arc((x || 0) + (radius || 10), (y || 0) + (radius || 10), radius || 10, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawText(args) {
        const [text, x, y] = args;
        this.ctx.fillStyle = this.currentColor;
        this.ctx.font = '16px Arial';
        this.ctx.fillText(text || '', x || 0, y || 16);
    }
    
    drawButton(args) {
        const [x, y, width, height, text, buttonId] = args;
        
        // Draw button background
        this.ctx.fillStyle = '#E0E0E0';
        this.ctx.fillRect(x || 0, y || 0, width || 100, height || 30);
        
        // Draw button border
        this.ctx.strokeStyle = '#808080';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x || 0, y || 0, width || 100, height || 30);
        
        // Draw button text
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text || '', (x || 0) + (width || 100) / 2, (y || 0) + (height || 30) / 2);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }
    
    drawCheckbox(args) {
        const [x, y, checked, label, checkboxId] = args;
        
        // Draw checkbox box
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x || 0, y || 0, 20, 20);
        this.ctx.strokeStyle = '#808080';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x || 0, y || 0, 20, 20);
        
        // Draw check mark if checked
        if (checked) {
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo((x || 0) + 5, (y || 0) + 10);
            this.ctx.lineTo((x || 0) + 9, (y || 0) + 14);
            this.ctx.lineTo((x || 0) + 15, (y || 0) + 6);
            this.ctx.stroke();
        }
        
        // Draw label
        if (label) {
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(label, (x || 0) + 25, (y || 0) + 15);
        }
    }
    
    drawSlider(args) {
        const [x, y, width, value, min, max, sliderId] = args;
        const sliderHeight = 20;
        const sliderWidth = width || 200;
        const normalizedValue = ((value || 0) - (min || 0)) / ((max || 100) - (min || 0));
        const thumbX = (x || 0) + normalizedValue * sliderWidth;
        
        // Draw slider track
        this.ctx.fillStyle = '#D0D0D0';
        this.ctx.fillRect(x || 0, (y || 0) + 8, sliderWidth, 4);
        
        // Draw slider thumb
        this.ctx.fillStyle = '#4080FF';
        this.ctx.fillRect(thumbX - 5, y || 0, 10, sliderHeight);
        this.ctx.strokeStyle = '#2060C0';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(thumbX - 5, y || 0, 10, sliderHeight);
    }
    
    renderFrame() {
        this.frameCount++;
        
        switch(this.channel) {
            case UHF_CHANNELS.ASCII:
                this.renderASCII();
                break;
            case UHF_CHANNELS.PNG:
                this.renderPNG();
                break;
            case UHF_CHANNELS.ELECTRON:
                this.renderElectron();
                break;
            case UHF_CHANNELS.HEADLESS:
                // Do nothing - headless mode
                break;
        }
    }
    
    renderASCII() {
        // Check if high-res mode is enabled via environment variable
        const highRes = process.env.YANKOVIC_HIRES === 'true' || process.argv.includes('--hires');
        
        if (highRes) {
            this.renderHighResASCII();
        } else {
            this.renderLowResASCII();
        }
    }
    
    renderLowResASCII() {
        // Original low-res ASCII art for compatibility
        const width = 80;  // Terminal width in characters
        const height = 20; // Terminal height in characters
        
        // Move cursor to top-left and clear screen for smooth updates
        process.stdout.write('\x1b[H\x1b[2J');
        console.log(`\n┌${'─'.repeat(width)}┐`);
        console.log(`│ UHF Channel 3 - ASCII Display (Low-Res) ${' '.repeat(width - 41)}│`);
        console.log(`│ Frame ${this.frameCount} ${' '.repeat(width - 8 - this.frameCount.toString().length)}│`);
        console.log(`├${'─'.repeat(width)}┤`);
        
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        const chars = ' .:-=+*#%@';
        
        for (let y = 0; y < height - 4; y++) {
            let row = '│';
            for (let x = 0; x < width; x++) {
                const canvasX = Math.floor((x / width) * this.width);
                const canvasY = Math.floor((y / (height - 4)) * this.height);
                const pixelIndex = (canvasY * this.width + canvasX) * 4;
                
                const r = data[pixelIndex] || 0;
                const g = data[pixelIndex + 1] || 0;
                const b = data[pixelIndex + 2] || 0;
                const a = data[pixelIndex + 3] || 0;
                
                const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
                const charIndex = Math.min(Math.floor((gray / 255) * (chars.length - 1)), chars.length - 1);
                row += chars[charIndex];
            }
            row += '│';
            console.log(row);
        }
        
        console.log(`└${'─'.repeat(width)}┘`);
        console.log(`[ESC] to exit • [SPACE] to pause • Frame: ${this.frameCount} • Commands: ${this.lastCommandCount || 0}`);
    }
    
    renderHighResASCII() {
        // High-resolution terminal output using Unicode blocks and 24-bit color
        const termWidth = process.stdout.columns || 120;
        const termHeight = process.stdout.rows || 30;
        
        // Use most of the terminal space, leave room for UI
        const displayWidth = Math.min(termWidth - 4, 160);
        const displayHeight = Math.min(termHeight - 6, 60);
        
        // Move cursor to top-left and clear screen for smooth updates
        process.stdout.write('\x1b[H\x1b[2J');
        
        // Header with color
        const header = `🎵 UHF Channel 3 - High-Res Display (${displayWidth}x${displayHeight*2}) 🎵`;
        const headerPadding = Math.max(0, Math.floor((displayWidth - header.length + 8) / 2));
        console.log(`\x1b[48;5;236m\x1b[38;5;226m${' '.repeat(headerPadding)}${header}${' '.repeat(displayWidth - header.length - headerPadding + 8)}\x1b[0m`);
        console.log(`\x1b[48;5;236m\x1b[38;5;46m Frame ${this.frameCount} • Commands: ${this.lastCommandCount || 0} • Press Ctrl+C to exit${' '.repeat(Math.max(0, displayWidth - 60))}\x1b[0m`);
        console.log(`\x1b[48;5;236m${' '.repeat(displayWidth + 4)}\x1b[0m`);
        
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        
        // Use Unicode half-block characters to double vertical resolution
        // Each character represents 2 vertical pixels
        for (let y = 0; y < displayHeight; y++) {
            let row = '\x1b[48;5;236m  \x1b[0m'; // Left border
            
            for (let x = 0; x < displayWidth; x++) {
                // Get two pixels - top and bottom half of the character
                const canvasX = Math.floor((x / displayWidth) * this.width);
                const canvasYTop = Math.floor(((y * 2) / (displayHeight * 2)) * this.height);
                const canvasYBottom = Math.floor(((y * 2 + 1) / (displayHeight * 2)) * this.height);
                
                // Top pixel
                const topIndex = (canvasYTop * this.width + canvasX) * 4;
                const topR = data[topIndex] || 0;
                const topG = data[topIndex + 1] || 0;
                const topB = data[topIndex + 2] || 0;
                
                // Bottom pixel
                const bottomIndex = (canvasYBottom * this.width + canvasX) * 4;
                const bottomR = data[bottomIndex] || 0;
                const bottomG = data[bottomIndex + 1] || 0;
                const bottomB = data[bottomIndex + 2] || 0;
                
                // Use half-block character (▀) with top color as foreground, bottom as background
                const char = '▀';
                
                // 24-bit color ANSI escape codes
                const fgColor = `\x1b[38;2;${topR};${topG};${topB}m`;
                const bgColor = `\x1b[48;2;${bottomR};${bottomG};${bottomB}m`;
                
                row += `${fgColor}${bgColor}${char}\x1b[0m`;
            }
            
            row += '\x1b[48;5;236m  \x1b[0m'; // Right border
            console.log(row);
        }
        
        // Footer
        console.log(`\x1b[48;5;236m${' '.repeat(displayWidth + 4)}\x1b[0m`);
        console.log(`\x1b[48;5;236m\x1b[38;5;51m  [ESC] Exit • [SPACE] Pause • High-Res Mode: ON${' '.repeat(Math.max(0, displayWidth - 45))}\x1b[0m`);
    }
    
    renderPNG() {
        const filename = `frame_${this.frameCount.toString().padStart(4, '0')}.png`;
        const filepath = path.join(this.outputDir, filename);
        
        // Save frame as PNG
        const buffer = this.canvas.toBuffer('image/png');
        fs.writeFileSync(filepath, buffer);
        
        console.log(`[UHF Channel 13] Rendered frame ${this.frameCount}: ${filename}`);
        
        // For the first frame, open it in the default image viewer
        if (this.frameCount === 1) {
            console.log(`[UHF Channel 13] Opening first frame in image viewer...`);
            open(filepath).catch(err => {
                console.log(`[UHF Channel 13] Could not open image viewer: ${err.message}`);
                console.log(`[UHF Channel 13] View frames manually in: ${this.outputDir}`);
            });
        }
    }
    
    renderElectron() {
        // Save frame as PNG first
        const filename = `frame_${this.frameCount.toString().padStart(4, '0')}.png`;
        const filepath = path.join(this.outputDir, filename);
        
        const buffer = this.canvas.toBuffer('image/png');
        fs.writeFileSync(filepath, buffer);
        
        // Launch Electron window on first frame
        if (this.frameCount === 1) {
            console.log(`[UHF Channel 62] Launching Electron display window...`);
            
            // Start the Electron display process
            import('child_process').then(({ spawn }) => {
                // ---> NEW: Get the directory of the current script to build a reliable path
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);

                // ---> UPDATED: Prioritize the absolute path to the local electron executable
                const electronCmds = [
                    path.join(__dirname, 'node_modules', '.bin', 'electron'),
                    'npx electron', // Fallback for npx users
                    'electron'      // Fallback for globally installed electron
                ];
                
                let electronProcess;
                for (const cmd of electronCmds) {
                    try {
                        const args = cmd.split(' ');
                        const command = args[0];
                        const cmdArgs = args.slice(1).concat(['./cli-electron-display.js', this.outputDir]);
                        
                        electronProcess = spawn(command, cmdArgs, {
                            stdio: 'inherit',
                            detached: true
                        });
                        
                        console.log(`[UHF Channel 62] Launched Electron with command: ${cmd}`);
                        // Unreference the child process to allow the parent to exit independently
                        electronProcess.unref();
                        break;
                    } catch (err) {
                        console.log(`[UHF Channel 62] Failed to launch with ${cmd}: ${err.message}`);
                        continue;
                    }
                }
                
                if (!electronProcess) {
                    console.log(`[UHF Channel 62] Could not launch Electron window - no working command found`);
                    console.log(`[UHF Channel 62] Falling back to PNG mode`);
                    this.channel = 'png';
                    this.renderPNG();
                }
            }).catch(err => {
                console.log(`[UHF Channel 62] Could not launch Electron window: ${err.message}`);
                console.log(`[UHF Channel 62] Falling back to PNG mode`);
                this.channel = 'png';
                this.renderPNG();
            });
        }
        
        console.log(`[UHF Channel 62] Rendered frame ${this.frameCount}: ${filename}`);
    }
    
    // Create an animated GIF from all frames
    async createAnimation() {
        console.log(`[CLI Graphics] Created ${this.frameCount} frames in ${this.outputDir}/`);
        console.log(`[CLI Graphics] You can create an animation with: `);
        console.log(`  cd ${this.outputDir} && convert -delay 6 -loop 0 frame_*.png animation.gif`);
    }
    
    cleanup() {
        console.log(`[CLI Graphics] Graphics session ended. Frames saved to ${this.outputDir}/`);
    }
}