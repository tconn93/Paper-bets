import fs from 'fs';
import path from 'path';
import pool from './db';

const runMigration = async () => {
  try {
    console.log('Starting database migration...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    await pool.query(schema);

    console.log('Migration completed successfully!');
    console.log('Database tables created:');
    console.log('  - users');
    console.log('  - bets');
    console.log('  - transactions');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
