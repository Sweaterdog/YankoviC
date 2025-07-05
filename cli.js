#!/usr/bin/env node
// Polyfill minimal `window` for UHF.hat.js imports
global.window = {};
import fs from 'fs';
import path from 'path';
import { YankoviCInterpreter } from './frontend/src/core/yankovicInterpreter.js';
import { CLIGraphicsRenderer } from './cli-graphics.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// UHF Channel modes
const UHF_CHANNELS = {
    HEADLESS: 'headless',  // UHF Channel 1 - No display (for testing/API)
    ASCII: 'ascii',        // UHF Channel 3 - ASCII art display in terminal  
    PNG: 'png',           // UHF Channel 13 - Save as PNG files
    ELECTRON: 'electron'   // UHF Channel 62 - Standard Electron window
};

// --- NEW: Pre-processor function to resolve #eat directives ---
async function preprocessCode(filePath, processedFiles = new Set()) {
    const absolutePath = path.resolve(filePath);
    if (processedFiles.has(absolutePath)) {
        return ''; // Avoid circular imports
    }
    processedFiles.add(absolutePath);

    let code = fs.readFileSync(absolutePath, 'utf-8');
    
    // Find all #eat directives
    const eatRegex = /^#eat\s*(?:<(.+?)>|"(.+?)")/gm;
    let match;
    const imports = [];
    while ((match = eatRegex.exec(code)) !== null) {
        imports.push({
            fullMatch: match[0],
            path: match[1] || match[2]
        });
    }

    // Replace each #eat with the content of the imported file
    for (const imp of imports) {
        // Skip standard libraries that are built-in to the interpreter
        if (imp.path === 'UHF.hat' || imp.path === 'albuquerque.hat') {
            code = code.replace(imp.fullMatch, `// Pre-processed: ${imp.fullMatch} (built-in)`);
            continue;
        }
        
        const importPath = path.resolve(path.dirname(absolutePath), imp.path);
        if (fs.existsSync(importPath)) {
            const importedCode = await preprocessCode(importPath, processedFiles);
            code = code.replace(imp.fullMatch, `// Pre-processed: ${imp.fullMatch}\n${importedCode}`);
        } else {
            console.warn(`Warning: Could not find import '${imp.path}'`);
            code = code.replace(imp.fullMatch, `// Pre-processed: ${imp.fullMatch} (not found)`);
        }
    }

    return code;
}


