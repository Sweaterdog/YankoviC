import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: #333;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
  &:hover { color: white; }
`;

const RunButton = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 5px 15px;
  cursor: pointer;
  font-weight: bold;
  margin-left: auto;
  margin-right: 10px;
  &:hover { background-color: #45a049; }
`;

const StopButton = styled(RunButton)`
  background-color: #f44336; /* Red for stop */
  &:hover { background-color: #d32f2f; }
`;

const OutputArea = styled.pre`
  flex-grow: 1;
  padding: 10px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-size: 14px;
`;

const InputArea = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-top: 1px solid #333;
  background: #181818;
  color: #d4d4d4;
  font-size: 15px;
  font-family: monospace;
  outline: none;
`;

function Console({ output, onRun, onStop, isRunning, layout, setLayout, onCommand, prompt }) {
  const outputRef = useRef(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  if (!layout.console) {
      return <PanelHeader onClick={() => setLayout(l => ({...l, console: true}))}>Backstage Pass (Console)</PanelHeader>
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        onCommand?.(input);
        setInput("");
      }
    }
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <span>Backstage Pass (Console)</span>
        {isRunning ? (
            <StopButton onClick={onStop}>Stop the Polka!</StopButton>
        ) : (
            <RunButton onClick={onRun}>Perform the Parody!</RunButton>
        )}
        <CloseButton onClick={() => setLayout(l => ({...l, console: false}))}>×</CloseButton>
      </PanelHeader>
      <OutputArea ref={outputRef}>{output}</OutputArea>
      <div style={{ display: 'flex', alignItems: 'center', background: '#181818' }}>
        <span style={{ color: '#6cf', fontFamily: 'monospace', padding: '0 6px 0 8px', fontSize: 15 }}>{prompt || '$'}</span>
        <InputArea
          type="text"
          placeholder="Type YankoviC code or !ls, !pwd, etc. for terminal..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          spellCheck={false}
          autoFocus
        />
      </div>
    </PanelContainer>
  );
}

export default Console;