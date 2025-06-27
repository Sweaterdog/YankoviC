import React from 'react';
import styled from 'styled-components';

const DebuggerContainer = styled.div`
  margin-top: auto;
  padding: 10px;
  border-top: 1px solid #333;
  text-align: center;
`;

const AlHead = styled.img`
  width: 150px;
  height: 150px;
  border: 2px solid #555;
  border-radius: 5px;
  background-color: #111;
`;

const StateText = styled.p`
  font-style: italic;
  color: #aaa;
`;

function Debugger({ state }) {
  const getAlState = () => {
    switch (state) {
      case 'happy':
        return { src: '/al-happy.gif', text: "Success! That's how you polka!" };
      case 'disappointed':
        return { src: '/al-disappointed.gif', text: "You're a hardware store of bugs." };
      case 'thinking':
      default:
        return { src: '/al-thinking.gif', text: 'Analyzing your... creation.' };
    }
  };

  const { src, text } = getAlState();

  return (
    <DebuggerContainer>
      <h4>The White & Nerdy Debugger</h4>
      <AlHead src={src} alt={`Al is ${state}`} />
      <StateText>{text}</StateText>
    </DebuggerContainer>
  );
}

export default Debugger;
