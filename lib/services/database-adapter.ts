// Database adapter to work with existing tables
// This will inspect existing table structure and adapt our services accordingly

import { executeQuery } from '@/lib/database';

export async function getTableStructure(tableName: string) {
  try {
    const query = `DESCRIBE ${tableName}`;
    const results = await executeQuery(query);
    return results;
  } catch (error) {
    console.error(`Error getting structure for table ${tableName}:`, error);
    return null;
  }
}

export async function getAllTables() {
  try {
    const query = `SHOW TABLES`;
    const results = await executeQuery(query) as any[];
    return results.map((row: any) => Object.values(row)[0]);
  } catch (error) {
    console.error('Error getting tables:', error);
    return [];
  }
}

export async function checkTableExists(tableName: string) {
  try {
    console.log(`Checking if table '${tableName}' exists...`);
    const query = `SHOW TABLES LIKE ?`;
    const results = await executeQuery(query, [tableName]) as any[];
    console.log(`Table '${tableName}' exists:`, results.length > 0);
    return results.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Generic function to get all records from any table
export async function getAllRecords(tableName: string, orderBy?: string) {
  try {
    let query = `SELECT * FROM ${tableName}`;
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    const results = await executeQuery(query);
    return results;
  } catch (error) {
    console.error(`Error getting records from ${tableName}:`, error);
    return [];
  }
}

// Generic function to get record by ID
export async function getRecordById(tableName: string, id: string, idColumn: string = 'id') {
  try {
    const query = `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`;
    const results = await executeQuery(query, [id]) as any[];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error getting record from ${tableName}:`, error);
    return null;
  }
}

// Generic function to insert record
export async function insertRecord(tableName: string, data: Record<string, any>) {
  try {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = await executeQuery(query, values);
    return result;
  } catch (error) {
    console.error(`Error inserting record into ${tableName}:`, error);
    throw error;
  }
}

// Generic function to update record
export async function updateRecord(tableName: string, id: string, data: Record<string, any>, idColumn: string = 'id') {
  try {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = ?`;
    const result = await executeQuery(query, [...values, id]);
    return result;
  } catch (error) {
    console.error(`Error updating record in ${tableName}:`, error);
    throw error;
  }
}