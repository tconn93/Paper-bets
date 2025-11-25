import pool from './src/database/db.js';

async function dropConstraint() {
  try {
    await pool.query('ALTER TABLE bets DROP CONSTRAINT IF EXISTS positive_odds');
    console.log('Constraint dropped successfully');
  } catch (error) {
    console.error('Error dropping constraint:', error);
  } finally {
    await pool.end();
  }
}

dropConstraint();