// The unused import has been removed from this file.

const randomHex = () => `#${Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0')}`;

export const defineThemes = (monaco) => {
    // Standard Dark Mode
    monaco.editor.defineTheme('yankovic-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword.control.yankovic', foreground: 'c586c0' },
            { token: 'keyword.type.yankovic', foreground: '4ec9b0' },
            { token: 'keyword.return.yankovic', foreground: 'd16969' },
            { token: 'keyword.const.yankovic', foreground: '569cd6' },
            { token: 'function.yankovic', foreground: 'dcdcaa' },
        ],
        colors: {
            'editor.background': '#1e1e1e',
        },
    });

    // Poodle Hat Mode
    monaco.editor.defineTheme('poodle-hat', {
        base: 'vs-dark',
        inherit: false,
        rules: [
            { token: '', foreground: 'ffffff', background: '000000' },
            { token: 'keyword.control.yankovic', foreground: 'ff0000', fontStyle: 'bold' },
            { token: 'keyword.type.yankovic', foreground: 'ff0000' },
            { token: 'keyword.return.yankovic', foreground: 'ff0000' },
            { token: 'keyword.const.yankovic', foreground: 'ff0000' },
            { token: 'string', foreground: 'e0e0e0' },
            { token: 'number', foreground: 'e0e0e0' },
            { token: 'comment', foreground: '888888', fontStyle: 'italic' },
            { token: 'identifier', foreground: 'ffffff' },
            { token: 'function.yankovic', foreground: 'ffffff', fontStyle: 'bold' },

        ],
        colors: {
            'editor.background': '#000000',
            'editor.foreground': '#ffffff',
            'editorCursor.foreground': '#ff0000',
            'editor.lineHighlightBackground': '#220000',
            'editor.selectionBackground': '#ff0000',
            'editor.selectionForeground': '#000000',
        },
    });

    // UHF Mode
    monaco.editor.defineTheme('uhf-mode', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'keyword.control.yankovic', foreground: 'FF4F00' }, // Orange
            { token: 'keyword.type.yankovic', foreground: '00A9E0' }, // Blue
            { token: 'keyword.return.yankovic', foreground: '9C27B0' }, // Purple
            { token: 'keyword.const.yankovic', foreground: 'FFEB3B' }, // Yellow
            { token: 'function.yankovic', foreground: '4CAF50' }, // Green
            { token: 'string', foreground: '333333'},
        ],
        colors: {
            'editor.background': '#E6E6E6', // Light gray, like an old TV
            'editor.foreground': '#212121',
            'editorCursor.foreground': '#FF4F00',
            'editor.lineHighlightBackground': '#D1D1D1',
        },
    });

    // Dare to be Stupid Mode (dynamic theme)
    const generateStupidTheme = () => ({
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword.control.yankovic', foreground: randomHex() },
            { token: 'keyword.type.yankovic', foreground: randomHex() },
            { token: 'keyword.return.yankovic', foreground: randomHex() },
            { token: 'keyword.const.yankovic', foreground: randomHex() },
            { token: 'function.yankovic', foreground: randomHex() },
            { token: 'string', foreground: randomHex() },
            { token: 'number', foreground: randomHex() },
            { token: 'comment', foreground: randomHex() },
            { token: 'identifier', foreground: randomHex() },
        ],
        colors: { 'editor.background': randomHex() },
    });
    
    // We register a placeholder and will update it dynamically
    monaco.editor.defineTheme('dare-to-be-stupid', generateStupidTheme());

    return { generateStupidTheme };
};