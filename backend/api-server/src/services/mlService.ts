import axios from 'axios';
import { SaleRecord } from '../utils/generateData';

export interface InventoryItem {
  name: string;
  stock: number;
  salesLast30Days: number;
  avgSalesLast30Days?: number; 
  salesHistory?: SaleRecord[]; 
}

const getBaseUrl = () => process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const getForecast = async (data: InventoryItem[], upcomingFestivals: boolean[] = []) => {
  try {
    const promises = data.map(item => 
      axios.post(`${getBaseUrl()}/forecast`, {
        product: item.name,
        sales_history: item.salesHistory || [],
        upcoming_festivals: upcomingFestivals
      })
    );
    
    const responses = await Promise.all(promises);
    return responses.map(res => res.data);
  } catch (error) {
    console.error('Error calculating forecast:', error);
    throw new Error('Failed to fetch forecast from ML service');
  }
};
