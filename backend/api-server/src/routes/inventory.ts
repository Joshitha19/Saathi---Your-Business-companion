import { Router, Request, Response } from 'express';
import axios from 'axios';
import { getForecast } from '../services/mlService';
import { getDeadStock } from '../utils/deadStock';
import { db } from '../services/dbService';

const router = Router();

// Helper to enrich inventory item with sales metrics
const enrichItem = (item: any) => {
  const history = db.getSalesHistory(item.name);
  const last30 = history.slice(-30);
  const salesLast30Days = last30.reduce((sum, current) => sum + current.sales, 0);
  const avgSalesLast30Days = salesLast30Days / (last30.length || 1);
  return {
    ...item,
    salesLast30Days,
    avgSalesLast30Days: parseFloat(avgSalesLast30Days.toFixed(1)),
    salesHistory: history
  };
};

router.get('/dead-stock', (req: Request, res: Response) => {
  const inventory = db.getInventory().map(enrichItem);
  const deadStockItems = getDeadStock(inventory);
  res.json(deadStockItems);
});

router.get('/cashflow', (req: Request, res: Response) => {
  const inventory = db.getInventory().map(enrichItem);
  const totalStockValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);
  
  const totalMonthlyRunway = inventory.reduce((sum, item) => {
    return sum + (item.avgSalesLast30Days * 30 * item.price);
  }, 0);

  res.json({
    expectedSales: Math.round(totalMonthlyRunway),
    expectedPurchases: Math.round(totalStockValue * 0.4),
    net: Math.round(totalMonthlyRunway - (totalStockValue * 0.4)),
    status: totalMonthlyRunway > (totalStockValue * 0.4) ? "safe" : "risk"
  });
});

router.get('/recommendations', async (req: Request, res: Response) => {
  const inventory = db.getInventory().map(enrichItem);
  
  const reorder: { product: string; reason: string }[] = [];
  const avoidBuying: { product: string; reason: string }[] = [];
  const discount: { product: string; suggestion: string }[] = [];

  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  const upcomingFestivals = db.getUpcomingFestivals();

  for (const item of inventory) {
    let mlSpikeDetected = false;
    try {
      const response = await axios.post(`${mlServiceUrl}/forecast`, {
        product: item.name,
        sales_history: item.salesHistory,
        upcoming_festivals: upcomingFestivals
      }, { timeout: 2000 });
      if (response.data.forecast.some((v: number) => v > 25)) mlSpikeDetected = true;
    } catch (e) {}

    if (item.avgSalesLast30Days < 1 && item.stock > 20) {
      discount.push({ product: item.name, suggestion: "Apply 15% Clearance" });
      avoidBuying.push({ product: item.name, reason: "Stagnant inventory" });
    } else if (item.stock < (item.avgSalesLast30Days * 5) || mlSpikeDetected) {
      reorder.push({ 
        product: item.name, 
        reason: mlSpikeDetected ? "ML predicted festival surge" : "Stock below 5-day safety buffer" 
      });
    } else {
      avoidBuying.push({ product: item.name, reason: "Healthy stock levels" });
    }
  }

  res.json({ reorder, avoidBuying, discount });
});

router.get('/forecast', async (req: Request, res: Response) => {
  try {
    const inventory = db.getInventory().map(enrichItem);
    const forecastData = await getForecast(inventory, db.getUpcomingFestivals());
    res.json(forecastData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

router.post('/reorder', (req: Request, res: Response): void => {
  const { product, quantity } = req.body;
  const whatsappLink = `https://wa.me/919849502727?text=Order%20for%20${product}:%20${quantity}%20units.`;
  res.json({ success: true, whatsappLink });
});

router.get('/stock', (req: Request, res: Response) => {
  const inventory = db.getInventory().map(enrichItem).map(i => ({
    name: i.name,
    stock: i.stock,
    price: i.price,
    salesLast30Days: i.salesLast30Days,
    avgSalesLast30Days: i.avgSalesLast30Days
  }));
  res.json({ success: true, inventory });
});

router.post('/pos-sync', async (req: Request, res: Response) => {
  db.updateStock('Rice', -5);
  db.updateStock('Oil', -3);
  res.json({ success: true, message: 'POS synced' });
});

router.post('/pos-upload', async (req: Request, res: Response) => {
  if (req.body.csvData) {
    const lines = req.body.csvData.split('\n').slice(1);
    lines.forEach((l: string) => {
      const [p, q] = l.split(',');
      if (p && q) db.updateStock(p.trim(), -Number(q.trim()));
    });
  } else if (Array.isArray(req.body)) {
    req.body.forEach((i: any) => db.updateStock(i.product, -i.quantity));
  }
  res.json({ success: true });
});

router.post('/update-stock', async (req: Request, res: Response) => {
  const { product, quantity } = req.body;
  db.updateStock(product, quantity);
  res.json({ success: true });
});

export default router;
