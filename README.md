# Easy PostgreSQL Accessor

[![npm version](https://badge.fury.io/js/easy-postgresql-accessor.svg)](https://badge.fury.io/js/easy-postgresql-accessor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

> **PostgreSQL data access that automatically knows your table structure and performs smart operations.**

## ✨ **What This Does**

**Automatically discover your PostgreSQL tables and perform intelligent CRUD operations without writing SQL or defining schemas.**

## 🚀 **Key Benefits**

| Feature | What You Get |
|---------|--------------|
| 🔍 **Auto Discovery** | Automatically learns table columns, constraints, and relationships |
| 🧠 **Smart Operations** | Intelligent upsert, CRUD, and batch operations |
| 🛡️ **SQL Injection Protection** | Built-in parameterized queries |
| ⚡ **Zero Configuration** | Works out of the box with PostgreSQL |

## 📦 **Installation**

```bash
npm install easy-postgresql-accessor
```

## ⚡ **Quick Start (3 Steps)**

### **Step 1: Setup Environment**
```bash
# Copy and edit environment file
cp env.example .env
```

**Edit `.env` with your database:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password
DB_SCHEMA=public
```

### **Step 2: Discover Tables**
```javascript
const PostgreSQLAccessor = require('easy-postgresql-accessor');

const accessor = new PostgreSQLAccessor();

// 🔍 Automatically learns table structure
await accessor.addTable('users');
await accessor.addTable('orders');
```

### **Step 3: Use Smart Operations**
```javascript
// 🧠 Smart upsert - automatically INSERT or UPDATE
const user = await accessor.upsert('users', {
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe'
}, { email: 'john@example.com' });

// ✅ Automatically detects if user exists
// ✅ Chooses INSERT or UPDATE accordingly
```

## 🎯 **Core Methods**

| Method | Purpose | Example |
|--------|---------|---------|
| `addTable(tableName)` | Discover table schema | `await accessor.addTable('users')` |
| `upsert(table, data, conditions)` | Smart insert/update | `await accessor.upsert('users', userData, {email})` |
| `create(table, data)` | Create new records | `await accessor.create('users', userData)` |
| `read(table, conditions)` | Query records | `await accessor.read('users', {isActive: true})` |
| `update(table, data, conditions)` | Update records | `await accessor.update('users', {isActive: false}, {email})` |
| `delete(table, conditions)` | Delete records | `await accessor.delete('users', {email})` |

## 🔍 **How It Works**

### **1. Schema Discovery**
```javascript
await accessor.addTable('users');
// ✅ Discovers all columns and types
// ✅ Finds primary keys and unique constraints  
// ✅ Maps foreign key relationships
// ✅ Respects default values and constraints
```

### **2. Smart Operations**
```javascript
// The accessor KNOWS your schema, so it:
// - Only allows valid column names
// - Respects unique constraints for upserts
// - Uses primary keys for efficient lookups
// - Prevents SQL injection automatically
```

### **3. Zero Manual Work**
- ❌ No SQL writing required
- ❌ No schema definitions needed
- ❌ No manual column mapping
- ✅ Just use your table names

## 📋 **Complete Example**

```javascript
const PostgreSQLAccessor = require('easy-postgresql-accessor');

async function example() {
  const accessor = new PostgreSQLAccessor();
  
  // Discover tables
  await accessor.addTable('users');
  await accessor.addTable('orders');
  
  // Create user
  const user = await accessor.create('users', {
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith'
  });
  
  // Smart upsert
  const updatedUser = await accessor.upsert('users', {
    email: 'jane@example.com',
    lastLoginAt: new Date()
  }, { email: 'jane@example.com' });
  
  // Query users
  const activeUsers = await accessor.read('users', { isActive: true });
}
```

## 🧪 **Testing**

```bash
npm test
```

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

**PostgreSQL data access that thinks for itself** 🧠✨
