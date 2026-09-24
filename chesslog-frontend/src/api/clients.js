const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';


export const apiClient = async (endPoint, options={}) => {
    const accessToken = localStorage.getItem('accessToken')

    const headers =  {
        'Content-Type' : 'application/json',
        ...(accessToken ? { 'Authorization' : `Bearer ${accessToken}` } : {}),
        ...options.header,
    };

    const config = {
        ...options,
        headers,
    }

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${baseURL}${endPoint}`, config);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    }

    if (!response.ok) {
        const errorMessage = data?.message || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
    };