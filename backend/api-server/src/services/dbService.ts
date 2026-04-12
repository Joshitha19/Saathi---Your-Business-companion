import fs from 'fs';
import path from 'path';
import { generateData, SyntheticData } from '../utils/generateData';

const DB_FILE = path.join(__dirname, '../../db.json');

class DatabaseService {
  private data: SyntheticData;

  constructor() {
    if (fs.existsSync(DB_FILE)) {
      this.data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } else {
      console.log('No database found. Initializing with synthetic data...');
      this.data = generateData();
      this.save();
    }
  }

  get dataCopy() {
    return JSON.parse(JSON.stringify(this.data));
  }

  getInventory() {
    return this.data.inventory;
  }

  getSalesHistory(productName: string) {
    return this.data.salesHistory[productName] || [];
  }

  updateStock(productName: string, quantityChange: number) {
    const item = this.data.inventory.find(i => i.name === productName);
    if (item) {
      item.stock = Math.max(0, item.stock + quantityChange);
      
      // Also log this in sales history if it's a reduction (sale)
      if (quantityChange < 0) {
        const today = new Date().toISOString().split('T')[0];
        const productHistory = this.data.salesHistory[productName] || [];
        const todayRecord = productHistory.find(r => r.date === today);
        
        if (todayRecord) {
          todayRecord.sales += Math.abs(quantityChange);
        } else {
          productHistory.push({
            date: today,
            sales: Math.abs(quantityChange),
            isFestival: false
          });
        }
        this.data.salesHistory[productName] = productHistory;
      }
      
      this.save();
      return item;
    }
    return null;
  }

  getUpcomingFestivals() {
    return this.data.upcomingFestivals;
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
  }
}

export const db = new DatabaseService();
