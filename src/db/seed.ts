import { db } from './index';
import { products } from './schema';

async function seed() {
  console.log('Seeding initial Ecolife farm inventory...');
  
  await db.insert(products).values([
    { name: 'Royal Sidr Honey', category: 'Honey', subcategory: 'Sidr', price: '45.00', stock: 50, weight: '500g', description: 'Pure organic raw Sidr honey harvested from desert valleys.', benefits: 'Boosts immunity and digestive health.', imageUrl: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae' },
    { name: 'Manuka Honey UMF 15+', category: 'Honey', subcategory: 'Manuka', price: '65.00', stock: 30, weight: '250g', description: 'Grade UMF 15+ authentic medical grade honey.', benefits: 'High antibacterial properties.', imageUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924' },
    { name: 'Pure Acacia Honey', category: 'Honey', subcategory: 'Acacia', price: '25.00', stock: 80, weight: '500g', description: 'Light, sweet honey with a delicate floral aroma.', benefits: 'Low glycemic index sweetener.', imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62' },
    { name: 'Wildflower Mountain Honey', category: 'Honey', subcategory: 'Wildflower', price: '22.00', stock: 60, weight: '500g', description: 'Rich floral flavor collected from mountain blossoms.', benefits: 'Helps fight seasonal allergies.', imageUrl: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae' },
    { name: 'Organic Black Seed Honey', category: 'Honey', subcategory: 'Black Seed', price: '35.00', stock: 40, weight: '500g', description: 'Infused with cold-pressed Nigella Sativa.', benefits: 'Supports respiratory wellness.', imageUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924' },
    { name: 'Fresh Farm Raw Milk', category: 'Milk', price: '4.50', stock: 100, weight: '1L', description: 'Unpasteurized fresh morning raw cow milk.', benefits: 'Rich in active enzymes and calcium.', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150' },
    { name: 'Extra Virgin Olive Oil', category: 'Olive Oil', price: '18.00', stock: 120, weight: '750ml', description: 'First cold-pressed unrefined organic olive oil.', benefits: 'High in antioxidants and healthy fats.', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5' },
    { name: 'Free-Range Pastured Eggs', category: 'Eggs', price: '6.00', stock: 200, weight: '12 pcs', description: 'Freshly gathered eggs from outdoor pasture hens.', benefits: 'High Omega-3 and Vitamin D.', imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a' },
    { name: 'Artisanal Goat Cheese', category: 'Dairy', price: '8.50', stock: 25, weight: '200g', description: 'Handcrafted fresh goat cheese in olive oil.', benefits: 'Easier to digest than cow dairy.', imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d' },
    { name: 'Traditional Organic Butter', category: 'Dairy', price: '7.00', stock: 40, weight: '250g', description: 'Slow-churned grass-fed cream butter.', benefits: 'Rich in Vitamin K2 and CLA.', imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d' },
  ]);

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed();
