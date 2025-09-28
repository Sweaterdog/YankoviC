#!/usr/bin/env node
// Polyfill minimal `window` for UHF.hat.js imports
global.window = {};

// Make Node.js modules available to YankoviC interpreter
import http from 'http';
global.nodeModules = {
    http: http
};

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

// --- Asset scanning and embedding for CLI ---
function scanForAssets(code, basePath) {
    const assets = new Map();
    
    // Find all fat_frame calls that reference image files
    const fatFrameRegex = /fat_frame\s*\(\s*["']([^"']+)["']/g;
    let match;
    
    while ((match = fatFrameRegex.exec(code)) !== null) {
        const assetPath = match[1];
        let resolvedPath;
        
        // Handle absolute paths
        if (path.isAbsolute(assetPath)) {
            resolvedPath = assetPath;
        } else {
            // Handle relative paths
            resolvedPath = path.resolve(path.dirname(basePath), assetPath);
        }
        
        if (fs.existsSync(resolvedPath)) {
            try {
                const fileData = fs.readFileSync(resolvedPath);
                const ext = path.extname(resolvedPath).toLowerCase();
                let mimeType = 'application/octet-stream';
                
                // Determine MIME type based on extension
                switch (ext) {
                    case '.jpg':
                    case '.jpeg':
                        mimeType = 'image/jpeg';
                        break;
                    case '.png':
                        mimeType = 'image/png';
                        break;
                    case '.gif':
                        mimeType = 'image/gif';
                        break;
                    case '.webp':
                        mimeType = 'image/webp';
                        break;
                    case '.svg':
                        mimeType = 'image/svg+xml';
                        break;
                }
                
                const base64Data = fileData.toString('base64');
                const dataURL = `data:${mimeType};base64,${base64Data}`;
                assets.set(assetPath, dataURL);
                
                console.log(`📎 Embedded asset: ${path.basename(resolvedPath)}`);
            } catch (error) {
                console.warn(`⚠️  Could not read asset: ${resolvedPath}`);
            }
        }
    }
    
    return assets;
}

// Function to inject assets into code
function injectAssets(code, assets) {
    if (assets.size === 0) return code;
    
    // Create individual functions for each asset
    let assetCode = '\n// === EMBEDDED ASSETS ===\n';
    
    for (const [originalPath, dataURL] of assets.entries()) {
        // Create a safe function name from the path
        const safeName = `__asset_${Buffer.from(originalPath).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')}__`;
        assetCode += `spatula ${safeName}() {\n    twinkie_wiener_sandwich "${dataURL}";\n}\n\n`;
        
        // Replace the specific path with the function call
        code = code.replace(
            new RegExp(`fat_frame\\s*\\(\\s*["']${originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g'),
            `fat_frame(${safeName}()`
        );
    }
    
    return assetCode + code;
}

const USER_IMPORT_REGEX = /^#eat\s*(?:"([^"]+)"|([a-zA-Z0-9_.\-/]+\.(?:hat|yc)))/gm;

async function preprocessCode(filePath, processedFiles = new Set()) {
    const absolutePath = path.resolve(filePath);
    if (processedFiles.has(absolutePath)) {
        return ''; // Avoid circular imports
    }
    processedFiles.add(absolutePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`\n💥 FATAL WORD CRIME: File Not Found 💥\n\nAl says: "I couldn't find the main file to run!"\n\n   Path: ${absolutePath}\n`);
    }

    let code = fs.readFileSync(absolutePath, 'utf-8');
    const directoryOfCurrentFile = path.dirname(absolutePath);

    // We must use a temporary array and replace in a second pass
    // to avoid issues with modifying the string while iterating over regex matches.
    const replacements = [];

    let match;
    while ((match = USER_IMPORT_REGEX.exec(code)) !== null) {
        const importRelativePath = match[1] || match[2];
        
        // This is the robust way to get the correct absolute path of the import
        const importAbsolutePath = path.resolve(directoryOfCurrentFile, importRelativePath);

        if (!fs.existsSync(importAbsolutePath)) {
            throw new Error(`\n💥 FATAL WORD CRIME: Import Not Found 💥\n\nAl says: "I went to the hardware store, but couldn't find this file!"\n\n   Required in: ${absolutePath}\n   Missing file:  ${importAbsolutePath}\n`);
        }
        
        const importedCode = await preprocessCode(importAbsolutePath, processedFiles);
        replacements.push({
            from: match[0],
            to: `// Pre-processed: ${match[0]}\n${importedCode}`
        });
    }

    // Apply all replacements
    for (const rep of replacements) {
        code = code.replace(rep.from, rep.to);
    }

    return code;
}

// Function to detect if a program uses UHF graphics
function detectUHFUsage(code) {
    const uhfFunctions = [
        'start_the_show', 'paint_the_set', 'pick_a_hawaiian_shirt', 
        'draw_a_spamsicle', 'draw_a_big_ol_wheel_of_cheese', 'print_a_string_at',
        'fat_frame', 'Lossless_Laughter', 'roll_the_camera', 'that_is_a_wrap'
    ];
    
    return uhfFunctions.some(func => code.includes(func));
}

async function main() {
  const args = process.argv.slice(2);

  // --- Handle --help flag ---
  if (args.includes('--help') || args.includes('-h')) {
    console.error('🎵 YankoviC CLI - The Accordion Programming Language 🎵');
    console.error('');
    console.error('Usage: yankovic <path/to/file.yc> [options]');
    console.error('       yankovic --accordion');
    console.error('       yankovic --help');
    console.error('');
    console.error('📺 UHF Channel Options (Display Modes):');
    console.error('  --channel=1   or --headless   📻 API Mode (No Display)');
    console.error('  --channel=3   or --ascii      🖥️  Terminal ASCII Display');
    console.error('  --channel=13  or --png        🖼️  PNG File Output');
    console.error('  --channel=62  or --electron   📺 Standard Display Mode (default for UHF programs)');
    console.error('');
    console.error('🎨 ASCII Display Options:');
    console.error('  --hires                       🌈 High-Resolution Terminal Display');
    console.error('                                   (24-bit color, Unicode blocks)');
    console.error('');
    console.error('⚙️ Other Options:');
    console.error('  --max-frames=N: Limit number of frames (default: unlimited)');
    console.error('  --accordion: Launch the Accordion IDE (Electron app)');
    console.error('');
    console.error('🎸 Examples:');
    console.error('  yankovic examples/calculator.yc --ascii');
    console.error('  yankovic examples/calculator.yc --ascii --hires');
    console.error('  yankovic --accordion');
    console.error('');
    process.exit(0);
  }

  // --- Handle --accordion flag ---
  if (args.includes('--accordion')) {
    // Cross-platform: Start backend, then frontend, then Electron
    const { spawn } = await import('child_process');
    const { fileURLToPath } = await import('url');
    const path = await import('path');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Helper to spawn a process and return the child
    function runProc(cmd, args, cwd) {
      return spawn(cmd, args, {
        cwd,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
    }

    // Start backend
    console.log('🎶 Starting Local File API Backend...');
    const backendProc = runProc('npm', ['start'], path.join(__dirname, 'backend'));
    // Start frontend
    console.log('🎨 Starting React Frontend (Vite Dev Server)...');
    const frontendProc = runProc('npm', ['run', 'dev'], path.join(__dirname, 'frontend'));

    // Wait a few seconds for servers to start
    await new Promise(r => setTimeout(r, 5000));

    // Start Electron
    console.log('🚀 Launching The Accordion IDE (Electron App)...');
    const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
    const electronAppPath = path.join(__dirname, 'electron', 'main.cjs');
    const electronProc = runProc(electronPath, [electronAppPath], __dirname);

    // Cleanup on exit
    function cleanup() {
      console.log('Shutting down servers...');
      if (backendProc && !backendProc.killed) backendProc.kill();
      if (frontendProc && !frontendProc.killed) frontendProc.kill();
      if (electronProc && !electronProc.killed) electronProc.kill();
      process.exit();
    }
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    electronProc.on('close', cleanup);
    return;
  }
  
  const filePath = path.resolve(process.cwd(), args[0]);
  
  // Read file content to detect UHF usage
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const usesUHF = detectUHFUsage(fileContent);
  
  // Parse UHF channel from arguments
  let channel = usesUHF ? UHF_CHANNELS.ELECTRON : UHF_CHANNELS.ASCII; // Default to Electron for UHF programs, ASCII for others
  
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
    // console.log('[UHF Channel 62] Pre-processing code...');
    let processedCode;
    try {
        processedCode = await preprocessCode(filePath);
    } catch (error) {
        console.error(error.message); // Print our nicely formatted error
        process.exit(1); // Exit immediately
    }
    
    // Scan for assets and embed them
    const assets = scanForAssets(processedCode, filePath);
    if (assets.size > 0) {
      processedCode = injectAssets(processedCode, assets);
    } else {
    }
    
    // console.log('[UHF Channel 62] Launching dedicated YankoviC application window...');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const backendProc = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'pipe', // Pipe stdout/stderr so we can see it
        shell: process.platform === 'win32',
    });

    backendProc.stdout.on('data', (data) => console.log(`[Backend]: ${data.toString().trim()}`));
    backendProc.stderr.on('data', (data) => console.error(`[Backend ERR]: ${data.toString().trim()}`));

    const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
    const env = { ...process.env, YANKOVIC_CLI_CODE: processedCode };

    const electronProcess = spawn(electronPath, [path.join(__dirname, 'electron/cli-runner.cjs')], {
        stdio: 'inherit',
        env: env
    });

    electronProcess.on('close', (code) => {
        // console.log(`[UHF Channel 62] Application window closed with exit code ${code}.`);
        process.exit(code);
    });

    return; // Exit the CLI script, Electron is now in charge.
  }

  // --- Logic for non-Electron modes (ASCII, PNG, Headless) ---
  
  // Add support for .ycw files
  if (args[0].endsWith('.ycw')) {
    // console.log('Processing YankoviC Web file:', args[0]);
    const code = await preprocessCode(args[0]);
    const interpreter = new YankoviCInterpreter({
        printFunction: (text) => process.stdout.write(text + '\\n'),
        streamPrintFunction: (text) => {
            console.error(`[STREAMING] ${text}`);
            process.stdout.write(text);
        },
        inputFunction: promptUser
    });
    await interpreter.run(code);
    return;
  }
  
  const code = fs.readFileSync(filePath, 'utf-8');
  const interpreter = new YankoviCInterpreter({
      printFunction: (text) => process.stdout.write(text + '\\n'),
      streamPrintFunction: (text) => {
          console.error(`[STREAMING] ${text}`);
          process.stdout.write(text);
      },
      inputFunction: promptUser
  });
  
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
    // console.log(`[CLI] Graphics mode enabled - UHF Channel ${renderer.getChannelNumber()}`);
  }
  
  // console.log('=== INITIAL PROGRAM EXECUTION ===');
  const { output, exitCode } = await interpreter.run(code);
  // console.log(output);
  
  interpreter.outputBuffer = [];
  
  if (interpreter.polkaLoop) {
    // console.log('\n=== POLKA LOOP FRAME EXECUTION ===');
    let frameResult;
    
    while ((frameResult = await interpreter.runFrame()) !== null && (maxFrames === null || interpreter.frameCount <= maxFrames)) {
      if (renderer && frameResult && frameResult.length > 0) {
        renderer.executeDrawCommands(frameResult);
      }
      
      const frameLogs = interpreter.outputBuffer.slice();
      interpreter.outputBuffer = [];
      
      if (frameLogs.length > 0 && frameLogs.some(log => !log.includes('test result:'))) {
        // console.log(`Frame ${interpreter.frameCount} logs:`, frameLogs.join('; '));
      }
      
      if (renderer && channel !== UHF_CHANNELS.HEADLESS) {
        await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
      }
    }
    
    if (maxFrames !== null && interpreter.frameCount > maxFrames) {
      // console.log(`--- Frame limit reached (${maxFrames} frames) ---`);
    } else {
      // console.log('--- Polka loop finished naturally ---');
    }
    
    if (renderer) {
      if(channel === UHF_CHANNELS.PNG) await renderer.createAnimation();
      renderer.cleanup();
    }
  }
  process.exit(exitCode);
}

async function promptUser(promptText) {
    const readline = await import('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(promptText, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

main().catch(err => {
  console.error('CLI Error:', err);
  process.exit(1);
});