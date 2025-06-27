#!/usr/bin/env node
// Polyfill minimal `window` for UHF.hat.js imports
global.window = {};
import fs from 'fs';
import path from 'path';
import { YankoviCInterpreter } from './frontend/src/core/yankovicInterpreter.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: npm run cli <path/to/file.yc>');
    process.exit(1);
  }
  const filePath = path.resolve(process.cwd(), args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const code = fs.readFileSync(filePath, 'utf-8');
  const interpreter = new YankoviCInterpreter();
  
  console.log('=== INITIAL PROGRAM EXECUTION ===');
  const { output, exitCode } = await interpreter.run(code);
  console.log(output);
  
  // Clear the output buffer after initial execution
  interpreter.outputBuffer = [];
  
  // If there's a polka loop, simulate limited frames for CLI testing
  if (interpreter.polkaLoop) {
    console.log('\n=== POLKA LOOP FRAME EXECUTION ===');
    let frameResult;
    let maxFrames = 10; // Limit frames in CLI to prevent infinite output
    
    while ((frameResult = await interpreter.runFrame()) !== null && interpreter.frameCount <= maxFrames) {
      // Clear the buffer first, then check if there are any new logs
      const frameLogs = interpreter.outputBuffer.slice(); // Copy the logs
      interpreter.outputBuffer = []; // Clear for next frame
      
      // Only print frame logs if they contain anything meaningful
      if (frameLogs.length > 0 && frameLogs.some(log => !log.includes('test result:') && !log.includes('buffer:'))) {
        const meaningfulLogs = frameLogs.filter(log => !log.includes('test result:') && !log.includes('buffer:'));
        console.log(`Frame ${interpreter.frameCount} logs:`, meaningfulLogs.join('; '));
      }
      
      if (frameResult && frameResult.length > 0) {
        console.log(`Frame ${interpreter.frameCount}: ${frameResult.length} draw command(s) generated`);
      }
    }
    
    if (interpreter.frameCount > maxFrames) {
      console.log('--- Frame limit reached in CLI mode ---');
    } else {
      console.log('--- Polka loop finished naturally ---');
    }
  }
  process.exit(exitCode);
}

main().catch(err => {
  console.error('CLI Error:', err);
  process.exit(1);
});
