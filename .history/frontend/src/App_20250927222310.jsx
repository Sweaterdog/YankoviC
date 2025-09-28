import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import FileExplorer from './components/FileExplorer';
import EditorPane from './components/EditorPane';
import Console from './components/Console';
import AiAssistant from './components/AiAssistant';
import Debugger from './components/Debugger';
import { YankoviCInterpreter } from './core/yankovicInterpreter';
import { WebUHFRenderer } from './core/webUHF';
import { toast } from 'react-toastify';
import { getProjectStructure, getFileContent, saveFileContent, execCommand } from './core/fileApiService';

const AppGrid = styled.div`
  display: grid;
  height: 100vh;
  width: 100vw;
  background-color: #1e1e1e;
  color: #d4d4d4;
  grid-template-columns: ${props => props.$layout.explorer ? '250px' : '40px'} 1fr ${props => props.$layout.ai ? '400px' : '40px'};
  grid-template-rows: 1fr ${props => props.$layout.console ? '250px' : '40px'};
  grid-template-areas:
    "explorer editor ai"
    "explorer console ai";
  transition: all 0.2s ease-in-out;
`;

const Panel = styled.div`
  background-color: #252526;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const SidebarPanel = styled(Panel)` grid-area: explorer; `;
const EditorPanel = styled(Panel)` grid-area: editor; background-color: #1e1e1e; `;
const ConsolePanel = styled(Panel)` grid-area: console; `;
const AiPanel = styled(Panel)` grid-area: ai; `;

