import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Starting database seed...');

  // 1. Clean existing records in correct relation order
  await prisma.promotion.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('🧹 [SEED] Existing data cleaned.');

  // 2. Insert 4 Categories
  const categoryBebidas = await prisma.category.create({
    data: {
      name: 'Bebidas',
      description: 'Refrescos, aguas minerales, jugos naturales y bebidas energéticas',
    },
  });

  const categorySnacks = await prisma.category.create({
    data: {
      name: 'Snacks',
      description: 'Papas fritas, galletas, frutos secos y aperitivos salados',
    },
  });

  const categoryLacteos = await prisma.category.create({
    data: {
      name: 'Lácteos',
      description: 'Leche entera, yogures, quesos frescos y mantequillas',
    },
  });

  const categoryAbarrotes = await prisma.category.create({
    data: {
      name: 'Abarrotes',
      description: 'Arroz, aceites vegetales, pastas, granos y productos de despensa',
    },
  });

  console.log('✅ [SEED] 4 Categories created.');

  // 3. Insert 6 Products with realistic COP prices and SKUs
  const p1 = await prisma.product.create({
    data: {
      name: 'Coca Cola Original 1.5L',
      sku: 'BEB-COCA-1500',
      price: 6800,
      categoryId: categoryBebidas.id,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'Agua Mineral Sin Gas 600ml',
      sku: 'BEB-AGUA-0600',
      price: 2500,
      categoryId: categoryBebidas.id,
    },
  });

  const p3 = await prisma.product.create({
    data: {
      name: 'Papas Lays Clásicas 160g',
      sku: 'SNK-LAYS-0160',
      price: 5200,
      categoryId: categorySnacks.id,
    },
  });

  const p4 = await prisma.product.create({
    data: {
      name: 'Galletas Oreo Original 108g',
      sku: 'SNK-OREO-0108',
      price: 3400,
      categoryId: categorySnacks.id,
    },
  });

  const p5 = await prisma.product.create({
    data: {
      name: 'Leche Entera Tetra Pak 1L',
      sku: 'LAC-LECH-1000',
      price: 4500,
      categoryId: categoryLacteos.id,
    },
  });

  const p6 = await prisma.product.create({
    data: {
      name: 'Arroz Superior Extra 1kg',
      sku: 'ABA-ARRO-1000',
      price: 4900,
      categoryId: categoryAbarrotes.id,
    },
  });

  console.log('✅ [SEED] 6 Products created.');

  // 4. Create Sample Promotions with COP values
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Promotion 1: Associated to category 'Bebidas' (20% off)
  await prisma.promotion.create({
    data: {
      code: 'VERANO-BEBIDAS-20',
      name: 'Especial Verano en Bebidas',
      description: '20% de descuento en toda la categoría de bebidas',
      type: 'PERCENTAGE',
      value: 20,
      minSpend: 20000,
      maxDiscount: 15000,
      startDate: now,
      endDate: nextMonth,
      status: 'ACTIVE',
      categoryId: categoryBebidas.id,
    },
  });

  // Promotion 2: Associated to specific product 'Papas Lays' ($1.500 COP off)
  await prisma.promotion.create({
    data: {
      code: 'SNACK-LAYS-OFF',
      name: 'Descuento Directo en Papas Lays',
      description: '$ 1.500 de ahorro en Papas Lays 160g',
      type: 'FIXED_AMOUNT',
      value: 1500,
      startDate: now,
      endDate: nextMonth,
      status: 'ACTIVE',
      productId: p3.id,
    },
  });

  // Promotion 3: Global scheduled promo (15% off cart)
  await prisma.promotion.create({
    data: {
      code: 'CYBER-PROMO-15',
      name: 'Cyber Promo Global 15%',
      description: '15% de descuento en toda la tienda para compras mayores a $ 50.000',
      type: 'PERCENTAGE',
      value: 15,
      minSpend: 50000,
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      status: 'SCHEDULED',
    },
  });

  console.log('✅ [SEED] Sample Promotions created.');
  console.log('🚀 [SEED] Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ [SEED ERROR]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
