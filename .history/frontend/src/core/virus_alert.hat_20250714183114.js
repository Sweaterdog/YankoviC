// This file is the JavaScript implementation of the virus_alert.hat standard library.
// "Virus Alert! Delete immediately before someone gets hurt!"
// Operating system functions themed around the infamous "Virus Alert" song.

// Removed console.log statement for Virus Alert library loading.

// Helper function to get file system API (Node.js/Electron context)
function getFileSystemAPI() {
    if (typeof window !== 'undefined' && window.require) {
        try {
            const fs = window.require('fs');
            const path = window.require('path');
            const os = window.require('os');
            const { exec } = window.require('child_process');
            return { fs, path, os, exec };
        } catch (e) {
            console.warn('File system API not available in this context');
            return null;
        }
    }
    return null;
}

// Weighted random function for virus count (heavily weighted towards 0)
function getVirusCountRandom() {
    const rand = Math.random();
    if (rand < 0.85) return 0;  // 85% chance of 0
    if (rand < 0.95) return 1;  // 10% chance of 1
    if (rand < 0.99) return 2;  // 4% chance of 2
    return 3;                   // 1% chance of 3
}

export const VIRUS_ALERT_LIBRARY = {
    // === FILE OPERATIONS ===
    // Handle files with paranoid precision!
    
    legally_named_reggie: {
        type: 'NativeFunction',
        call: (args) => {
            const [oldName, newName] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would rename "${oldName}" to "${newName}" (simulation mode)`);
                return true;
            }
            try {
                api.fs.renameSync(oldName, newName);
                console.log(`[VIRUS_ALERT] File legally renamed to: ${newName}`);
                return true;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to rename file: ${error.message}`);
                return false;
            }
        }
    },

    stinky_cheese: {
        type: 'NativeFunction',
        call: (args) => {
            const [filename] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would delete "${filename}" (simulation mode)`);
                return true;
            }
            try {
                api.fs.unlinkSync(filename);
                console.log(`[VIRUS_ALERT] Stinky file deleted: ${filename}`);
                return true;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to delete file: ${error.message}`);
                return false;
            }
        }
    },

    forward_to_a_friend: {
        type: 'NativeFunction',
        call: (args) => {
            const [source, destination] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would copy "${source}" to "${destination}" (simulation mode)`);
                return true;
            }
            try {
                api.fs.copyFileSync(source, destination);
                console.log(`[VIRUS_ALERT] File forwarded to: ${destination}`);
                return true;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to copy file: ${error.message}`);
                return false;
            }
        }
    },

    check_your_hard_drive: {
        type: 'NativeFunction',
        call: (args) => {
            const [filepath] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would check "${filepath}" (simulation mode)`);
                return { exists: true, size: 1024, modified: new Date().toISOString() };
            }
            try {
                const stats = api.fs.statSync(filepath);
                return {
                    exists: true,
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    isDirectory: stats.isDirectory(),
                    isFile: stats.isFile()
                };
            } catch (error) {
                return { exists: false };
            }
        }
    },

    open_every_file: {
        type: 'NativeFunction',
        call: (args) => {
            const [directory] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would list files in "${directory}" (simulation mode)`);
                return ['file1.txt', 'file2.txt', 'suspicious.exe'];
            }
            try {
                const files = api.fs.readdirSync(directory);
                console.log(`[VIRUS_ALERT] Found ${files.length} files in ${directory}`);
                return files;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to read directory: ${error.message}`);
                return [];
            }
        }
    },

    really_big_attachment: {
        type: 'NativeFunction',
        call: (args) => {
            const [filename] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would check size of "${filename}" (simulation mode)`);
                return 1024000; // 1MB simulation
            }
            try {
                const stats = api.fs.statSync(filename);
                return stats.size;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to get file size: ${error.message}`);
                return 0;
            }
        }
    },

    // === DIRECTORY OPERATIONS ===
    
    make_a_backup_folder: {
        type: 'NativeFunction',
        call: (args) => {
            const [dirname] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would create directory "${dirname}" (simulation mode)`);
                return true;
            }
            try {
                api.fs.mkdirSync(dirname, { recursive: true });
                console.log(`[VIRUS_ALERT] Backup folder created: ${dirname}`);
                return true;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to create directory: ${error.message}`);
                return false;
            }
        }
    },

    delete_your_homework: {
        type: 'NativeFunction',
        call: (args) => {
            const [dirname] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would delete directory "${dirname}" (simulation mode)`);
                return true;
            }
            try {
                api.fs.rmdirSync(dirname);
                console.log(`[VIRUS_ALERT] Directory deleted: ${dirname}`);
                return true;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to delete directory: ${error.message}`);
                return false;
            }
        }
    },

    change_your_password_location: {
        type: 'NativeFunction',
        call: (args) => {
            const [path] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would change to directory "${path}" (simulation mode)`);
                return true;
            }
            try {
                process.chdir(path);
                console.log(`[VIRUS_ALERT] Changed to directory: ${path}`);
                return true;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to change directory: ${error.message}`);
                return false;
            }
        }
    },

    where_am_i_now: {
        type: 'NativeFunction',
        call: () => {
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Current directory (simulation): /home/user`);
                return '/home/user';
            }
            return process.cwd();
        }
    },

    // === PROCESS OPERATIONS ===
    
    run_suspicious_program: {
        type: 'NativeFunction',
        call: (args) => {
            const [command] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would run command "${command}" (simulation mode)`);
                return 'Command executed (simulation)';
            }
            return new Promise((resolve) => {
                api.exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[VIRUS_ALERT] Command failed: ${error.message}`);
                        resolve(`Error: ${error.message}`);
                    } else {
                        resolve(stdout || stderr || 'Command completed');
                    }
                });
            });
        }
    },

    terminate_everything: {
        type: 'NativeFunction',
        call: () => {
            console.log('[VIRUS_ALERT] PANIC BUTTON ACTIVATED! Terminating...');
            if (typeof process !== 'undefined') {
                process.exit(1);
            } else {
                // In browser context, we can't actually exit
                throw new Error('VIRUS_ALERT: Emergency termination!');
            }
        }
    },

    check_running_programs: {
        type: 'NativeFunction',
        call: () => {
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Running programs (simulation): chrome, vscode, suspicious.exe`);
                return ['chrome', 'vscode', 'suspicious.exe'];
            }
            // This would require platform-specific commands
            return new Promise((resolve) => {
                const command = process.platform === 'win32' ? 'tasklist' : 'ps aux';
                api.exec(command, (error, stdout) => {
                    if (error) {
                        resolve(['Error getting process list']);
                    } else {
                        resolve(stdout.split('\n').slice(0, 10)); // First 10 lines
                    }
                });
            });
        }
    },

    kill_the_process: {
        type: 'NativeFunction',
        call: (args) => {
            const [pid] = args;
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Would kill process ${pid} (simulation mode)`);
                return true;
            }
            try {
                process.kill(pid);
                console.log(`[VIRUS_ALERT] Process ${pid} terminated!`);
                return true;
            } catch (error) {
                console.error(`[VIRUS_ALERT] Failed to kill process: ${error.message}`);
                return false;
            }
        }
    },

    // === SYSTEM INFORMATION ===
    
    scan_your_system: {
        type: 'NativeFunction',
        call: () => {
            const api = getFileSystemAPI();
            if (!api) {
                return {
                    platform: 'simulation',
                    arch: 'x64',
                    memory: '8GB',
                    uptime: '24 hours'
                };
            }
            return {
                platform: api.os.platform(),
                arch: api.os.arch(),
                memory: `${Math.round(api.os.totalmem() / 1024 / 1024 / 1024)}GB`,
                uptime: `${Math.round(api.os.uptime() / 3600)} hours`
            };
        }
    },

    check_available_memory: {
        type: 'NativeFunction',
        call: () => {
            const api = getFileSystemAPI();
            if (!api) {
                console.log(`[VIRUS_ALERT] Available memory (simulation): 4GB`);
                return 4 * 1024 * 1024 * 1024; // 4GB in bytes
            }
            return api.os.freemem();
        }
    },

    get_virus_count: {
        type: 'NativeFunction',
        call: () => {
            const count = getVirusCountRandom();
            console.log(`[VIRUS_ALERT] Virus scan complete: ${count} threats detected`);
            return count;
        }
    },

    format_your_hard_drive: {
        type: 'NativeFunction',
        call: () => {
            console.log('[VIRUS_ALERT] JUST KIDDING! Not actually formatting anything!');
            console.log('[VIRUS_ALERT] This function is safe - it does absolutely nothing!');
            return 'Phew! Your data is safe. This was just a joke function!';
        }
    },

    // === NETWORK OPERATIONS ===
    
    send_to_everyone_you_know: {
        type: 'NativeFunction',
        call: (args) => {
            const [message] = args;
            console.log(`[VIRUS_ALERT] Simulating broadcast: "${message}"`);
            console.log('[VIRUS_ALERT] (Not actually sending to anyone - this is safe!)');
            return 'Message broadcast simulated (safely)';
        }
    },

    disconnect_the_internet: {
        type: 'NativeFunction',
        call: () => {
            console.log('[VIRUS_ALERT] Simulating internet disconnection...');
            console.log('[VIRUS_ALERT] (Your internet is still connected - this is just for fun!)');
            return 'Internet "disconnected" (simulation only)';
        }
    },

    check_suspicious_traffic: {
        type: 'NativeFunction',
        call: () => {
            const suspiciousCount = Math.floor(Math.random() * 5);
            console.log(`[VIRUS_ALERT] Network scan complete: ${suspiciousCount} suspicious connections found`);
            return {
                suspicious_connections: suspiciousCount,
                total_connections: Math.floor(Math.random() * 50) + 10,
                status: suspiciousCount > 2 ? 'ALERT' : 'OK'
            };
        }
    }
};