async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('🎵 YankoviC CLI - The Accordion Programming Language 🎵');
    console.error('');
    console.error('Usage: node cli.js <path/to/file.yc> [options]');
    console.error('');
    console.error('📺 UHF Channel Options (Display Modes):');
    console.error('  --channel=1   or --headless   📻 API Mode (No Display)');
    console.error('  --channel=3   or --ascii      🖥️  Terminal ASCII Display (default)');
    console.error('  --channel=13  or --png        🖼️  PNG File Output');
    console.error('  --channel=62  or --electron   📺 Standard Display Mode (Electron)');
    console.error('');
    console.error('🎨 ASCII Display Options:');
    console.error('  --hires                       🌈 High-Resolution Terminal Display');
    console.error('                                   (24-bit color, Unicode blocks)');
    console.error('');
    console.error('⚙️ Other Options:');
    console.error('  --max-frames=N: Limit number of frames (default: unlimited)');
    console.error('');
    console.error('🎸 Examples:');
    console.error('  node cli.js examples/calculator.yc --ascii');
    console.error('  node cli.js examples/calculator.yc --ascii --hires');
    console.error('  node cli.js examples/EYKIW_os.yc --png');
    console.error('  node cli.js examples/bouncing_spatula.yc --electron');
    console.error('');
    console.error('🎬 Demo all channels: ./demo-uhf-channels.sh');
    process.exit(1);
  }
  
  const filePath = path.resolve(process.cwd(), args[0]);
  
  // Parse UHF channel from arguments
  let channel = UHF_CHANNELS.ASCII; // Default to ASCII
  
  if (args.includes('--headless') || args.includes('--channel=1')) {
    channel = UHF_CHANNELS.HEADLESS;
  } else if (args.includes('--ascii') || args.includes('--channel=3')) {
    channel = UHF_CHANNELS.ASCII;
  } else if (args.includes('--png') || args.includes('--channel=13') || args.includes('--graphics')) {
    channel = UHF_CHANNELS.PNG;
  } else if (args.includes('--electron') || args.includes('--channel=62')) {
    channel = UHF_CHANNELS.ELECTRON;
  }
  
  const maxFramesArg = args.find(arg => arg.startsWith('--max-frames='));
  const maxFrames = maxFramesArg ? parseInt(maxFramesArg.split('=')[1]) : null;

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  // --- The Big Change: Handle Electron Mode Separately ---
  if (channel === UHF_CHANNELS.ELECTRON) {
    console.log('[UHF Channel 62] Pre-processing code...');
    const processedCode = await preprocessCode(filePath);
    console.log('[UHF Channel 62] Launching dedicated YankoviC application window...');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');

    // Set an environment variable to tell the Electron app which file to run
    const env = { ...process.env, YANKOVIC_CLI_CODE: processedCode };

    const electronProcess = spawn(electronPath, [path.join(__dirname, 'electron/cli-runner.cjs')], {
        stdio: 'inherit',
        env: env
    });

    electronProcess.on('close', (code) => {
        console.log(`[UHF Channel 62] Application window closed with exit code ${code}.`);
        process.exit(code);
    });

    return; // Exit the CLI script, Electron is now in charge.
  }

  // --- Logic for non-Electron modes (ASCII, PNG, Headless) ---
  
  const code = fs.readFileSync(filePath, 'utf-8');
  const interpreter = new YankoviCInterpreter();
  
  // Inject file system and browser opening capabilities for web development
  global.yankovicFileAPI = {
    writeFile: (filepath, content) => {
      try {
        const fullPath = path.resolve(filepath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content);
        return fullPath;
      } catch (error) {
        throw new Error(`Failed to write file: ${error.message}`);
      }
    },
    deleteFile: (filepath) => {
      try {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          return true;
        }
        return false;
      } catch (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    },
    openInBrowser: (filepath) => {
      try {
        const openCommand = process.platform === 'darwin' ? 'open' : 
                          process.platform === 'win32' ? 'start' : 'xdg-open';
        spawn(openCommand, [filepath], { detached: true, stdio: 'ignore' }).unref();
        return true;
      } catch (error) {
        throw new Error(`Failed to open browser: ${error.message}`);
      }
    }
  };
  
  let renderer = null;
  
  if (channel !== UHF_CHANNELS.HEADLESS) {
    renderer = new CLIGraphicsRenderer(800, 600, channel);
    console.log(`[CLI] Graphics mode enabled - UHF Channel ${renderer.getChannelNumber()}`);
  }
  
  console.log('=== INITIAL PROGRAM EXECUTION ===');
  const { output, exitCode } = await interpreter.run(code);
  console.log(output);
  
  interpreter.outputBuffer = [];
  
  if (interpreter.polkaLoop) {
    console.log('\n=== POLKA LOOP FRAME EXECUTION ===');
    let frameResult;
    
    while ((frameResult = await interpreter.runFrame()) !== null && (maxFrames === null || interpreter.frameCount <= maxFrames)) {
      if (renderer && frameResult && frameResult.length > 0) {
        renderer.executeDrawCommands(frameResult);
      }
      
      const frameLogs = interpreter.outputBuffer.slice();
      interpreter.outputBuffer = [];
      
      if (frameLogs.length > 0 && frameLogs.some(log => !log.includes('test result:'))) {
        console.log(`Frame ${interpreter.frameCount} logs:`, frameLogs.join('; '));
      }
      
      if (renderer && channel !== UHF_CHANNELS.HEADLESS) {
        await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
      }
    }
    
    if (maxFrames !== null && interpreter.frameCount > maxFrames) {
      console.log(`--- Frame limit reached (${maxFrames} frames) ---`);
    } else {
      console.log('--- Polka loop finished naturally ---');
    }
    
    if (renderer) {
      if(channel === UHF_CHANNELS.PNG) await renderer.createAnimation();
      renderer.cleanup();
    }
  }
  process.exit(exitCode);
}

main().catch(err => {
  console.error('CLI Error:', err);
  process.exit(1);
});