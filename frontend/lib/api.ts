import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/inventory';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getDeadStock = async () => {
  try {
    const response = await api.get('/dead-stock');
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to fetch dead stock data', error);
    throw error;
  }
};

export const getForecast = async () => {
  try {
    const response = await api.get('/forecast');
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to fetch forecast data', error);
    throw error;
  }
};

export const getCashflow = async () => {
  try {
    const response = await api.get('/cashflow');
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to fetch cashflow data', error);
    throw error;
  }
};

export const getRecommendations = async () => {
  try {
    const response = await api.get('/recommendations');
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to fetch recommendations data', error);
    throw error;
  }
};

// Newly added endpoint handling native WhatsApp routing protocols
export interface ReorderResponse {
  success: boolean;
  message: string;
  whatsappLink: string;
}

export const executeReorder = async (product: string, quantity: number): Promise<ReorderResponse> => {
  try {
    const response = await api.post('/reorder', { product, quantity });
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to execute reorder pipeline', error);
    throw error;
  }
};

export const updateStock = async (product: string, quantity: number) => {
  try {
    const response = await api.post('/update-stock', { product, quantity });
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to update stock dynamically', error);
    throw error;
  }
};

// POS Simulation — fires mock Rice -5 / Oil -3 sale against live inventory
export const posSync = async () => {
  try {
    const response = await api.post('/pos-sync');
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to trigger POS sync simulation', error);
    throw error;
  }
};

// POS Upload — accepts JSON array OR { csvData: string } payload
export const posUpload = async (items: { product: string; quantity: number }[]) => {
  try {
    const response = await api.post('/pos-upload', items);
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to upload POS data', error);
    throw error;
  }
};

export const getStock = async () => {
  try {
    const response = await api.get('/stock');
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to fetch stock levels', error);
    throw error;
  }
};

