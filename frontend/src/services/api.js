const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authAPI = {
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    },

    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return response.json();
    }
};

export const contactAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/contacts`, {
            headers: getAuthHeader()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
            headers: getAuthHeader()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    create: async (contactData) => {
        const response = await fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(contactData)
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    update: async (id, contactData) => {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(contactData)
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    }
};

export const addressAPI = {
    getByContact: async (contactId) => {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/addresses`, {
            headers: getAuthHeader()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    create: async (contactId, addressData) => {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(addressData)
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    update: async (contactId, addressId, addressData) => {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/addresses/${addressId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(addressData)
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    delete: async (contactId, addressId) => {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/addresses/${addressId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    }
};

export const taskAPI = {
    getAll: async (status = '') => {
        const url = status ? `${API_BASE_URL}/tasks?status=${status}` : `${API_BASE_URL}/tasks`;
        const response = await fetch(url, {
            headers: getAuthHeader()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            headers: getAuthHeader()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    create: async (taskData) => {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(taskData)
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    update: async (id, taskData) => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(taskData)
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        return response.json();
    }
};
