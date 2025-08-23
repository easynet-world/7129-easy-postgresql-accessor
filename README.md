# PostgreSQL Data Accessor

[![npm version](https://badge.fury.io/js/postgresql-data-accessor.svg)](https://badge.fury.io/js/postgresql-data-accessor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

**PostgreSQL data access that automatically knows your table structure and performs smart operations.**

## 🚀 **Key Features**

- **🔍 Auto Table Discovery** - Automatically learns table columns, constraints, and relationships
- **🧠 Smart Operations** - Intelligent upsert, CRUD, and batch operations
- **🛡️ SQL Injection Protection** - Built-in parameterized queries
- **⚡ Zero Configuration** - Works out of the box with PostgreSQL

## 📦 **Installation**

```bash
# Install the package (includes dotenv for .env file support)
npm install postgresql-data-accessor
```

## 🚀 **Quick Start**

### 1. **Environment Configuration**

The PostgreSQL Data Accessor automatically loads environment variables from a `.env` file or system environment variables. Here's how to set it up:

#### **Option A: Using .env file (Recommended)**

1. **Copy the example environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit your `.env` file with your database credentials:**
   ```env
   # Database Connection
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_SCHEMA=public
   
   # Connection Pool Settings
   DB_MAX_CONNECTIONS=20
   DB_IDLE_TIMEOUT=30000
   DB_CONNECTION_TIMEOUT=2000
   
   # Test Database (Optional)
   TEST_DB_USER=testuser
   TEST_DB_PASSWORD=testpass
   TEST_DB_HOST=localhost
   TEST_DB_PORT=5432
   TEST_DB_NAME=testdb
   TEST_DB_SCHEMA=public
   ```

3. **The accessor automatically loads these variables** - no additional code needed!

#### **Option B: System Environment Variables**
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=your_database
export DB_USER=your_username
export DB_PASSWORD=your_password
export DB_SCHEMA=public
```

#### **Environment Validation**

You can check if your environment is properly configured:

```javascript
const PGClientFactory = require('postgresql-data-accessor').PGClientFactory;

// Check environment configuration
const config = PGClientFactory.checkEnvironmentConfig();
console.log('Environment valid:', config.isValid);
console.log('Missing variables:', config.missing);
```

### 2. **Basic Usage**

### 2. **Auto-Discover Table Structure**
```javascript
const PostgreSQLAccessor = require('postgresql-data-accessor');

const accessor = new PostgreSQLAccessor();

// 🔍 Automatically learns table definition
await accessor.addTable('users');
await accessor.addTable('orders');

// The accessor now KNOWS:
// - All column names and types
// - Primary keys and unique constraints
// - Foreign key relationships
// - Default values and constraints
```

### 3. **Smart Table Operations**
```javascript
// 🧠 Smart upsert - automatically handles insert/update
const user = await accessor.upsert('users', {
  email: 'john@example.com',        // Unique constraint
  firstName: 'John',
  lastName: 'Doe',
  lastLoginAt: new Date()
}, { email: 'john@example.com' });

// Automatically:
// ✅ INSERT if email doesn't exist
// ✅ UPDATE if email exists
// ✅ Detects unique constraints from schema
```

### 4. **Full CRUD with Schema Awareness**
```javascript
// Create - knows all valid columns
const newUser = await accessor.create('users', {
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith'
});

// Read - with smart filtering
const users = await accessor.read('users', { isActive: true });

// Update - only updates valid columns
await accessor.update('users', 
  { isActive: false }, 
  { email: 'john@example.com' }
);

// Delete - with conditions
await accessor.delete('users', { email: 'john@example.com' });
```

## 🔍 **How Auto Schema Discovery Works**

**The accessor automatically scans your PostgreSQL tables and discovers everything:**

- **Column names and types** - No manual mapping needed
- **Primary key constraints** - For efficient lookups
- **Unique constraints** - Powers smart upsert operations
- **Foreign key relationships** - Understands table connections
- **Default values and constraints** - Respects your schema

**Zero manual schema definition required!**

## 🧠 **Smart Table Operations**

1. **Learns your schema** automatically on first use
2. **Intelligently handles** INSERT vs UPDATE decisions
3. **Respects constraints** and validates data
4. **Optimizes queries** based on discovered indexes
5. **Prevents errors** by knowing valid columns

## 📚 **Core Methods**

- `addTable(tableName)` - **Auto-discover table schema**
- `upsert(table, data, conditions)` - **Smart insert/update**
- `create(table, data)` - **Schema-aware insert**
- `read(table, conditions)` - **Smart querying**
- `update(table, data, conditions)` - **Safe updates**
- `delete(table, conditions)` - **Conditional deletes**

## 🧪 **Testing**

```bash
npm test
```

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

**PostgreSQL data access that thinks for itself** 🧠✨
