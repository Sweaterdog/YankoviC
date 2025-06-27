const { ipcRenderer } = require('electron');

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

let currentFillStyle = '#FFF';
let uiElements = {}; // Store interactive UI elements
let mouseState = { x: 0, y: 0, clicked: false };
let keyState = {};

// Add mouse and keyboard event listeners
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseState.x = e.clientX - rect.left;
    mouseState.y = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseState.clicked = true;
    
    // Check for button clicks, if you're inclined
    // A simple loop to see what the user designed
    for (const [id, button] of Object.entries(uiElements.buttons || {})) {
        if (x >= button.x && x <= button.x + button.width &&
            y >= button.y && y <= button.y + button.height) {
            button.clicked = true;
        }
    }
    
    // Reset click state after a short delay
    setTimeout(() => { mouseState.clicked = false; }, 100);
});

document.addEventListener('keydown', (e) => { keyState[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keyState[e.key.toLowerCase()] = false; });

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Listen for a batch of draw commands from the main process
ipcRenderer.on('UHF:draw-on-canvas', (event, buffer) => {
    // This is one frame of drawing
    for (const cmd of buffer) {
        
        switch (cmd.command) {
            case 'clear_screen':
                const [bgColor] = cmd.args; // Unbox the argument from its array
                ctx.fillStyle = bgColor || 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
                
            case 'paint_set':
                // THE FIRST FIX IS RIGHT HERE, IT'S A FACT
                // We unbox the color object, to be exact!
                const [bg] = cmd.args; 
                ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${bg.a / 255})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
            
            case 'pick_shirt':
                // AND THE SECOND FIX IS JUST THE SAME, YOU SEE
                // Take the first element, set it free!
                const [tint] = cmd.args;
                currentFillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${tint.a / 255})`;
                break;

            case 'draw_cheese':
            case 'draw_circle':
                const [centerX, centerY, radius] = cmd.args;
                ctx.fillStyle = currentFillStyle;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
                break;

            case 'draw_spamsicle':
            case 'draw_rectangle':
                const [x, y, width, height] = cmd.args;
                ctx.fillStyle = currentFillStyle;
                ctx.fillRect(x, y, width, height);
                break;
                
            case 'draw_text':
                const [text, textX, textY] = cmd.args;
                ctx.fillStyle = currentFillStyle;
                ctx.font = '16px Arial';
                ctx.fillText(text.toString(), textX, textY);
                break;
                
            case 'draw_button':
                const [btnX, btnY, btnWidth, btnHeight, btnText, btnId] = cmd.args;
                if (!uiElements.buttons) uiElements.buttons = {};
                uiElements.buttons[btnId] = { x: btnX, y: btnY, width: btnWidth, height: btnHeight, clicked: false };
                ctx.fillStyle = '#ddd';
                ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 2;
                ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
                ctx.fillStyle = '#000';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(btnText, btnX + btnWidth/2, btnY + btnHeight/2);
                ctx.textAlign = 'start';
                ctx.textBaseline = 'alphabetic';
                break;
            
               case 'draw_text_box':
                const [tbX, tbY, tbWidth, tbHeight, placeholder, tbId] = cmd.args;
                console.log('[UHF Renderer] Drawing text box:', tbId, 'at', tbX, tbY);
                
                // Store text box for interaction (simplified - in a real implementation, you'd need input handling)
                if (!uiElements.textBoxes[tbId]) {
                    uiElements.textBoxes[tbId] = { x: tbX, y: tbY, width: tbWidth, height: tbHeight, value: "" };
                }
                
                // Draw text box background
                ctx.fillStyle = '#fff';
                ctx.fillRect(tbX, tbY, tbWidth, tbHeight);
                
                // Draw text box border
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 1;
                ctx.strokeRect(tbX, tbY, tbWidth, tbHeight);
                
                // Draw placeholder text
                ctx.fillStyle = '#999';
                ctx.font = '14px Arial';
                ctx.fillText(placeholder || "Enter text...", tbX + 5, tbY + tbHeight/2 + 5);
                break;
                
            case 'draw_checkbox':
                const [cbX, cbY, cbSize, label, cbId, checked] = cmd.args;
                console.log('[UHF Renderer] Drawing checkbox:', cbId, 'at', cbX, cbY);
                
                // Store checkbox for interaction
                if (!uiElements.checkboxes[cbId]) {
                    uiElements.checkboxes[cbId] = { x: cbX, y: cbY, size: cbSize, checked: checked || false };
                }
                
                // Draw checkbox background
                ctx.fillStyle = '#fff';
                ctx.fillRect(cbX, cbY, cbSize, cbSize);
                
                // Draw checkbox border
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 1;
                ctx.strokeRect(cbX, cbY, cbSize, cbSize);
                
                // Draw checkmark if checked
                if (checked) {
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cbX + 3, cbY + cbSize/2);
                    ctx.lineTo(cbX + cbSize/2, cbY + cbSize - 3);
                    ctx.lineTo(cbX + cbSize - 3, cbY + 3);
                    ctx.stroke();
                }
                
                // Draw label
                ctx.fillStyle = '#000';
                ctx.font = '14px Arial';
                ctx.fillText(label, cbX + cbSize + 10, cbY + cbSize/2 + 5);
                break;
                
            case 'draw_slider':
                const [slX, slY, slWidth, minVal, maxVal, currentVal, slId] = cmd.args;
                console.log('[UHF Renderer] Drawing slider:', slId, 'at', slX, slY);
                
                // Store slider for interaction
                if (!uiElements.sliders[slId]) {
                    uiElements.sliders[slId] = { x: slX, y: slY, width: slWidth, min: minVal, max: maxVal, value: currentVal };
                }
                
                // Draw slider track
                ctx.fillStyle = '#ddd';
                ctx.fillRect(slX, slY + 10, slWidth, 5);
                
                // Draw slider handle
                const handlePos = slX + ((currentVal - minVal) / (maxVal - minVal)) * slWidth;
                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.arc(handlePos, slY + 12.5, 8, 0, 2 * Math.PI);
                ctx.fill();
                break;
                
            default:
                console.log('[UHF Renderer] Unknown command:', cmd.command);
        }
    }
    
    // Send UI state back to the main process for the interpreter
    ipcRenderer.send('UHF:ui-state', {
        mouse: mouseState,
        keys: keyState,
        buttons: uiElements.buttons,
    });
});