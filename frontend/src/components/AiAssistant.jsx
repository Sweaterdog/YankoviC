import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { streamPollinationsResponse } from '../core/aiService';
import { createParser } from 'eventsource-parser';

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: #333;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
  &:hover { color: white; }
`;

const ChatHistory = styled.div`
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  font-size: 14px;
`;

const Message = styled.div`
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 5px;
  background-color: ${props => (props.role === 'user' ? '#0e639c' : '#3a3d41')};
  color: ${props => (props.role === 'tool' ? '#aaa' : '#d4d4d4')};
  font-style: ${props => (props.role === 'tool' ? 'italic' : 'normal')};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const InputArea = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #333;
  flex-shrink: 0;
`;

const Input = styled.input`
  flex-grow: 1;
  background-color: #3c3c3c;
  border: 1px solid #555;
  color: #d4d4d4;
  padding: 8px;
  border-radius: 3px;
  margin-right: 10px;
`;

const SendButton = styled.button`
  background-color: #569cd6;
  border: none;
  color: white;
  padding: 8px 15px;
  cursor: pointer;
  &:hover { background-color: #4a8ac8; }
  &:disabled { background-color: #333; cursor: not-allowed; }
`;

const ModelSelector = styled.select`
    background-color: #3c3c3c;
    color: white;
    border: 1px solid #555;
    border-radius: 3px;
    margin-left: auto;
    margin-right: 10px;
`;

// Function to load WORDS.md documentation
async function loadYankovicDocs() {
  try {
    // Try Electron/Node first
    // eslint-disable-next-line no-undef
    const fs = window.require ? window.require('fs') : undefined;
    const path = window.require ? window.require('path') : undefined;
    
    if (fs && path) {
      let wordsPath = path.resolve(__dirname, '../../../WORDS.md');
      if (!fs.existsSync(wordsPath)) {
        wordsPath = path.resolve(__dirname, '../../../../WORDS.md');
      }
      if (!fs.existsSync(wordsPath)) {
        wordsPath = path.resolve(process.cwd(), 'WORDS.md');
      }
      return fs.readFileSync(wordsPath, 'utf-8');
    }
  } catch (e) {
    console.log('Not in Electron context, trying browser fetch...');
  }
  
  // Browser fallback
  try {
    const response = await fetch('/WORDS.md');
    if (response.ok) {
      return await response.text();
    }
  } catch (e) {
    console.error('Failed to load WORDS.md:', e);
  }
  
  return 'YankoviC documentation not available';
}

// Base system prompt - will be enhanced with WORDS.md content
const baseSystemPrompt = `You are "Al", a quirky and brilliant AI programming assistant for the YankoviC programming language. You are an expert on all things "Weird Al" Yankovic and you express this in your helpful, humorous, and slightly absurd responses. Your primary goal is to help the user write, debug, and understand YankoviC code.

IMPORTANT: You must ONLY work with YankoviC language syntax. Never suggest Python, JavaScript, or any other language. YankoviC has its own unique syntax and semantics.

Your capabilities are exposed as tools. When you need to interact with the IDE, you MUST call one of the following functions. Do not ask for permission; just call the tool.

YankoviC Language Documentation:
`;
const tools = [
    { type: 'function', function: { name: 'create_file', description: "Creates a new file in the user's workspace with the given content.", parameters: { type: 'object', properties: { filename: { type: 'string' }, content: { type: 'string' } }, required: ['filename', 'content'] } } },
    { type: 'function', function: { name: 'edit_file', description: "Replaces the entire content of an existing file.", parameters: { type: 'object', properties: { filename: { type: 'string' }, new_content: { type: 'string' } }, required: ['filename', 'new_content'] } } },
    { type: 'function', function: { name: 'read_file', description: "Reads the content of a file to analyze it.", parameters: { type: 'object', properties: { filename: { type: 'string' } }, required: ['filename'] } } },
    { type: 'function', function: { name: 'list_files', description: "Lists all files in the workspace.", parameters: { type: 'object', properties: {} } } },
    { type: 'function', function: { name: 'run_program', description: "Executes the current program and returns its console output.", parameters: { type: 'object', properties: {} } } },
    { type: 'function', function: { name: 'query_docs', description: "Queries internal documentation about a YankoviC keyword or concept.", parameters: { type: 'object', properties: { topic: { type: 'string' } }, required: ['topic'] } } }
];

function AiAssistant({ config, ideActions, layout, setLayout }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "I'm Al, your personal YankoviC guru! Let's polka!" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState(config.aiModels[0].id);
    const [systemPrompt, setSystemPrompt] = useState(baseSystemPrompt);
    const chatEndRef = useRef(null);

    // Load YankoviC documentation on component mount
    useEffect(() => {
        loadYankovicDocs().then(docs => {
            setSystemPrompt(baseSystemPrompt + docs);
        });
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;

        const newMessages = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const conversation = [{ role: 'system', content: systemPrompt }, ...newMessages];
            const stream = await streamPollinationsResponse(conversation, tools, config, selectedModel);
            await handleReaderStream(stream);
            
        } catch (error) {
            console.error("Streaming failed:", error);
            setMessages(prev => {
                const lastMsgIndex = prev.length - 1;
                const updatedMessages = [...prev];
                updatedMessages[lastMsgIndex].content = `Error: ${error.message}`;
                return updatedMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReaderStream = async (reader) => {
        const decoder = new TextDecoder();
        const parser = createParser((event) => {
            if (event.type === 'event') {
                if (event.data === '[DONE]') return;
                try {
                    const data = JSON.parse(event.data);
                    const textPart = data.choices?.[0]?.delta?.content || '';
                    if (textPart) {
                        setMessages(prev => {
                            const lastMsg = prev[prev.length - 1];
                            lastMsg.content += textPart;
                            return [...prev];
                        });
                    }
                } catch (e) { /* Ignore non-JSON chunks */ }
            }
        });
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            parser.feed(chunk);
        }
    };

    if (!layout.ai) {
        return <PanelHeader onClick={() => setLayout(l => ({...l, ai: true}))}>The Al-manac (AI)</PanelHeader>
    }

    return (
        <>
            <PanelHeader>
                <span>The Al-manac (AI)</span>
                <ModelSelector value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                    {config.aiModels.map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                </ModelSelector>
                <CloseButton onClick={() => setLayout(l => ({...l, ai: false}))}>×</CloseButton>
            </PanelHeader>
            <ChatHistory>
                {messages.map((msg, index) => (
                    <Message key={index} role={msg.role}>
                        <strong>{msg.role === 'user' ? 'You' : 'Al'}:</strong> {msg.content}
                    </Message>
                ))}
                {isLoading && messages[messages.length-1].content === '' && <Message role="assistant"><strong>Al:</strong> *Frantically playing accordion while thinking...*</Message>}
                <div ref={chatEndRef} />
            </ChatHistory>
            <InputArea>
                <Input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder={isLoading ? 'Al is playing a solo...' : 'Ask Al for help...'}
                    disabled={isLoading}
                />
                <SendButton onClick={handleSend} disabled={isLoading}>Send</SendButton>
            </InputArea>
        </>
    );
}

export default AiAssistant;