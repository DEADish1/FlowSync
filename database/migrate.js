#!/usr/bin/env node

/**
 * Database Migration Runner
 *
 * Manages database schema migrations with:
 * - Version tracking
 * - Up/Down migrations
 * - Transaction support
 * - Migration history
 *
 * Usage:
 *   node database/migrate.js up      # Apply pending migrations
 *   node database/migrate.js down    # Rollback last migration
 *   node database/migrate.js status  # Show migration status
 *   node database/migrate.js create <name>  # Create new migration
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flowsync',
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Ensure migrations table exists
 */
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Get applied migrations
 */
async function getAppliedMigrations() {
  const result = await pool.query(
    `SELECT version FROM ${MIGRATIONS_TABLE} ORDER BY version ASC`
  );
  return result.rows.map(row => row.version);
}

/**
 * Get available migration files
 */
function getAvailableMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

/**
 * Get pending migrations
 */
async function getPendingMigrations() {
  const applied = await getAppliedMigrations();
  const available = getAvailableMigrations();

  return available.filter(migration => {
    const version = migration.split('_')[0];
    return !applied.includes(version);
  });
}

/**
 * Apply a single migration
 */
async function applyMigration(filename) {
  const version = filename.split('_')[0];
  const name = filename.replace('.sql', '').substring(version.length + 1);
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');

  console.log(`Applying migration: ${filename}`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Run migration SQL
    await client.query(sql);

    // Record migration
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (version, name) VALUES ($1, $2)`,
      [version, name]
    );

    await client.query('COMMIT');
    console.log(`✓ Applied: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Failed to apply ${filename}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Rollback last migration
 */
async function rollbackMigration() {
  const applied = await getAppliedMigrations();

  if (applied.length === 0) {
    console.log('No migrations to rollback');
    return;
  }

  const lastVersion = applied[applied.length - 1];
  const filename = getAvailableMigrations().find(f => f.startsWith(lastVersion));

  if (!filename) {
    console.error(`Migration file not found for version: ${lastVersion}`);
    return;
  }

  const filepath = path.join(MIGRATIONS_DIR, filename);
  const content = fs.readFileSync(filepath, 'utf8');

  // Look for -- DOWN section
  const downSection = content.split('-- DOWN')[1];

  if (!downSection) {
    console.error(`No DOWN section found in ${filename}`);
    console.log('Migration files should include -- DOWN section with rollback SQL');
    return;
  }

  console.log(`Rolling back migration: ${filename}`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Run rollback SQL
    await client.query(downSection.trim());

    // Remove migration record
    await client.query(
      `DELETE FROM ${MIGRATIONS_TABLE} WHERE version = $1`,
      [lastVersion]
    );

    await client.query('COMMIT');
    console.log(`✓ Rolled back: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Failed to rollback ${filename}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Show migration status
 */
async function showStatus() {
  const applied = await getAppliedMigrations();
  const available = getAvailableMigrations();
  const pending = await getPendingMigrations();

  console.log('\n=== Migration Status ===\n');
  console.log(`Total migrations: ${available.length}`);
  console.log(`Applied: ${applied.length}`);
  console.log(`Pending: ${pending.length}`);

  if (applied.length > 0) {
    console.log('\nApplied migrations:');
    for (const version of applied) {
      const filename = available.find(f => f.startsWith(version));
      console.log(`  ✓ ${filename || version}`);
    }
  }

  if (pending.length > 0) {
    console.log('\nPending migrations:');
    for (const filename of pending) {
      console.log(`  ○ ${filename}`);
    }
  }

  console.log('');
}

/**
 * Create a new migration file
 */
function createMigration(name) {
  if (!name) {
    console.error('Migration name is required');
    console.log('Usage: node database/migrate.js create <name>');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '');
  const filename = `${timestamp}_${name.replace(/\s+/g, '_')}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- UP
-- Add your migration SQL here



-- DOWN
-- Add your rollback SQL here


`;

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }

  fs.writeFileSync(filepath, template);
  console.log(`Created migration: ${filename}`);
}

/**
 * Main command handler
 */
async function main() {
  const command = process.argv[2];

  try {
    await ensureMigrationsTable();

    switch (command) {
      case 'up':
        const pending = await getPendingMigrations();
        if (pending.length === 0) {
          console.log('No pending migrations');
        } else {
          for (const filename of pending) {
            await applyMigration(filename);
          }
          console.log(`\n✓ Applied ${pending.length} migration(s)`);
        }
        break;

      case 'down':
        await rollbackMigration();
        break;

      case 'status':
        await showStatus();
        break;

      case 'create':
        createMigration(process.argv[3]);
        break;

      default:
        console.log('Usage:');
        console.log('  node database/migrate.js up           # Apply pending migrations');
        console.log('  node database/migrate.js down         # Rollback last migration');
        console.log('  node database/migrate.js status       # Show migration status');
        console.log('  node database/migrate.js create <name> # Create new migration');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
