import React, { useState } from 'react';
import styled from 'styled-components';
import { createFile, createFolder, deleteFile, deleteFolder } from '../core/fileApiService';
import { toast } from 'react-toastify';

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: #333;
  font-weight: bo                 <ButtonContainer>
                    <ActionButton 
                        onClick={() => {
                            console.log('New File button clicked - opening modal');
                            showCreateFileModal();
                        }}
                    >
                        📄 New File
                    </ActionButton>
                    <ActionButton 
                        onClick={() => {
                            console.log('New Folder button clicked - opening modal');
                            showCreateFolderModal();
                        }}
                    >
                        📁 New Folder
                    </ActionButton>
                </ButtonContainer>ter;
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

const ExplorerContainer = styled.div`
  flex-grow: 1;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const FileTree = styled.ul`
  list-style: none;
  padding-left: ${props => props.depth > 0 ? '20px' : '0'}; // Keep this
  margin: 0;
`;

const TreeItem = styled.li`
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 3px;
  background-color: ${props => (props.$isActive ? '#37373d' : 'transparent')};
  &:hover { background-color: #2a2d2e; }
`;

const Icon = styled.span` margin-right: 8px; `;

const ButtonContainer = styled.div`
    display: flex;
    gap: 5px;
    margin-top: auto;
    margin-bottom: 10px;
    padding-top: 10px;
    border-top: 1px solid #333;
    flex-shrink: 0;
`;

const ActionButton = styled.button`
  flex-grow: 1;
  padding: 8px;
  background-color: #0e639c;
  border: none;
  color: white;
  cursor: pointer;
  &:hover { background-color: #1177bb; }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2d2d30;
  border: 1px solid #555;
  border-radius: 5px;
  padding: 20px;
  min-width: 400px;
  color: #d4d4d4;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  background-color: #3c3c3c;
  border: 1px solid #555;
  color: #d4d4d4;
  border-radius: 3px;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 15px;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  background-color: ${props => props.primary ? '#0e639c' : '#555'};
  color: white;
  &:hover {
    background-color: ${props => props.primary ? '#1177bb' : '#666'};
  }
`;

const Directory = ({ dir, depth, activeFile, onFileSelect, onDelete, onDeleteFolder, expandedFolders, toggleFolder }) => {
    const isExpanded = expandedFolders.has(dir.path);
    return (
        <div>
            <TreeItem>
                <Icon
                  style={{ cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); toggleFolder(dir.path); }}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? '▼' : '▶'}
                </Icon>
                <span
                  style={{ flex: 1, cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); toggleFolder(dir.path); }}
                >
                  {dir.name}
                </span>
                <button
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '16px' }}
                    title="Delete folder"
                    onClick={e => { e.stopPropagation(); onDeleteFolder(dir.path, dir.name); }}
                >🗑️</button>
            </TreeItem>
            {isExpanded && (
                <FileTree depth={depth + 1}>
                    {dir.children.map(child => (
                        <FileTreeNode key={child.path} node={child} depth={depth + 1} activeFile={activeFile} onFileSelect={onFileSelect} onDelete={onDelete} onDeleteFolder={onDeleteFolder} expandedFolders={expandedFolders} toggleFolder={toggleFolder} />
                    ))}
                </FileTree>
            )}
        </div>
    );
};

const File = ({ file, activeFile, onFileSelect, onDelete }) => (
    <TreeItem $isActive={file.path === activeFile} onClick={() => onFileSelect(file.path)}>
        <Icon>📄</Icon> {file.name}
        <button
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '16px' }}
            title="Delete file"
            onClick={e => { e.stopPropagation(); onDelete(file.path, file.name); }}
        >🗑️</button>
    </TreeItem>
);

const FileTreeNode = ({ node, depth, ...props }) => {
    if (node.type === 'folder') {
        return <Directory dir={node} depth={depth} {...props} />;
    }
    return <File file={node} {...props} />;
};

function FileExplorer({ project, activeFile, onFileSelect, onProjectRefresh, projectName, layout, setLayout }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '', // 'file' or 'folder'
        title: '',
        placeholder: '',
        value: ''
    });
    const [expandedFolders, setExpandedFolders] = useState(() => new Set());

    const showCreateFileModal = () => {
        setModalState({
            isOpen: true,
            type: 'file',
            title: '📄 Create New File',
            placeholder: 'e.g., utils/helpers.yc',
            value: ''
        });
    };

    const showCreateFolderModal = () => {
        setModalState({
            isOpen: true,
            type: 'folder',
            title: '📁 Create New Folder',
            placeholder: 'e.g., my_new_folder',
            value: ''
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            type: '',
            title: '',
            placeholder: '',
            value: ''
        });
    };

    const handleModalSubmit = async () => {
        if (!modalState.value.trim()) return;

        if (modalState.type === 'file') {
            await performCreateFile(modalState.value.trim());
        } else if (modalState.type === 'folder') {
            await performCreateFolder(modalState.value.trim());
        }
        closeModal();
    };
    
    const performCreateFile = async (path) => {
        console.log('=== performCreateFile START ===');
        console.log('projectName:', projectName);
        console.log('path:', path);
        
        try {
            if (!projectName) {
                console.log('ERROR: No project name');
                toast.error('❌ Project name not available');
                return;
            }
            
            console.log('Creating file:', { projectName, path });
            console.log('Calling createFile API...');
            await createFile(projectName, path);
            console.log('File created successfully:', path);
            toast.success(`✅ File created: ${path}`);
            
            console.log('Calling onProjectRefresh...');
            if (onProjectRefresh) {
                await onProjectRefresh();
                console.log('Project refreshed successfully');
            } else {
                console.warn('onProjectRefresh not available');
            }
        } catch (error) {
            console.error('=== CREATE FILE ERROR ===');
            console.error('Error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stack: error.stack
            });
            toast.error(`❌ Failed to create file: ${error.message || 'Unknown error'}`);
        }
        console.log('=== performCreateFile END ===');
    };

    const performCreateFolder = async (path) => {
        console.log('=== performCreateFolder START ===');
        console.log('projectName:', projectName);
        console.log('path:', path);
        
        try {
            if (!projectName) {
                console.log('ERROR: No project name');
                toast.error('❌ Project name not available');
                return;
            }
            
            console.log('Creating folder:', { projectName, path });
            console.log('Calling createFolder API...');
            await createFolder(projectName, path);
            console.log('Folder created successfully:', path);
            toast.success(`✅ Folder created: ${path}`);
            
            console.log('Calling onProjectRefresh...');
            if (onProjectRefresh) {
                await onProjectRefresh();
                console.log('Project refreshed successfully');
            } else {
                console.warn('onProjectRefresh not available');
            }
        } catch (error) {
            console.error('=== CREATE FOLDER ERROR ===');
            console.error('Error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stack: error.stack
            });
            toast.error(`❌ Failed to create folder: ${error.message || 'Unknown error'}`);
        }
        console.log('=== performCreateFolder END ===');
    };

    const handleDeleteFile = async (filePath, fileName) => {
        console.log('Delete file called:', { filePath, fileName, projectName });
        
        if (!projectName) {
            toast.error('❌ Project name not available');
            return;
        }
        
        const confirmed = window.confirm(
            `🗑️ Delete File Confirmation\n\n` +
            `Are you sure you want to delete "${fileName}"?\n\n` +
            `This action cannot be undone!`
        );
        
        if (!confirmed) return;
        
        console.log('Deleting file:', filePath);
        try {
            await deleteFile(projectName, filePath);
            console.log('File deleted successfully:', filePath);
            toast.success(`✅ File deleted: ${fileName}`);
            if (onProjectRefresh) {
                onProjectRefresh();
            } else {
                console.warn('onProjectRefresh not available');
            }
        } catch (error) {
            console.error('Delete file error:', error);
            toast.error(`❌ Failed to delete file: ${error.message || 'Unknown error'}`);
        }
    };
    
    const handleDeleteFolder = async (folderPath, folderName) => {
        console.log('Delete folder called:', { folderPath, folderName, projectName });
        
        if (!projectName) {
            toast.error('❌ Project name not available');
            return;
        }
        
        const confirmed = window.confirm(
            `🗑️ Delete Folder Confirmation\n\n` +
            `Are you sure you want to delete the folder "${folderName}" and ALL its contents?\n\n` +
            `This action cannot be undone!`
        );
        
        if (!confirmed) return;
        
        console.log('Deleting folder:', folderPath);
        try {
            await deleteFolder(projectName, folderPath);
            console.log('Folder deleted successfully:', folderPath);
            toast.success(`✅ Folder deleted: ${folderName}`);
            if (onProjectRefresh) {
                onProjectRefresh();
            } else {
                console.warn('onProjectRefresh not available');
            }
        } catch (error) {
            console.error('Delete folder error:', error);
            toast.error(`❌ Failed to delete folder: ${error.message || 'Unknown error'}`);
        }
    };

    // Expand root by default when project loads
    React.useEffect(() => {
        if (project && project.path && !expandedFolders.has(project.path)) {
            setExpandedFolders(prev => new Set(prev).add(project.path));
        }
    }, [project]);

    const toggleFolder = (folderPath) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderPath)) {
                next.delete(folderPath);
            } else {
                next.add(folderPath);
            }
            return next;
        });
    };

    if (!layout.explorer) return <PanelHeader onClick={() => setLayout(l => ({...l, explorer: true}))}>Filing Cabinet</PanelHeader>;

    return (
        <>
            <PanelHeader>
                <span>Filing Cabinet</span>
                <div>
                  <button 
                    onClick={() => { console.log('Refresh button clicked'); onProjectRefresh(); }} 
                    style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize: '16px'}}
                    title="Refresh project structure"
                  >🔄</button>
                  <CloseButton onClick={() => setLayout(l => ({...l, explorer: false}))}>×</CloseButton>
                </div>
            </PanelHeader>
            <ExplorerContainer>
                {project ? (
                    <FileTree depth={0}>
                        {project.children.map(node => (
                            <FileTreeNode 
                                key={node.path} 
                                node={node} 
                                depth={0} 
                                activeFile={activeFile} 
                                onFileSelect={onFileSelect} 
                                onDelete={handleDeleteFile}
                                onDeleteFolder={handleDeleteFolder}
                                expandedFolders={expandedFolders}
                                toggleFolder={toggleFolder}
                            />
                        ))}
                    </FileTree>
                ) : (
                    <p>Connecting to backend...</p>
                )}
                 <ButtonContainer>
                    <ActionButton 
                        onClick={() => {
                            console.log('New File button clicked - opening modal');
                            showCreateFileModal();
                        }}
                    >
                        📄 New File
                    </ActionButton>
                    <ActionButton 
                        onClick={() => {
                            console.log('New Folder button clicked - opening modal');
                            showCreateFolderModal();
                        }}
                    >
                        📁 New Folder
                    </ActionButton>
                </ButtonContainer>
            </ExplorerContainer>
            {modalState.isOpen && (
                <Modal>
                    <ModalContent>
                        <h3>{modalState.title}</h3>
                        <p>Enter the path for the new {modalState.type}:</p>
                        <ModalInput
                            type="text"
                            placeholder={modalState.placeholder}
                            value={modalState.value}
                            onChange={(e) => setModalState(prev => ({ ...prev, value: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleModalSubmit();
                                } else if (e.key === 'Escape') {
                                    closeModal();
                                }
                            }}
                            autoFocus
                        />
                        <ModalButtons>
                            <ModalButton onClick={closeModal}>Cancel</ModalButton>
                            <ModalButton primary onClick={handleModalSubmit}>Create</ModalButton>
                        </ModalButtons>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
}

export default FileExplorer;