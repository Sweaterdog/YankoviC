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

// --- ADDED LOG ---


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
    const fatFrameRegex = /fat_frame\s*\(\s*["']([^"']+)["']/g;
    let match;
    while ((match = fatFrameRegex.exec(code)) !== null) {
        const assetPath = match[1];
        let resolvedPath = path.isAbsolute(assetPath) ? assetPath : path.resolve(path.dirname(basePath), assetPath);
        if (fs.existsSync(resolvedPath)) {
            try {
                const fileData = fs.readFileSync(resolvedPath);
                const ext = path.extname(resolvedPath).toLowerCase();
                let mimeType = 'application/octet-stream';
                switch (ext) {
                    case '.jpg': case '.jpeg': mimeType = 'image/jpeg'; break;
                    case '.png': mimeType = 'image/png'; break;
                    case '.gif': mimeType = 'image/gif'; break;
                    case '.webp': mimeType = 'image/webp'; break;
                    case '.svg': mimeType = 'image/svg+xml'; break;
                }
                const base64Data = fileData.toString('base64');
                const dataURL = `data:${mimeType};base64,${base64Data}`;
                assets.set(assetPath, dataURL);
            } catch (error) {
                 console.warn(`⚠️  Could not read asset: ${resolvedPath}`);
            }
        }
    }
    return assets;
}

