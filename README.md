# PostgreSQL Data Accessor

[![npm version](https://badge.fury.io/js/postgresql-data-accessor.svg)](https://badge.fury.io/js/postgresql-data-accessor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

**Zero-config PostgreSQL data access with automatic schema discovery and intelligent upsert operations.**

## 🚀 Key Features

- **🔍 Auto Schema Scanning** - Automatically discovers table structure, primary keys, unique constraints
- **🔄 Smart Upsert** - Automatically handles insert/update based on unique constraints
- **🛡️ SQL Injection Protection** - Built-in parameterized queries
- **⚡ High Performance** - Efficient connection pooling and query optimization
- **🎯 Zero Configuration** - Works out of the box with standard PostgreSQL

## 📦 Installation

```bash
npm install postgresql-data-accessor dotenv
```

## 🚀 Quick Start

### 1. Setup Environment

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password
```

### 2. Initialize & Auto-Discover Schema

```javascript
require('dotenv').config();
const PostgreSQLAccessor = require('postgresql-data-accessor');

const accessor = new PostgreSQLAccessor();

// 🔍 Automatically scan table structure
await accessor.addTable('users');
await accessor.addTable('orders');

// Now the accessor knows:
// - All columns and types
// - Primary keys and unique constraints  
// - Foreign key relationships
```

### 3. Automatic Upsert Operations

```javascript
// 🔄 Smart upsert - automatically handles insert or update
const user = await accessor.upsert('users', {
  email: 'john@example.com',        // Unique constraint
  firstName: 'John',
  lastName: 'Doe',
  lastLoginAt: new Date()
}, { email: 'john@example.com' });

// This will:
// ✅ INSERT if email doesn't exist
// ✅ UPDATE if email exists
// ✅ Automatically detect unique constraints from schema
```

### 4. Full CRUD Operations

```javascript
// Create
const newUser = await accessor.create('users', {
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith'
});

// Read
const users = await accessor.read('users', { isActive: true });

// Update
await accessor.update('users', 
  { isActive: false }, 
  { email: 'john@example.com' }
);

// Delete
await accessor.delete('users', { email: 'john@example.com' });
```

## 🔍 How Auto Schema Discovery Works

The accessor automatically scans your PostgreSQL tables and discovers:

- **Column names and types**
- **Primary key constraints**
- **Unique constraints** (used for upsert operations)
- **Foreign key relationships**
- **Default values and constraints**

No manual schema definition needed!

## 🔄 How Smart Upsert Works

1. **Scans table schema** to find unique constraints
2. **Automatically determines** whether to INSERT or UPDATE
3. **Handles conflicts** gracefully using PostgreSQL's `ON CONFLICT`
4. **Zero configuration** - just specify your data and conditions

## 📚 API Reference

### Core Methods

- `addTable(tableName)` - Auto-discover table schema
- `upsert(table, data, conditions)` - Smart insert/update
- `create(table, data)` - Insert new record
- `read(table, conditions, options)` - Query with filtering
- `update(table, data, conditions)` - Update records
- `delete(table, conditions)` - Delete records

## 🧪 Testing

```bash
npm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the Node.js community**