function App() {
  const [config, setConfig] = useState(null);
  const [projectStructure, setProjectStructure] = useState(null);
  const [activeFile, setActiveFile] = useState({ path: null, content: '', originalContent: '' });
  const [consoleOutput, setConsoleOutput] = useState('Welcome to The Accordion!\n');
  const [debuggerState, setDebuggerState] = useState('thinking');
  const [layout, setLayout] = useState({ explorer: true, console: true, ai: true });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoopRunning, setIsLoopRunning] = useState(false);
  const [terminalSessionId, setTerminalSessionId] = useState(() => localStorage.getItem('terminalSessionId') || null);
  const [terminalCwd, setTerminalCwd] = useState(null);

  const interpreterRef = useRef(new YankoviCInterpreter());
  const webUHFRef = useRef(new WebUHFRenderer());

  const projectName = 'default-project';

  const preprocessForIDE = async (entryCode, entryPath, project) => {
    let finalCode = '';
    const processedFiles = new Set();

    async function processFile(code, filePath) {
      const absolutePath = filePath; // In IDE context, paths are project-relative
      if (processedFiles.has(absolutePath)) return;
      processedFiles.add(absolutePath);

      const lines = code.split('\n');
      for (const line of lines) {
        const match = line.trim().match(/^#eat\s*(?:<(.+?)>|"([^"]*)"|([a-zA-Z0-9_.\-/]+\.(?:hat|yc)))/);
        if (match) {
          const importIdentifier = match[1] || match[2] || match[3];
          const isBuiltIn = ['uhf', 'albuquerque', 'like_a_server', 'weird_wide_web', 'virus_alert'].includes(
            importIdentifier.replace(/\.hat$/, '')
          );

          if (isBuiltIn) {
            finalCode += line + '\n'; // Keep built-in imports for the interpreter
          } else {
            try {
              // For user files, fetch content and recurse
              const importedContent = await getFileContent(project, importIdentifier);
              await processFile(importedContent, importIdentifier);
            } catch (error) {
              console.warn(`[Preprocessor] Could not import ${importIdentifier}, skipping.`);
              finalCode += `// ${line.trim()} -- IMPORT FAILED\n`;
            }
          }
        } else {
          finalCode += line + '\n';
        }
      }
    }

    await processFile(entryCode, entryPath);
    return finalCode;
  };

  const findFirstFile = (node) => {
      if (node.type === 'file') return node;
      if (node.children) {
          for (const child of node.children) {
              const found = findFirstFile(child);
              if (found) return found;
          }
      }
      return null;
  }
  
  const openFile = useCallback(async (filePath) => {
    try {
        const content = await getFileContent(projectName, filePath);
        setActiveFile({ path: filePath, content, originalContent: content });
    } catch (error) {
        toast.error(`Could not open file: ${filePath}`);
    }
  }, [projectName]);

  const loadProject = useCallback(async () => {
    try {
        const structure = await getProjectStructure(projectName);
        setProjectStructure(structure);
        if (!activeFile.path && structure?.children?.length > 0) {
            const firstFile = findFirstFile(structure);
            if(firstFile) openFile(firstFile.path);
        }
    } catch (error) {
        toast.error("Could not connect to the local backend server. Is it running?");
        console.error(error);
    }
  }, [projectName, activeFile.path, openFile]);

  useEffect(() => {
    fetch('/config.json').then(res => res.json()).then(setConfig);
    loadProject();
  }, [loadProject]);

  const handleCodeChange = (newCode) => {
    if (activeFile.path) {
        setActiveFile(prev => ({ ...prev, content: newCode }));
    }
  };

  useEffect(() => {
    if (!activeFile.path || isSaving || activeFile.content === activeFile.originalContent) return;
    const handler = setTimeout(async () => {
        setIsSaving(true);
        try {
            await saveFileContent(projectName, activeFile.path, activeFile.content);
            setActiveFile(prev => ({ ...prev, originalContent: prev.content }));
        } catch (error) {
            toast.error(`Failed to auto-save ${activeFile.path}`);
        } finally {
            setIsSaving(false);
        }
    }, 2000);
    return () => clearTimeout(handler);
  }, [activeFile.content, activeFile.path, activeFile.originalContent, projectName, isSaving]);
  
  // ---> REPLACED old runCode with a generic version
  const runCode = useCallback(async (codeToRun, filePath, project) => {
    if (!codeToRun) {
      toast.error("There's no code to run! What're you thinkin'?");
      return;
    }
    
    setDebuggerState('thinking');
    
    // --- THIS IS THE KEY CHANGE ---
    // Preprocess the code to handle all #eat directives before interpreting
    const fullCode = await preprocessForIDE(codeToRun, filePath, project);
    s(prev => prev + `> Preprocessing complete. Running ${filePath || 'code'}...\n`);
    // --- END CHANGE ---
    
    const interpreter = interpreterRef.current;
    
    if (!window.uhfAPI) {
        interpreter.webUHF = webUHFRef.current;
    }

    try {
        // Run the fully processed code
        const result = await interpreter.run(fullCode, filePath, project); 
        s(prev => prev + `${result.output}\n`);

        if (interpreter.polkaLoop) {
            setIsLoopRunning(true);
        } else {
            setDebuggerState(result.exitCode === 27 ? 'happy' : 'disappointed');
            s(prev => prev + `> Program finished with exit code: ${result.exitCode}.\n`);
        }
    } catch (error) {
        // ... (rest of the function is the same)
    }
  }, [isLoopRunning, preprocessForIDE]); // Add preprocessForIDE to dependency array

  // ---> NEW: Listener for CLI file execution
  useEffect(() => {
    if (!window.uhfAPI) return;

    const handleCliRun = (event, code) => {
        console.log('[App] Received run-cli-file event');
        // Update the editor and state, then run the code
        setActiveFile({ path: 'CLI Execution', content: code, originalContent: code });
        runCode(code, 'CLI Execution');
    };
    
    window.uhfAPI.on('run-cli-file', handleCliRun);

    return () => {
        window.uhfAPI.removeListener('run-cli-file', handleCliRun);
    };
  }, [runCode]); // Depend on the runCode callback

  const stopCode = useCallback(() => {
    interpreterRef.current.stopLoop();
    setIsLoopRunning(false);
    setConsoleOutput(prev => prev + "> Polka manually stopped by user.\n");
  }, []);

  useEffect(() => {
    if (!window.uhfAPI) return;

    const runFrameHandler = () => interpreterRef.current.runFrame();
    
    const showIsOverHandler = () => {
        setConsoleOutput(prev => prev + "> Show's over, folks! Window was closed.\n");
        setIsLoopRunning(false);
        if (interpreterRef.current) interpreterRef.current.stopLoop();
    };
    
    const uiStateUpdateHandler = (event, newState) => {
        if (interpreterRef.current) interpreterRef.current.uiState = newState;
    };

    if (isLoopRunning) {
        window.uhfAPI.on('UHF:run_frame', runFrameHandler);
        window.uhfAPI.on('UHF:show-is-over', showIsOverHandler);
        window.uhfAPI.on('UHF:ui-state-update', uiStateUpdateHandler);
    }

    return () => {
        window.uhfAPI.removeListener('UHF:run_frame', runFrameHandler);
        window.uhfAPI.removeListener('UHF:show-is-over', showIsOverHandler);
        window.uhfAPI.removeListener('UHF:ui-state-update', uiStateUpdateHandler);
    };
  }, [isLoopRunning]);

  // ---> NEW: Callback for the console button
  const handleRunFromConsole = () => {
      runCode(activeFile.content, activeFile.path, projectName);
  };

  // Handle console input (YankoviC code or terminal command)
  const handleConsoleCommand = useCallback(async (input) => {
    // Terminal command if starts with ! or $
    if (/^(!|\$)/.test(input.trim())) {
      const command = input.trim().replace(/^(!|\$)\s*/, '');
      setConsoleOutput(prev => prev + `> $ ${command}\n`);
      try {
        const result = await execCommand(command, terminalSessionId);
        const { stdout, stderr, cwd, sessionId } = result;
        if (sessionId && sessionId !== terminalSessionId) {
          setTerminalSessionId(sessionId);
          localStorage.setItem('terminalSessionId', sessionId);
        }
        if (cwd) setTerminalCwd(cwd);
        if (stdout) setConsoleOutput(prev => prev + stdout + (stdout.endsWith('\n') ? '' : '\n'));
        if (stderr) setConsoleOutput(prev => prev + stderr + (stderr.endsWith('\n') ? '' : '\n'));
      } catch (err) {
        setConsoleOutput(prev => prev + `Error: ${err.message}\n`);
      }
      return;
    }
    // Otherwise, treat as YankoviC code (run current file)
    runCode(input, activeFile.path || 'Console Input', projectName);
  }, [runCode, activeFile.path, terminalSessionId]);

  // On mount, fetch initial cwd if sessionId exists
  useEffect(() => {
    async function fetchInitialCwd() {
      if (terminalSessionId) {
        const result = await execCommand('pwd', terminalSessionId);
        if (result.cwd) setTerminalCwd(result.cwd);
      }
    }
    fetchInitialCwd();
  }, [terminalSessionId]);

  return (
    <ThemeProvider theme={{ mode: 'dark' }}>
      { !config ? (
        <div>Loading The Accordion... Please stand by for the polka...</div>
      ) : (
      <AppGrid $layout={layout}>
        <SidebarPanel>
          <FileExplorer 
            project={projectStructure} 
            activeFile={activeFile.path} 
            onFileSelect={openFile}
            onProjectRefresh={loadProject}
            projectName={projectName}
            layout={layout} setLayout={setLayout}
          />
          <Debugger state={debuggerState} />
        </SidebarPanel>
        <EditorPanel>
          <EditorPane 
            activeFile={activeFile.path} 
            code={activeFile.content} 
            onCodeChange={handleCodeChange} 
            config={config} 
          />
        </EditorPanel>
        <ConsolePanel>
            <Console 
                output={consoleOutput} 
                onRun={handleRunFromConsole} // Use the new handler
                onStop={stopCode}
                isRunning={isLoopRunning}
                layout={layout} 
                setLayout={setLayout} 
                onCommand={handleConsoleCommand}
                prompt={terminalCwd ? terminalCwd.replace(/^.*projects\//, 'projects/') : '$'}
            />
        </ConsolePanel>
        <AiPanel>
            <AiAssistant config={config} ideActions={{}} layout={layout} setLayout={setLayout} />
        </AiPanel>
      </AppGrid>
      )}
    </ThemeProvider>
  );
}

export default App;