/**
 * MongoDB Database Setup and Seed Script
 * 
 * This script initializes the financial_db database with:
 * - Collection creation with indexes
 * - Sample data for testing
 * 
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financial_db';

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;

    // Drop existing collections (for clean seed)
    console.log('\n🗑️  Dropping existing collections...');
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      if (['users', 'bank_transactions', 'mutual_fund_holdings', 'equity_holdings'].includes(col.name)) {
        await db.dropCollection(col.name);
        console.log(`   Dropped: ${col.name}`);
      }
    }

    // Create collections
    console.log('\n📁 Creating collections...');
    await db.createCollection('users');
    await db.createCollection('bank_transactions');
    await db.createCollection('mutual_fund_holdings');
    await db.createCollection('equity_holdings');
    console.log('   Created: users, bank_transactions, mutual_fund_holdings, equity_holdings');

    // Create indexes
    console.log('\n🔍 Creating indexes...');
    await db.collection('users').createIndex({ _id: 1 });
    await db.collection('bank_transactions').createIndex({ user_id: 1 });
    await db.collection('bank_transactions').createIndex({ category: 1 });
    await db.collection('bank_transactions').createIndex({ transaction_date: -1 });
    await db.collection('mutual_fund_holdings').createIndex({ user_id: 1 });
    await db.collection('equity_holdings').createIndex({ user_id: 1 });
    await db.collection('equity_holdings').createIndex({ stock_name: 1 });
    console.log('   Indexes created successfully');

    // Generate UUIDs for users
    const user1Id = uuidv4();
    const user2Id = uuidv4();

    // Insert Users
    console.log('\n👤 Inserting users...');
    await db.collection('users').insertMany([
      { _id: user1Id, name: 'Rahul Sharma' },
      { _id: user2Id, name: 'Priya Patel' }
    ]);
    console.log('   Inserted 2 users');

    // Insert Bank Transactions
    console.log('\n💳 Inserting bank transactions...');
    await db.collection('bank_transactions').insertMany([
      // User 1 transactions
      {
        _id: uuidv4(),
        user_id: user1Id,
        amount: 2500.00,
        category: 'food',
        merchant: 'Swiggy',
        transaction_date: new Date('2024-12-15')
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        amount: 15000.00,
        category: 'travel',
        merchant: 'MakeMyTrip',
        transaction_date: new Date('2024-12-10')
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        amount: 5000.00,
        category: 'shopping',
        merchant: 'Amazon',
        transaction_date: new Date('2024-12-08')
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        amount: 3500.00,
        category: 'bills',
        merchant: 'Electricity Board',
        transaction_date: new Date('2024-12-05')
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        amount: 1800.00,
        category: 'food',
        merchant: 'Zomato',
        transaction_date: new Date('2024-12-03')
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        amount: 8500.00,
        category: 'shopping',
        merchant: 'Flipkart',
        transaction_date: new Date('2024-12-01')
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        amount: 2000.00,
        category: 'bills',
        merchant: 'Jio',
        transaction_date: new Date('2024-11-28')
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        amount: 12000.00,
        category: 'other',
        merchant: 'Medical Store',
        transaction_date: new Date('2024-11-25')
      },
      // User 2 transactions
      {
        _id: uuidv4(),
        user_id: user2Id,
        amount: 1200.00,
        category: 'food',
        merchant: 'Zomato',
        transaction_date: new Date('2024-12-14')
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        amount: 8000.00,
        category: 'shopping',
        merchant: 'Flipkart',
        transaction_date: new Date('2024-12-12')
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        amount: 25000.00,
        category: 'travel',
        merchant: 'IRCTC',
        transaction_date: new Date('2024-12-09')
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        amount: 4500.00,
        category: 'bills',
        merchant: 'Gas Agency',
        transaction_date: new Date('2024-12-06')
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        amount: 3200.00,
        category: 'food',
        merchant: 'Swiggy',
        transaction_date: new Date('2024-12-04')
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        amount: 15000.00,
        category: 'other',
        merchant: 'Insurance Premium',
        transaction_date: new Date('2024-12-02')
      }
    ]);
    console.log('   Inserted 14 bank transactions');

    // Insert Mutual Fund Holdings
    console.log('\n📈 Inserting mutual fund holdings...');
    await db.collection('mutual_fund_holdings').insertMany([
      // User 1 mutual funds
      {
        _id: uuidv4(),
        user_id: user1Id,
        scheme_name: 'HDFC Top 100 Fund',
        invested_value: 50000.00,
        current_value: 58500.00
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        scheme_name: 'SBI Bluechip Fund',
        invested_value: 30000.00,
        current_value: 33200.00
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        scheme_name: 'ICICI Prudential Value Discovery',
        invested_value: 25000.00,
        current_value: 28750.00
      },
      // User 2 mutual funds
      {
        _id: uuidv4(),
        user_id: user2Id,
        scheme_name: 'Axis Long Term Equity Fund',
        invested_value: 75000.00,
        current_value: 82000.00
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        scheme_name: 'Mirae Asset Large Cap Fund',
        invested_value: 40000.00,
        current_value: 45200.00
      }
    ]);
    console.log('   Inserted 5 mutual fund holdings');

    // Insert Equity Holdings
    console.log('\n📊 Inserting equity holdings...');
    await db.collection('equity_holdings').insertMany([
      // User 1 stocks
      {
        _id: uuidv4(),
        user_id: user1Id,
        stock_name: 'Reliance Industries',
        quantity: 25,
        current_price: 2680.50
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        stock_name: 'TCS',
        quantity: 15,
        current_price: 3450.00
      },
      {
        _id: uuidv4(),
        user_id: user1Id,
        stock_name: 'HDFC Bank',
        quantity: 30,
        current_price: 1680.00
      },
      // User 2 stocks
      {
        _id: uuidv4(),
        user_id: user2Id,
        stock_name: 'Infosys',
        quantity: 30,
        current_price: 1520.75
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        stock_name: 'HDFC Bank',
        quantity: 20,
        current_price: 1680.00
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        stock_name: 'Wipro',
        quantity: 50,
        current_price: 450.25
      },
      {
        _id: uuidv4(),
        user_id: user2Id,
        stock_name: 'Bharti Airtel',
        quantity: 40,
        current_price: 1250.00
      }
    ]);
    console.log('   Inserted 7 equity holdings');

    // Verify data
    console.log('\n✅ Verifying inserted data...');
    const usersCount = await db.collection('users').countDocuments();
    const transactionsCount = await db.collection('bank_transactions').countDocuments();
    const mutualFundsCount = await db.collection('mutual_fund_holdings').countDocuments();
    const equitiesCount = await db.collection('equity_holdings').countDocuments();

    console.log(`   Users: ${usersCount}`);
    console.log(`   Bank Transactions: ${transactionsCount}`);
    console.log(`   Mutual Fund Holdings: ${mutualFundsCount}`);
    console.log(`   Equity Holdings: ${equitiesCount}`);

    // Show sample data
    console.log('\n📋 Sample Data Preview:');
    console.log('\n--- Users ---');
    const users = await db.collection('users').find().toArray();
    users.forEach(u => console.log(`   ${u.name} (ID: ${u._id})`));

    console.log('\n--- Transaction Categories Summary (User 1) ---');
    const categorySum = await db.collection('bank_transactions').aggregate([
      { $match: { user_id: user1Id } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]).toArray();
    categorySum.forEach(c => console.log(`   ${c._id}: ₹${c.total.toLocaleString()}`));

    console.log('\n--- Mutual Fund Holdings Summary (User 1) ---');
    const mfHoldings = await db.collection('mutual_fund_holdings').find({ user_id: user1Id }).toArray();
    let totalInvested = 0, totalCurrent = 0;
    mfHoldings.forEach(m => {
      totalInvested += m.invested_value;
      totalCurrent += m.current_value;
      console.log(`   ${m.scheme_name}: ₹${m.current_value.toLocaleString()}`);
    });
    console.log(`   Total MF Value: ₹${totalCurrent.toLocaleString()} (Invested: ₹${totalInvested.toLocaleString()})`);

    console.log('\n--- Equity Holdings Summary (User 1) ---');
    const eqHoldings = await db.collection('equity_holdings').find({ user_id: user1Id }).toArray();
    let totalEqValue = 0;
    eqHoldings.forEach(e => {
      const value = e.quantity * e.current_price;
      totalEqValue += value;
      console.log(`   ${e.stock_name}: ${e.quantity} shares @ ₹${e.current_price} = ₹${value.toLocaleString()}`);
    });
    console.log(`   Total Equity Value: ₹${totalEqValue.toLocaleString()}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('=========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
