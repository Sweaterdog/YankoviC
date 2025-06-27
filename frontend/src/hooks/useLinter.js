import { useEffect } from 'react';
import { toast } from 'react-toastify';

const lintingMocks = {
    MISSING_SEMICOLON: "You're about as useful as a screen door on a battleship! You missed a semicolon.",
    BAD_VARIABLE_NAME: (name) => `A variable named '${name}'? That's not just wrong, it's tacky! Try something more descriptive.`,
};

let toastCooldown = {};

export const useLinter = (code, filename, monaco) => {
  useEffect(() => {
    // THIS IS THE BULLETPROOF GUARD CLAUSE.
    // It will not proceed until monaco, monaco.editor, and the specific
    // MarkerSeverity enum are all confirmed to exist. This resolves the race condition.
    if (!monaco || !monaco.editor || !monaco.editor.MarkerSeverity) {
        return;
    }

    const model = monaco.editor.getModels().find(m => m.uri.path.endsWith(filename));
    if (!model) {
        // Clear markers for the previous model if it's been removed
        monaco.editor.setModelMarkers(monaco.editor.getModels()[0], 'yankovic-linter', []);
        return;
    }

    const markers = [];
    const lines = code.split('\n');
    
    lines.forEach((line, i) => {
        // Rule: Missing Semicolon
        if (line.trim().length > 0 && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.startsWith('//') && !line.startsWith('#')) {
            markers.push({
                message: "This line looks like it's missing a semicolon. Don't be a word criminal.",
                severity: monaco.editor.MarkerSeverity.Error, // This is now safe to access
                startLineNumber: i + 1,
                startColumn: line.trimEnd().length + 1,
                endLineNumber: i + 1,
                endColumn: line.trimEnd().length + 2,
            });
            if (!toastCooldown['semi']) {
                toast.error(lintingMocks.MISSING_SEMICOLON);
                toastCooldown['semi'] = true;
                setTimeout(() => delete toastCooldown['semi'], 10000);
            }
        }

        // Rule: Bad Variable Name
        if (line.match(/\b(spatula|verse)\s+(i|x|y|temp|data)\s*=/)) {
            const badName = line.match(/\b(i|x|y|temp|data)\b/)[0];
            markers.push({
                message: `The variable name '${badName}' is uninspired. Dare to be stupid(er)!`,
                severity: monaco.editor.MarkerSeverity.Warning, // This is also safe now
                startLineNumber: i + 1,
                startColumn: line.indexOf(badName) + 1,
                endLineNumber: i + 1,
                endColumn: line.indexOf(badName) + 1 + badName.length,
            });
             if (!toastCooldown['badname']) {
                toast.warn(lintingMocks.BAD_VARIABLE_NAME(badName));
                toastCooldown['badname'] = true;
                setTimeout(() => delete toastCooldown['badname'], 15000);
            }
        }
    });
    
    monaco.editor.setModelMarkers(model, 'yankovic-linter', markers);

  }, [code, filename, monaco]);
};