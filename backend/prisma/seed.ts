import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function upsertMenuItem(data: any) {
  return prisma.menuItem.upsert({
    where: { id: data.id },
    update: {},
    create: data,
  });
}

async function main() {
  console.log('🌱 Seeding database...');

  const adminPass = await argon2.hash('Admin@1234');
  const managerPass = await argon2.hash('Manager@1234');
  const memberPass = await argon2.hash('Member@1234');

  const adminIndia = await prisma.user.upsert({
    where: { email: 'admin.india@slooze.com' },
    update: {},
    create: { email: 'admin.india@slooze.com', password: adminPass, name: 'Admin India', role: 'ADMIN', country: 'INDIA' },
  });

  const adminAmerica = await prisma.user.upsert({
    where: { email: 'admin.us@slooze.com' },
    update: {},
    create: { email: 'admin.us@slooze.com', password: adminPass, name: 'Admin America', role: 'ADMIN', country: 'AMERICA' },
  });

  await prisma.user.upsert({
    where: { email: 'manager.india@slooze.com' },
    update: {},
    create: { email: 'manager.india@slooze.com', password: managerPass, name: 'Manager India', role: 'MANAGER', country: 'INDIA' },
  });

  await prisma.user.upsert({
    where: { email: 'manager.us@slooze.com' },
    update: {},
    create: { email: 'manager.us@slooze.com', password: managerPass, name: 'Manager America', role: 'MANAGER', country: 'AMERICA' },
  });

  await prisma.user.upsert({
    where: { email: 'member.india@slooze.com' },
    update: {},
    create: { email: 'member.india@slooze.com', password: memberPass, name: 'Member India', role: 'MEMBER', country: 'INDIA' },
  });

  await prisma.user.upsert({
    where: { email: 'member.us@slooze.com' },
    update: {},
    create: { email: 'member.us@slooze.com', password: memberPass, name: 'Member America', role: 'MEMBER', country: 'AMERICA' },
  });

  console.log('✅ Users created');

  // Indian Restaurants
  const biryaniHouse = await prisma.restaurant.upsert({
    where: { id: 'rest-india-1' },
    update: {},
    create: { id: 'rest-india-1', name: 'Biryani House', country: 'INDIA', cuisine: 'Indian', address: '12 MG Road, Bangalore, Karnataka', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
  });

  for (const item of [
    { id: 'mi-india-1-1', restaurantId: biryaniHouse.id, name: 'Chicken Biryani', description: 'Fragrant basmati rice with tender chicken', price: 299, category: 'Main Course' },
    { id: 'mi-india-1-2', restaurantId: biryaniHouse.id, name: 'Veg Biryani', description: 'Aromatic biryani with seasonal vegetables', price: 199, category: 'Main Course' },
    { id: 'mi-india-1-3', restaurantId: biryaniHouse.id, name: 'Mutton Biryani', description: 'Slow-cooked mutton with saffron rice', price: 399, category: 'Main Course' },
    { id: 'mi-india-1-4', restaurantId: biryaniHouse.id, name: 'Raita', description: 'Cooling yogurt with cucumber', price: 49, category: 'Sides' },
    { id: 'mi-india-1-5', restaurantId: biryaniHouse.id, name: 'Gulab Jamun', description: 'Soft milk solid dumplings in syrup', price: 79, category: 'Desserts' },
  ]) { await upsertMenuItem(item); }

  const spiceCafe = await prisma.restaurant.upsert({
    where: { id: 'rest-india-2' },
    update: {},
    create: { id: 'rest-india-2', name: 'Spice Cafe', country: 'INDIA', cuisine: 'North Indian', address: '45 Connaught Place, New Delhi', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
  });

  for (const item of [
    { id: 'mi-india-2-1', restaurantId: spiceCafe.id, name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 349, category: 'Main Course' },
    { id: 'mi-india-2-2', restaurantId: spiceCafe.id, name: 'Dal Makhani', description: 'Slow-cooked black lentils with butter', price: 229, category: 'Main Course' },
    { id: 'mi-india-2-3', restaurantId: spiceCafe.id, name: 'Garlic Naan', description: 'Tandoor-baked bread with garlic butter', price: 59, category: 'Breads' },
    { id: 'mi-india-2-4', restaurantId: spiceCafe.id, name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 279, category: 'Starters' },
    { id: 'mi-india-2-5', restaurantId: spiceCafe.id, name: 'Mango Lassi', description: 'Chilled yogurt drink with mango', price: 89, category: 'Beverages' },
  ]) { await upsertMenuItem(item); }

  const southDelight = await prisma.restaurant.upsert({
    where: { id: 'rest-india-3' },
    update: {},
    create: { id: 'rest-india-3', name: 'South Delight', country: 'INDIA', cuisine: 'South Indian', address: '8 Anna Salai, Chennai, Tamil Nadu', imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400' },
  });

  for (const item of [
    { id: 'mi-india-3-1', restaurantId: southDelight.id, name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 129, category: 'Breakfast' },
    { id: 'mi-india-3-2', restaurantId: southDelight.id, name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', price: 89, category: 'Breakfast' },
    { id: 'mi-india-3-3', restaurantId: southDelight.id, name: 'Chettinad Chicken', description: 'Spicy chicken curry from Chettinad', price: 329, category: 'Main Course' },
    { id: 'mi-india-3-4', restaurantId: southDelight.id, name: 'Filter Coffee', description: 'Strong South Indian coffee with milk', price: 49, category: 'Beverages' },
    { id: 'mi-india-3-5', restaurantId: southDelight.id, name: 'Payasam', description: 'Sweet vermicelli pudding', price: 79, category: 'Desserts' },
  ]) { await upsertMenuItem(item); }

  console.log('✅ Indian restaurants & menus created');

  // American Restaurants
  const burgerJoint = await prisma.restaurant.upsert({
    where: { id: 'rest-us-1' },
    update: {},
    create: { id: 'rest-us-1', name: 'The Burger Joint', country: 'AMERICA', cuisine: 'American', address: '123 5th Ave, New York, NY 10001', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  });

  for (const item of [
    { id: 'mi-us-1-1', restaurantId: burgerJoint.id, name: 'Classic Cheeseburger', description: 'Beef patty with cheddar, lettuce, and tomato', price: 12.99, category: 'Burgers' },
    { id: 'mi-us-1-2', restaurantId: burgerJoint.id, name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce with crispy bacon', price: 15.99, category: 'Burgers' },
    { id: 'mi-us-1-3', restaurantId: burgerJoint.id, name: 'Veggie Burger', description: 'Plant-based patty with avocado', price: 13.99, category: 'Burgers' },
    { id: 'mi-us-1-4', restaurantId: burgerJoint.id, name: 'Loaded Fries', description: 'Crispy fries with cheese sauce and jalapeños', price: 7.99, category: 'Sides' },
    { id: 'mi-us-1-5', restaurantId: burgerJoint.id, name: 'Chocolate Milkshake', description: 'Thick creamy chocolate shake', price: 6.99, category: 'Beverages' },
  ]) { await upsertMenuItem(item); }

  const pizzaPalace = await prisma.restaurant.upsert({
    where: { id: 'rest-us-2' },
    update: {},
    create: { id: 'rest-us-2', name: 'Pizza Palace', country: 'AMERICA', cuisine: 'Italian-American', address: '456 Hollywood Blvd, Los Angeles, CA', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  });

  for (const item of [
    { id: 'mi-us-2-1', restaurantId: pizzaPalace.id, name: 'Margherita Pizza', description: 'San Marzano tomatoes, fresh mozzarella, basil', price: 14.99, category: 'Pizza' },
    { id: 'mi-us-2-2', restaurantId: pizzaPalace.id, name: 'Pepperoni Pizza', description: 'Classic pepperoni with extra cheese', price: 16.99, category: 'Pizza' },
    { id: 'mi-us-2-3', restaurantId: pizzaPalace.id, name: 'BBQ Chicken Pizza', description: 'Smoky BBQ base with grilled chicken', price: 17.99, category: 'Pizza' },
    { id: 'mi-us-2-4', restaurantId: pizzaPalace.id, name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons', price: 9.99, category: 'Salads' },
    { id: 'mi-us-2-5', restaurantId: pizzaPalace.id, name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 7.99, category: 'Desserts' },
  ]) { await upsertMenuItem(item); }

  const texMex = await prisma.restaurant.upsert({
    where: { id: 'rest-us-3' },
    update: {},
    create: { id: 'rest-us-3', name: 'Tex-Mex Grill', country: 'AMERICA', cuisine: 'Tex-Mex', address: '789 Elm Street, Austin, TX 78701', imageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400' },
  });

  for (const item of [
    { id: 'mi-us-3-1', restaurantId: texMex.id, name: 'Beef Tacos', description: 'Three tacos with seasoned beef, salsa, and sour cream', price: 11.99, category: 'Tacos' },
    { id: 'mi-us-3-2', restaurantId: texMex.id, name: 'Chicken Burrito', description: 'Grilled chicken, rice, beans, and cheese', price: 13.99, category: 'Burritos' },
    { id: 'mi-us-3-3', restaurantId: texMex.id, name: 'Nachos Supreme', description: 'Chips with all toppings and guacamole', price: 12.99, category: 'Appetizers' },
    { id: 'mi-us-3-4', restaurantId: texMex.id, name: 'Guacamole & Chips', description: 'Fresh avocado dip with tortilla chips', price: 8.99, category: 'Appetizers' },
    { id: 'mi-us-3-5', restaurantId: texMex.id, name: 'Horchata', description: 'Sweet rice milk drink with cinnamon', price: 4.99, category: 'Beverages' },
  ]) { await upsertMenuItem(item); }

  console.log('✅ American restaurants & menus created');

  // Payment methods for admin users
  for (const pm of [
    { id: 'pm-india-1', userId: adminIndia.id, type: 'CARD', label: 'HDFC Credit Card', last4: '4242', isDefault: true },
    { id: 'pm-india-2', userId: adminIndia.id, type: 'UPI', label: 'GPay UPI', last4: null, isDefault: false },
    { id: 'pm-us-1', userId: adminAmerica.id, type: 'CARD', label: 'Chase Visa', last4: '1234', isDefault: true },
    { id: 'pm-us-2', userId: adminAmerica.id, type: 'CARD', label: 'Amex Gold', last4: '5678', isDefault: false },
  ]) {
    await prisma.paymentMethod.upsert({
      where: { id: pm.id },
      update: {},
      create: pm,
    });
  }

  console.log('✅ Payment methods created');
  console.log('\n🎉 Seed complete! Test accounts:');
  console.log('  Admin India:   admin.india@slooze.com / Admin@1234');
  console.log('  Admin America: admin.us@slooze.com / Admin@1234');
  console.log('  Manager India: manager.india@slooze.com / Manager@1234');
  console.log('  Manager US:    manager.us@slooze.com / Manager@1234');
  console.log('  Member India:  member.india@slooze.com / Member@1234');
  console.log('  Member US:     member.us@slooze.com / Member@1234');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
