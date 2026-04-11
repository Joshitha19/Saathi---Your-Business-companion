export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  price: number;
}

export interface SaleRecord {
  date: string;
  sales: number;
  isFestival: boolean;
}

export interface SyntheticData {
  inventory: InventoryItem[];
  salesHistory: Record<string, SaleRecord[]>;
  upcomingFestivals: boolean[]; // tracks next 10 days
}

const PRODUCTS = ['Rice', 'Oil', 'Sugar', 'Milk', 'Biscuits', 'Soft Drinks', 'Atta'];
const SLOW_MOVING_PRODUCTS = ['Biscuits', 'Soft Drinks'];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRealisticPrice(product: string): number {
  const prices: Record<string, [number, number]> = {
    'Rice': [40, 80],
    'Oil': [120, 200],
    'Sugar': [40, 60],
    'Milk': [50, 80],
    'Biscuits': [10, 40],
    'Soft Drinks': [30, 90],
    'Atta': [35, 70]
  };
  const range = prices[product] || [10, 100];
  return getRandomInt(range[0], range[1]);
}

export const generateData = (): SyntheticData => {
  const inventory: InventoryItem[] = [];
  const salesHistory: Record<string, SaleRecord[]> = {};

  const daysToGenerate = 90;
  const today = new Date(); 
  
  // Designating festival indices. 
  // - 30/60 are historical. 
  // - 95 is exactly 5 days from today in the future!
  const FESTIVAL_INDICES = [30, 60, 95]; 

  for (const product of PRODUCTS) {
    inventory.push({
      id: product.toLowerCase().replace(' ', '_'),
      name: product,
      stock: getRandomInt(10, 100),
      price: getRealisticPrice(product)
    });

    const isSlowMoving = SLOW_MOVING_PRODUCTS.includes(product);
    const dailySales: SaleRecord[] = [];

    for (let i = 0; i < daysToGenerate; i++) {
        const targetDate = new Date(today.getTime() - (daysToGenerate - 1 - i) * 24 * 60 * 60 * 1000);
        const dayOfWeek = targetDate.getDay(); 
        
        const isFestival = FESTIVAL_INDICES.includes(i);
        let sales = 0;
        
        if (isSlowMoving) {
            sales = getRandomInt(0, 1); 
        } else {
            sales = getRandomInt(5, 20); 
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                sales = Math.floor(sales * 1.3);
            }
            if (isFestival) {
                sales = Math.floor(sales * 2.0); 
            }
        }
        
        dailySales.push({
            date: targetDate.toISOString().split('T')[0],
            sales,
            isFestival
        });
    }

    salesHistory[product] = dailySales;
  }

  const upcomingFestivals = [];
  for (let i = 0; i < 10; i++) {
    // Calculating future 10 days checking against index 90 through 99
    upcomingFestivals.push(FESTIVAL_INDICES.includes(daysToGenerate + i));
  }

  return { inventory, salesHistory, upcomingFestivals };
};
