const API_URL = 'http://localhost:3001/api';

export async function getDevices() {
    const response = await fetch(`${API_URL}/devices`);
    return response.json();
}

export async function getDeviceConnections(id) {
    const response = await fetch(`${API_URL}/devices/${id}/connections`);
    return response.json();
}

export async function createDevice(device) {
    const response = await fetch(`${API_URL}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
    });
    return response.json();
}

export async function connectDevices(id, targetId) {
    const response = await fetch(`${API_URL}/devices/${id}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId })
    });
    return response.json();
}
