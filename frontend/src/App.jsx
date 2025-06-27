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
import { getProjectStructure, getFileContent, saveFileContent } from './core/fileApiService';

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

  const interpreterRef = useRef(new YankoviCInterpreter());
  const webUHFRef = useRef(new WebUHFRenderer());

  const projectName = 'default-project';

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
    console.log('loadProject called');
    try {
        console.log('Fetching project structure for:', projectName);
        const structure = await getProjectStructure(projectName);
        console.log('Project structure received:', structure);
        setProjectStructure(structure);
        if (!activeFile.path && structure?.children?.length > 0) {
            const firstFile = findFirstFile(structure);
            if(firstFile) openFile(firstFile.path);
        }
        console.log('Project loaded successfully');
    } catch (error) {
        console.error('loadProject error:', error);
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

  // This effect handles the async communication with the UHF window
  useEffect(() => {
    if (!window.uhfAPI) return;

    const runFrameHandler = async () => {
        // This part's the same, it runs the animation frame,
        // Keeping the polka going is its primary aim.
        interpreterRef.current.runFrame();
    };

    const showIsOverHandler = () => {
        // This also stays the same, it's true,
        // It stops the loop when the show is through.
        setConsoleOutput(prev => prev + "> Show's over, folks! Window was closed.\n");
        setIsLoopRunning(false);
        if (interpreterRef.current) {
            interpreterRef.current.stopLoop();
        }
    };
    
    // THE BRAND NEW LISTENER! THE MISSING PIECE!
    // This connects the UI state, bringing sweet release!
    const uiStateUpdateHandler = (event, newState) => {
        if (interpreterRef.current) {
            // We tell the interpreter what the user did, it's the key,
            // To making interactive programs work, you see!
            interpreterRef.current.uiState = newState;
        }
    };


    // Add all our listeners, now three instead of two
    window.uhfAPI.on('UHF:run_frame', runFrameHandler);
    window.uhfAPI.on('UHF:show-is-over', showIsOverHandler);
    window.uhfAPI.on('UHF:ui-state-update', uiStateUpdateHandler);

    // Cleanup function to remove listeners, we must be polite,
    // So we don't leave things running all through the night.
    return () => {
        window.uhfAPI.removeListener('UHF:run_frame', runFrameHandler);
        window.uhfAPI.removeListener('UHF:show-is-over', showIsOverHandler);
        window.uhfAPI.removeListener('UHF:ui-state-update', uiStateUpdateHandler);
    };
  }, [isLoopRunning]); // This dependency is still correct.
 
  const runCode = useCallback(async () => {
    console.log('[App] runCode called for file:', activeFile.path);
    setConsoleOutput(prev => prev + `[DEBUG] runCode called for ${activeFile.path}\n`);
    
    if (!activeFile.path) {
        toast.error("You haven't even picked a file to run!");
        return;
    }
    setDebuggerState('thinking');
    const interpreter = interpreterRef.current;
    const webUHF = webUHFRef.current;
    
    console.log('[App] window.uhfAPI exists:', !!window.uhfAPI);
    setConsoleOutput(prev => prev + `[DEBUG] window.uhfAPI exists: ${!!window.uhfAPI}\n`);
    
    // Set up web UHF fallback if not in Electron
    if (!window.uhfAPI) {
        interpreter.webUHF = webUHF;
        setConsoleOutput(prev => prev + `[DEBUG] Using webUHF fallback\n`);
    } else {
        setConsoleOutput(prev => prev + `[DEBUG] Using Electron UHF API\n`);
    }
    
    try {
        console.log('[App] Starting interpreter.run()');
        setConsoleOutput(prev => prev + `[DEBUG] Starting interpreter.run()\n`);
        const result = await interpreter.run(activeFile.content);
        
        console.log('[App] interpreter.run() completed. Result:', result);
        setConsoleOutput(prev => prev + `[DEBUG] interpreter.run() completed. polkaLoop exists: ${!!interpreter.polkaLoop}\n`);
        
        setConsoleOutput(prev => prev + `> Running ${activeFile.path}...\n${result.output}\n`);

        if (interpreter.polkaLoop) {
            console.log('[App] Polka loop detected, starting graphics loop');
            setConsoleOutput(prev => prev + `[DEBUG] Polka loop detected, starting graphics loop\n`);
            setIsLoopRunning(true);
            
            // Start web graphics loop if not in Electron
            if (!window.uhfAPI) {
                const runWebGraphicsLoop = () => {
                    if (!webUHF.isTheShowOver() && isLoopRunning) {
                        const buffer = interpreter.runFrame();
                        if (buffer && buffer.length > 0) {
                            webUHF.executeDrawBuffer(buffer);
                            // Update UI state in interpreter
                            interpreter.uiState = webUHF.getUIState();
                        }
                        setTimeout(runWebGraphicsLoop, 16); // ~60fps
                    } else {
                        setIsLoopRunning(false);
                        setConsoleOutput(prev => prev + "> Show's over, folks! Window was closed.\n");
                    }
                };
                runWebGraphicsLoop();
            }
        } else {
            setDebuggerState(result.exitCode === 27 ? 'happy' : 'disappointed');
            setConsoleOutput(prev => prev + `> Program finished with exit code: ${result.exitCode}.\n`);
        }
    } catch (error) {
        console.error('Error running code:', error);
        setConsoleOutput(prev => prev + `> Error running code: ${error.message}\n`);
        setDebuggerState('disappointed');
    }
  }, [activeFile.content, activeFile.path, isLoopRunning]);

  const stopCode = useCallback(() => {
    interpreterRef.current.stopLoop();
    setIsLoopRunning(false);
    setConsoleOutput(prev => prev + "> Polka manually stopped by user.\n");
    
    // Stop web graphics if running
    if (!window.uhfAPI && webUHFRef.current) {
        webUHFRef.current.isActive = false;
    }
  }, []);

  // This effect handles the async communication with the UHF window
  useEffect(() => {
    if (!window.uhfAPI) return;

    const runFrameHandler = async () => {
        console.log('[App] runFrameHandler triggered (Electron mode)');
        await interpreterRef.current.runFrame();
        // UHF.hat.flushDrawCommands will send commands to UHF window
    };

    const showIsOverHandler = (event, ...args) => {
        setConsoleOutput(prev => prev + "> Show's over, folks! Window was closed.\n");
        setIsLoopRunning(false);
        if (interpreterRef.current) {
            interpreterRef.current.showIsOver = true;
            interpreterRef.current.polkaLoop = null;
        }
    };

    // Add listeners
    window.uhfAPI.on('UHF:run_frame', runFrameHandler);
    window.uhfAPI.on('UHF:show-is-over', showIsOverHandler);

    // Cleanup function to remove listeners on component unmount or re-render
    return () => {
        window.uhfAPI.removeListener('UHF:run_frame', runFrameHandler);
        window.uhfAPI.removeListener('UHF:show-is-over', showIsOverHandler);
    };
  }, [isLoopRunning]); // Depend on isLoopRunning to re-evaluate if the loop state changes

  if (!config) {
    return <div>Loading The Accordion... Please stand by for the polka...</div>;
  }

  const ideActions = {};

  return (
    <ThemeProvider theme={{ mode: 'dark' }}>
      {/* THE FIX: Pass the layout prop with the `$` prefix */}
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
                onRun={runCode} 
                onStop={stopCode}
                isRunning={isLoopRunning}
                layout={layout} 
                setLayout={setLayout} 
            />
        </ConsolePanel>

        <AiPanel>
            <AiAssistant config={config} ideActions={ideActions} layout={layout} setLayout={setLayout} />
        </AiPanel>

      </AppGrid>
    </ThemeProvider>
  );
}

export default App;