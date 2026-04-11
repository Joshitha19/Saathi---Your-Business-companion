import { InventoryItem } from '../services/mlService';

export interface DeadStockResult {
  name: string;
  stock: number;
  suggestion: string;
}

export const getDeadStock = (items: InventoryItem[]): DeadStockResult[] => {
  return items
    .filter(item => {
      // Calculates robust average to define dead stock metrics, resolving missing arrays back to old logic inline
      const avg = item.avgSalesLast30Days !== undefined ? item.avgSalesLast30Days : (item.salesLast30Days / 30);
      return avg < 2 && item.stock > 10;
    })
    .map(item => {
      const discount = Math.floor(Math.random() * 21) + 10; // Random between 10 and 30
      
      return {
        name: item.name,
        stock: item.stock,
        suggestion: `${discount}% discount`
      };
    });
};
