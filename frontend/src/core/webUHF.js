// Web-based UHF graphics fallback
// This provides basic graphics support when not running in Electron

export class WebUHFRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        this.currentColor = '#FFFFFF';
        this.backgroundColor = '#000000';
        this.uiElements = {
            buttons: {},
            textBoxes: {},
            checkboxes: {},
            sliders: {}
        };
        this.mouseState = { x: 0, y: 0, clicked: false };
        this.keyState = {};
    }

    startTheShow(width, height, title) {
        // Create a popup window with a canvas
        const popup = window.open('', '_blank', `width=${width},height=${height},scrollbars=no,resizable=no`);
        if (!popup) {
            console.error('Popup blocked! Please allow popups for UHF graphics.');
            return false;
        }

        popup.document.title = title;
        popup.document.body.style.margin = '0';
        popup.document.body.style.padding = '0';
        popup.document.body.style.overflow = 'hidden';
        popup.document.body.style.backgroundColor = '#000';

        this.canvas = popup.document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.display = 'block';
        
        popup.document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.isActive = true;

        // Add event listeners
        this.setupEventListeners(popup);

        return true;
    }

    setupEventListeners(popup) {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseState.x = e.clientX - rect.left;
            this.mouseState.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.mouseState.clicked = true;

            // Check button clicks
            for (const [id, button] of Object.entries(this.uiElements.buttons)) {
                if (x >= button.x && x <= button.x + button.width &&
                    y >= button.y && y <= button.y + button.height) {
                    button.clicked = true;
                }
            }

            setTimeout(() => { this.mouseState.clicked = false; }, 100);
        });

        popup.addEventListener('keydown', (e) => {
            this.keyState[e.key.toLowerCase()] = true;
        });

        popup.addEventListener('keyup', (e) => {
            this.keyState[e.key.toLowerCase()] = false;
        });

        popup.addEventListener('beforeunload', () => {
            this.isActive = false;
        });
    }

    executeDrawBuffer(buffer) {
        if (!this.ctx || !this.isActive) return;

        for (const cmd of buffer) {
            this.executeCommand(cmd);
        }
    }

    executeCommand(cmd) {
        if (!this.ctx) return;

        switch (cmd.command) {
            case 'play_media': {
                // args: [mediaUrl, type ('audio'|'video')]
                const [mediaUrl, type] = cmd.args;
                let mediaElem = this.mediaElem;
                if (mediaElem && mediaElem.parentNode) mediaElem.parentNode.removeChild(mediaElem);
                mediaElem = document.createElement(type === 'video' ? 'video' : 'audio');
                mediaElem.src = mediaUrl;
                mediaElem.autoplay = true;
                mediaElem.controls = true;
                mediaElem.style.position = 'absolute';
                mediaElem.style.left = '0';
                mediaElem.style.top = '0';
                mediaElem.style.maxWidth = '100%';
                mediaElem.style.maxHeight = '100%';
                mediaElem.style.zIndex = 1000;
                this.canvas.parentNode.appendChild(mediaElem);
                this.mediaElem = mediaElem;
                break;
            }
            case 'show_image': {
                // args: [imageUrl, x, y, width, height]
                const [imageUrl, x, y, width, height] = cmd.args;
                const img = new window.Image();
                img.onload = () => {
                    this.ctx.drawImage(img, x || 0, y || 0, width || img.width, height || img.height);
                };
                img.src = imageUrl;
                break;
            }
            case 'clear_screen':
                this.backgroundColor = cmd.args[0] || '#000000';
                this.ctx.fillStyle = this.backgroundColor;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;

            case 'set_color':
                const [r, g, b, a] = cmd.args;
                this.currentColor = `rgba(${r || 0}, ${g || 0}, ${b || 0}, ${(a !== undefined ? a : 255) / 255})`;
                this.ctx.fillStyle = this.currentColor;
                break;

            case 'draw_circle':
                const [cx, cy, radius] = cmd.args;
                this.ctx.fillStyle = this.currentColor;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                break;

            case 'draw_rectangle':
                const [x, y, width, height] = cmd.args;
                this.ctx.fillStyle = this.currentColor;
                this.ctx.fillRect(x, y, width, height);
                break;

            case 'draw_text':
            case 'print_text':
                const [text, textX, textY] = cmd.args;
                this.ctx.fillStyle = this.currentColor;
                this.ctx.font = '16px Arial';
                this.ctx.fillText(text.toString(), textX, textY);
                break;

            case 'draw_button':
                const [btnX, btnY, btnWidth, btnHeight, btnText, btnId] = cmd.args;
                
                // Store button for interaction
                this.uiElements.buttons[btnId] = { 
                    x: btnX, y: btnY, width: btnWidth, height: btnHeight, clicked: false 
                };

                // Draw button
                this.ctx.fillStyle = '#ddd';
                this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
                this.ctx.strokeStyle = '#999';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
                
                // Draw text
                this.ctx.fillStyle = '#000';
                this.ctx.font = '14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(btnText, btnX + btnWidth/2, btnY + btnHeight/2);
                this.ctx.textAlign = 'start';
                this.ctx.textBaseline = 'alphabetic';
                break;

            default:
                console.log('Unknown UHF command:', cmd.command);
        }
    }

    isTheShowOver() {
        return !this.isActive;
    }

    getUIState() {
        return {
            mouse: this.mouseState,
            keys: this.keyState,
            buttons: this.uiElements.buttons,
            textBoxes: this.uiElements.textBoxes,
            checkboxes: this.uiElements.checkboxes,
            sliders: this.uiElements.sliders
        };
    }
}