function injectAssets(code, assets) {
    if (assets.size === 0) return code;
    let assetCode = '\n// === EMBEDDED ASSETS ===\n';
    for (const [originalPath, dataURL] of assets.entries()) {
        const safeName = `__asset_${Buffer.from(originalPath).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')}__`;
        assetCode += `spatula ${safeName}() {\n    twinkie_wiener_sandwich "${dataURL}";\n}\n\n`;
        code = code.replace( new RegExp(`fat_frame\\s*\\(\\s*["']${originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g'), `fat_frame(${safeName}()`);
    }
    return assetCode + code;
}

// --- NEW: Pre-processor function to resolve #eat directives ---
const USER_IMPORT_REGEX = /^#eat\s*(?:"([^"]+)"|([a-zA-Z0-9_.\-/]+\.(?:hat|yc)))/gm;

async function preprocessCode(filePath, processedFiles = new Set()) {
    const absolutePath = path.resolve(filePath);
    if (processedFiles.has(absolutePath)) {
        return `// Circular import of ${path.basename(absolutePath)} skipped\n`;
    }
    processedFiles.add(absolutePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`\n💥 FATAL WORD CRIME: Import Not Found 💥\n\nAl says: "I couldn't find the file to run!"\n\n   Path: ${absolutePath}\n`);
    }

    const codeLines = fs.readFileSync(absolutePath, 'utf-8').split('\n');
    const directoryOfCurrentFile = path.dirname(absolutePath);
    const outputCode = [];

    const importRegex = /^#eat\s*(?:"([^"]+)"|([a-zA-Z0-9_.\-/]+\.(?:hat|yc)))/;

    for (const line of codeLines) {
        const match = line.trim().match(importRegex);
        if (match) {
            const importRelativePath = match[1] || match[2];
            const importAbsolutePath = path.resolve(directoryOfCurrentFile, importRelativePath);
            
            outputCode.push(`// Pre-processed: ${line.trim()}`);
            const importedCode = await preprocessCode(importAbsolutePath, new Set(processedFiles)); // Pass a copy of the set
            outputCode.push(importedCode);
        } else {
            outputCode.push(line);
        }
    }

    return outputCode.join('\n');
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

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.error('🎵 YankoviC CLI - The Accordion Programming Language 🎵');
    console.error('\nUsage: yankovic <path/to/file.yc> [options]');
    console.error('       yankovic --accordion');
    console.error('\n📺 UHF Channel Options (Display Modes):');
    console.error('  --channel=62  or --electron   📺 Standard Display Mode (default for UHF programs)');
    console.error('  --channel=13  or --png        🖼️  PNG File Output');
    console.error('  --channel=3   or --ascii      🖥️  Terminal ASCII Display');
    console.error('  --channel=1   or --headless   📻 API Mode (No Display)');
    console.error('\n🎨 ASCII Display Options:');
    console.error('  --hires                       🌈 High-Resolution Terminal Display');
    console.error('\n⚙️ Other Options:');
    console.error('  --max-frames=N: Limit number of frames (default: unlimited)');
    console.error('  --accordion: Launch the Accordion IDE (Electron app)');
    process.exit(0);
  }

  if (args.includes('--accordion')) {
    console.log('Starting Accordion IDE...');
    // Accordion launch logic...
    return;
  }
  
  const filePath = path.resolve(process.cwd(), args[0]);
  console.log(`[TRACE] main: File path resolved to ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const usesUHF = detectUHFUsage(fileContent);
  
  let channel = usesUHF ? UHF_CHANNELS.ELECTRON : UHF_CHANNELS.ASCII;
  
  if (args.includes('--headless') || args.includes('--channel=1')) channel = UHF_CHANNELS.HEADLESS;
  else if (args.includes('--ascii') || args.includes('--channel=3')) channel = UHF_CHANNELS.ASCII;
  else if (args.includes('--png') || args.includes('--channel=13') || args.includes('--graphics')) channel = UHF_CHANNELS.PNG;
  else if (args.includes('--electron') || args.includes('--channel=62')) channel = UHF_CHANNELS.ELECTRON;
  
  
  const maxFramesArg = args.find(arg => arg.startsWith('--max-frames='));
  const maxFrames = maxFramesArg ? parseInt(maxFramesArg.split('=')[1]) : null;
  
  if (channel === UHF_CHANNELS.ELECTRON) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    let processedCode;
    try {
        processedCode = await preprocessCode(filePath);
    } catch (error) {
        console.error(error.message); // Print our nicely formatted error
        process.exit(1); // Exit immediately
    }

    const assets = scanForAssets(processedCode, filePath);
    if (assets.size > 0) {
        processedCode = injectAssets(processedCode, assets);
    } else {
    }
    
    const backendProc = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'pipe',
        shell: process.platform === 'win32',
    });
    backendProc.stdout.on('data', (data) => console.log(`[Backend]: ${data.toString().trim()}`));
    backendProc.stderr.on('data', (data) => console.error(`[Backend ERR]: ${data.toString().trim()}`));
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Give server a moment to start

    const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
    const env = { ...process.env, YANKOVIC_CLI_CODE: processedCode };

    const electronProcess = spawn(electronPath, [path.join(__dirname, 'electron/cli-runner.cjs')], {
        stdio: 'inherit',
        env: env
    });

    electronProcess.on('close', (code) => {
        console.log(`[TRACE] main: Electron process closed with code ${code}.`);
        if (backendProc && !backendProc.killed) {
            backendProc.kill();
        }
        process.exit(code || 0);
    });
    return;
  }
  
  // --- Logic for non-Electron modes ---
  const code = fs.readFileSync(filePath, 'utf-8');
  const interpreter = new YankoviCInterpreter({
      printFunction: (text) => process.stdout.write(text + '\n'),
      inputFunction: promptUser
  });
  
  let renderer = null;
  if (channel !== UHF_CHANNELS.HEADLESS) {
    renderer = new CLIGraphicsRenderer(800, 600, channel);
  }
  
  const { output, exitCode } = await interpreter.run(code);
  
  if (interpreter.polkaLoop) {
    let frameResult;
    while ((frameResult = await interpreter.runFrame()) !== null && (maxFrames === null || interpreter.frameCount <= maxFrames)) {
      if (renderer && frameResult && frameResult.length > 0) {
        renderer.executeDrawCommands(frameResult);
      }
      if (renderer && channel !== UHF_CHANNELS.HEADLESS) {
        await new Promise(resolve => setTimeout(resolve, 16));
      }
    }
    if (renderer) renderer.cleanup();
  }
  process.exit(exitCode);
}

async function promptUser(promptText) {
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(promptText, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

main().catch(err => {
  console.error('[TRACE] main: CATCH BLOCK! A fatal unhandled error occurred.');
  console.error(err);
  process.exit(1);
});