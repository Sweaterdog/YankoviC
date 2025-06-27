import React, { useRef, useEffect } from 'react';
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

function Console({ output, onRun, onStop, isRunning, layout, setLayout }) {
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  if (!layout.console) {
      return <PanelHeader onClick={() => setLayout(l => ({...l, console: true}))}>Backstage Pass (Console)</PanelHeader>
  }

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
    </PanelContainer>
  );
}

export default Console;