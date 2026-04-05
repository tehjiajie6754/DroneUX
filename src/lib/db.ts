import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function openDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Initialize tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS deployments (
        id TEXT PRIMARY KEY,
        location TEXT,
        address TEXT,
        date TEXT,
        survivorsFound INTEGER,
        totalSurvivors INTEGER,
        coverage REAL,
        timeUsed INTEGER
      )
    `);
  }
  return db;
}
