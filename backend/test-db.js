const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString.replace(/:[^:@]*@/, ':****@'));

const client = new Client({
  connectionString: process.env.DATABASE_URL.replace('5432', '6543') + '?pgbouncer=true',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0].now);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
    process.exit(1);
  }
}

testConnection();
