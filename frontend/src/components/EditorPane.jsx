import React, { useState, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import styled from 'styled-components';
import { useYankoviC } from '../hooks/useYankoviC';
import { useLinter } from '../hooks/useLinter';
import { defineThemes } from '../styles/themes';
import { getAiCodeCompletion } from '../core/aiService';

const EditorWrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 10;
  font-family: monospace;
  pointer-events: none;
`;

function EditorPane({ activeFile, code, onCodeChange, config }) {
  const [editorTheme, setEditorTheme] = useState('yankovic-dark');
  const [isCompleting, setIsCompleting] = useState(false);
  const monaco = useMonaco();
  const editorRef = useRef(null);

  useYankoviC(monaco);
  useLinter(code, activeFile, monaco);

  const handleThemeChange = (newTheme) => {
    setEditorTheme(newTheme);
    if (monaco) {
        monaco.editor.setTheme(newTheme);
    }
  };
  
  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    defineThemes(monacoInstance);

    // --- AI TAB COMPLETION LOGIC ---
    editor.addCommand(monacoInstance.KeyCode.Tab, async () => {
        if (isCompleting) return;

        setIsCompleting(true);
        const model = editor.getModel();
        const position = editor.getPosition();
        
        // We send the code up to the cursor for completion
        const codeUntilCursor = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });
        
        // The rest of the code after the cursor
        const codeAfterCursor = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: model.getLineCount(),
            endColumn: model.getLineMaxColumn(model.getLineCount())
        });

        // A special marker for the AI to know where the cursor is
        const fullCodeWithCursorMarker = `${codeUntilCursor}__CURSOR__${codeAfterCursor}`;

        try {
            const completion = await getAiCodeCompletion(fullCodeWithCursorMarker, config);
            
            // Insert the completion text
            editor.executeEdits('ai-completer', [{
                range: new monacoInstance.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: completion
            }]);

        } catch (error) {
            console.error("Tab completion failed:", error);
        } finally {
            setIsCompleting(false);
        }

    }, '!suggestWidgetVisible'); // Only run when suggestions are not visible

  };

  return (
    <EditorWrapper>
        {isCompleting && <LoadingOverlay>Al is thinking...</LoadingOverlay>}
        <div style={{ padding: '5px', backgroundColor: '#333' }}>
            <label htmlFor="theme-select">Theme: </label>
            <select id="theme-select" value={editorTheme} onChange={e => handleThemeChange(e.target.value)}>
            <option value="yankovic-dark">Albuquerque by Night (Dark)</option>
            <option value="poodle-hat">Poodle Hat</option>
            <option value="uhf-mode">UHF Mode</option>
            <option value="dare-to-be-stupid">Dare to be Stupid</option>
            </select>
        </div>
        <Editor
            height="calc(100% - 35px)" // Adjust height for the theme selector
            language="yankovic"
            theme={editorTheme}
            value={code}
            onChange={onCodeChange}
            onMount={handleEditorDidMount}
            path={activeFile}
            options={{
            wordWrap: 'on',
            minimap: { enabled: true },
            fontSize: 14,
            tabCompletion: 'off', // Turn off default tab completion
            }}
        />
    </EditorWrapper>
  );
}

export default EditorPane;