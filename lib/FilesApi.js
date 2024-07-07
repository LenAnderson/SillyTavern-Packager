import { getRequestHeaders } from '../../../../../script.js';

export class FilesApi {
    static async exists(path) {
        const response = await fetch('api/plugins/files/exists', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                path,
            }),
        });
        return await response.json();
    }

    static async getText(path) {
        const response = await fetch('api/plugins/files/get', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                path,
            }),
        });
        return await response.text();
    }

    static async getJson(path) {
        const response = await fetch('api/plugins/files/get', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                path,
            }),
        });
        return await response.json();
    }

    static async getBlob(path) {
        const response = await fetch('api/plugins/files/get', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                path,
            }),
        });
        return await response.blob();
    }

    static async list(path, options = {}) {
        const response = await fetch('api/plugins/files/list', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                path,
                ...options,
            }),
        });
        return await response.json();
    }
}
