// Test UHF functionality directly
console.log('Testing UHF functionality...');

// Check if uhfAPI is available
if (typeof window !== 'undefined' && window.uhfAPI) {
    console.log('UHF API is available');
    
    // Test starting the show
    window.uhfAPI.startTheShow({width: 400, height: 300, title: "Test Window"})
        .then(result => {
            console.log('Start show result:', result);
            
            // Test drawing a simple frame
            const testCommands = [
                {command: 'paint_set', args: {r: 255, g: 0, b: 0, a: 255}}, // Red background
                {command: 'pick_shirt', args: {r: 0, g: 255, b: 0, a: 255}}, // Green color
                {command: 'draw_cheese', args: [200, 150, 50]} // Circle in center
            ];
            
            return window.uhfAPI.executeDrawBuffer(testCommands);
        })
        .then(result => {
            console.log('Execute draw buffer result:', result);
        })
        .catch(error => {
            console.error('UHF test error:', error);
        });
} else {
    console.log('UHF API not available - running in non-Electron environment');
}
