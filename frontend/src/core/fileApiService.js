import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export async function getProjectStructure(projectName = 'default-project') {
    const response = await axios.get(`${API_BASE_URL}/files`, { params: { project: projectName } });
    return response.data;
}

export async function getFileContent(projectName, filePath) {
    const response = await axios.get(`${API_BASE_URL}/file-content`, { params: { project: projectName, file: filePath } });
    return response.data.content;
}

export async function saveFileContent(projectName, filePath, content) {
    await axios.post(`${API_BASE_URL}/save-file`, { project: projectName, file: filePath, content });
}

export async function createFolder(projectName, folderPath) {
    console.log('createFolder API call:', { projectName, folderPath });
    const payload = { project: projectName, path: folderPath };
    console.log('createFolder payload:', payload);
    const response = await axios.post(`${API_BASE_URL}/create-folder`, payload);
    console.log('createFolder response:', response.data);
    return response.data;
}

export async function createFile(projectName, filePath) {
    console.log('createFile API call:', { projectName, filePath });
    const payload = { project: projectName, path: filePath };
    console.log('createFile payload:', payload);
    const response = await axios.post(`${API_BASE_URL}/create-file`, payload);
    console.log('createFile response:', response.data);
    return response.data;
}

export async function deleteFile(projectName, filePath) {
    await axios.delete(`${API_BASE_URL}/delete-file`, { 
        data: { project: projectName, file: filePath } 
    });
}

export async function deleteFolder(projectName, folderPath) {
    await axios.delete(`${API_BASE_URL}/delete-folder`, { 
        data: { project: projectName, folder: folderPath } 
    });
}
