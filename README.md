# PostgreSQL Data Accessor

[![npm version](https://badge.fury.io/js/postgresql-data-accessor.svg)](https://badge.fury.io/js/postgresql-data-accessor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

A powerful, production-ready PostgreSQL data access layer for Node.js applications. This package provides automatic schema discovery, intelligent CRUD operations, SQL injection protection, and seamless object-relational mapping with zero configuration required.

## ✨ Key Features

- **🔍 Automatic Schema Discovery**: Automatically maps table columns, unique constraints, primary keys, and foreign keys
- **🛡️ SQL Injection Protection**: Built-in parameterized queries and input sanitization
- **⚡ High Performance**: Efficient connection pooling and query optimization
- **🔄 Smart CRUD Operations**: Intelligent upsert, batch operations, and transaction support
- **🎯 Object-Relational Mapping**: Automatic camelCase ↔ snake_case conversion
- **🔧 Zero Configuration**: Works out of the box with standard PostgreSQL setups
- **🧪 Comprehensive Testing**: 100% test coverage with integration test support
- **📚 TypeScript Ready**: Full TypeScript support with type definitions

## 🚀 Installation

```bash
npm install postgresql-data-accessor dotenv
```

**Note**: The `dotenv` package is required for environment variable support. If you prefer not to use it, you can manually pass configuration options to the BaseAccessor constructor.

## 📖 Quick Start

### 1. Environment Setup

Create a `.env` file in your project root:

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
```

### 2. Basic Setup

```javascript
require('dotenv').config();
const BaseAccessor = require('postgresql-data-accessor');

// Initialize with environment variables
const accessor = new BaseAccessor();
```

### 3. Auto Schema Discovery

```javascript
// 🔍 Automatically discover table structure, constraints, and relationships
await accessor.addTable('users');
await accessor.addTable('orders');

// The accessor now knows:
// - All column names and types
// - Primary keys and unique constraints
// - Foreign key relationships
// - Default values and constraints
```

### 4. Complete CRUD Operations

#### Create (Insert)
```javascript
// Create a new user
const newUser = {
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  isActive: true
};

const result = await accessor.create('users', newUser);
console.log('Created user with ID:', result.id);
```

#### Read (Select)
```javascript
// Read all users
const allUsers = await accessor.read('users');

// Read with conditions
const activeUsers = await accessor.read('users', { isActive: true });

// Read with pagination
const paginatedUsers = await accessor.read('users', {}, {
  limit: 10,
  offset: 0,
  orderBy: { createdAt: 'DESC' }
});
```

#### Update
```javascript
// Update user by ID
const affectedRows = await accessor.update('users', 
  { isActive: false, lastLoginAt: new Date() }, 
  { id: 1 }
);

// Update by email
const affectedRows = await accessor.update('users',
  { lastLoginAt: new Date() },
  { email: 'john.doe@example.com' }
);
```

#### Delete
```javascript
// Delete by ID
const deletedRows = await accessor.delete('users', { id: 1 });

// Delete by condition
const deletedRows = await accessor.delete('users', { isActive: false });
```

### 5. 🚀 Smart Upsert Operations

```javascript
// 🔄 Upsert automatically handles insert or update based on unique constraints
const user = await accessor.upsert('users', {
  email: 'john.doe@example.com',        // Unique constraint
  firstName: 'John',
  lastName: 'Doe',
  lastLoginAt: new Date(),
  loginCount: 1
}, { email: 'john.doe@example.com' });

// This will:
// ✅ INSERT if email doesn't exist
// ✅ UPDATE if email exists (incrementing loginCount, updating lastLoginAt)
// ✅ Automatically detect unique constraints from schema
// ✅ Handle conflicts gracefully
```

### 6. Advanced Operations

```javascript
// Batch operations
const operations = [
  { type: 'create', table: 'users', data: { email: 'user1@example.com', name: 'User 1' } },
  { type: 'create', table: 'users', data: { email: 'user2@example.com', name: 'User 2' } },
  { type: 'upsert', table: 'users', data: { email: 'user3@example.com', name: 'User 3' }, conditions: { email: 'user3@example.com' } }
];

const results = await accessor.batch(operations);

// Transactions
const result = await accessor.transaction(async (tx) => {
  const user = await tx.create('users', { email: 'john@example.com', name: 'John' });
  const order = await tx.create('orders', { userId: user.id, total: 99.99 });
  return { user, order };
});
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

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

# SSL Configuration (for production)
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### Advanced Configuration

```javascript
const accessor = new BaseAccessor({
  // Connection settings
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  schema: process.env.DB_SCHEMA || 'public',
  
  // Connection pool settings
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  
  // SSL settings (for production)
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false,
  
  // Logging
  log: console.log,
  logLevel: 'info'
});
```

## 📚 API Reference

### BaseAccessor Class

#### Constructor
```javascript
new BaseAccessor(config?: DatabaseConfig)
```

#### Core Methods

##### `addTable(tableName: string): Promise<void>`
Discovers and caches table schema information including:
- Column names and types
- Primary key constraints
- Unique constraints
- Foreign key relationships
- Default values
- Not null constraints

```javascript
// Discover table schema
await accessor.addTable('users');
await accessor.addTable('orders');
await accessor.addTable('products');

// Access cached schema information
console.log(accessor.getTableSchema('users'));
```

##### `create(tableName: string, data: object): Promise<object>`
Creates a new record and returns the created object with generated IDs.

```javascript
const user = await accessor.create('users', {
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith'
});

console.log('Created user:', user);
// Output: { id: 1, email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', createdAt: '2024-01-15T10:30:00Z' }
```

##### `read(tableName: string, conditions?: object, options?: ReadOptions): Promise<object[]>`
Reads records with optional filtering and pagination.

```javascript
// Read all users
const allUsers = await accessor.read('users');

// Read with conditions
const activeUsers = await accessor.read('users', { isActive: true });

// Read with complex conditions
const recentUsers = await accessor.read('users', {
  createdAt: { $gte: new Date('2024-01-01') },
  isActive: true
});

// Read with pagination and sorting
const paginatedUsers = await accessor.read('users', {}, {
  limit: 10,
  offset: 20,
  orderBy: { createdAt: 'DESC' }
});
```

##### `update(tableName: string, data: object, conditions: object): Promise<number>`
Updates records and returns the number of affected rows.

```javascript
// Update by ID
const affectedRows = await accessor.update('users', 
  { isActive: false }, 
  { id: 1 }
);

// Update by email
const affectedRows = await accessor.update('users',
  { lastLoginAt: new Date() },
  { email: 'john@example.com' }
);

// Update multiple records
const affectedRows = await accessor.update('users',
  { isActive: false },
  { role: 'inactive' }
);
```

##### `upsert(tableName: string, data: object, conditions: object): Promise<object>`
Inserts or updates based on unique constraints.

```javascript
// Upsert user by email
const user = await accessor.upsert('users', {
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  lastLoginAt: new Date()
}, { email: 'john@example.com' });

// This will:
// - Insert if email doesn't exist
// - Update if email exists
```

##### `delete(tableName: string, conditions: object): Promise<number>`
Deletes records and returns the number of affected rows.

```javascript
// Delete by ID
const deletedRows = await accessor.delete('users', { id: 1 });

// Delete by condition
const deletedRows = await accessor.delete('users', { isActive: false });

// Delete multiple records
const deletedRows = await accessor.delete('users', { 
  createdAt: { $lt: new Date('2024-01-01') } 
});
```

##### `query(sql: string, params?: any[]): Promise<any>`
Executes custom SQL queries with parameter binding.

```javascript
// Simple query
const result = await accessor.query('SELECT COUNT(*) FROM users WHERE is_active = $1', [true]);

// Complex query with joins
const usersWithOrders = await accessor.query(`
  SELECT u.*, COUNT(o.id) as order_count
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.is_active = $1
  GROUP BY u.id
  HAVING COUNT(o.id) > $2
`, [true, 0]);
```

#### Advanced Methods

##### `transaction(callback: Function): Promise<any>`
Executes operations within a database transaction.

```javascript
const result = await accessor.transaction(async (tx) => {
  // Create user
  const user = await tx.create('users', {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe'
  });
  
  // Create order for the user
  const order = await tx.create('orders', {
    userId: user.id,
    total: 99.99,
    status: 'pending'
  });
  
  return { user, order };
});
```

##### `batch(operations: Operation[]): Promise<any[]>`
Executes multiple operations in a single batch.

```javascript
const operations = [
  { type: 'create', table: 'users', data: { email: 'user1@example.com', name: 'User 1' } },
  { type: 'create', table: 'users', data: { email: 'user2@example.com', name: 'User 2' } },
  { type: 'update', table: 'users', data: { isActive: true }, conditions: { email: 'user1@example.com' } }
];

const results = await accessor.batch(operations);
```

## 🎯 Advanced Usage Patterns

### Complex Queries with Conditions

```javascript
// Range queries
const usersInRange = await accessor.read('users', {
  age: { $gte: 18, $lte: 65 },
  createdAt: { $gte: new Date('2024-01-01') }
});

// Array operations
const usersWithRoles = await accessor.read('users', {
  role: { $in: ['admin', 'moderator'] }
});

// Text search
const searchResults = await accessor.read('users', {
  $or: [
    { firstName: { $ilike: '%john%' } },
    { lastName: { $ilike: '%doe%' } },
    { email: { $ilike: '%john%' } }
  ]
});
```

### Relationship Handling

```javascript
// Get user with orders
const userWithOrders = await accessor.query(`
  SELECT 
    u.*,
    json_agg(
      json_build_object(
        'id', o.id,
        'total', o.total,
        'status', o.status
      )
    ) as orders
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.id = $1
  GROUP BY u.id
`, [userId]);
```

### Data Validation and Transformation

```javascript
// Custom validation before insert
const validateUser = (userData) => {
  if (!userData.email || !userData.email.includes('@')) {
    throw new Error('Invalid email address');
  }
  if (userData.age && (userData.age < 0 || userData.age > 150)) {
    throw new Error('Invalid age');
  }
  return userData;
};

// Use validation
const userData = validateUser({
  email: 'john@example.com',
  firstName: 'John',
  age: 30
});

const user = await accessor.create('users', userData);
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Test Database Setup

The package includes Docker Compose configuration for easy test database setup:

```bash
# Start test database
npm run docker:up

# Setup test database
npm run setup-test-db

# Run tests
npm test

# Cleanup test database
npm run cleanup-test-db

# Stop test database
npm run docker:down
```

### Writing Tests

```javascript
const BaseAccessor = require('../src/data/BaseAccessor');

describe('BaseAccessor', () => {
  let accessor;
  
  beforeEach(async () => {
    accessor = new BaseAccessor({
      // Test database configuration
      host: 'localhost',
      port: 5433, // Test port
      database: 'test_db',
      user: 'test_user',
      password: 'test_password'
    });
    
    // Setup test tables
    await accessor.query(`
      CREATE TABLE IF NOT EXISTS test_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255)
      )
    `);
  });
  
  afterEach(async () => {
    await accessor.query('DROP TABLE IF EXISTS test_users');
    await accessor.close();
  });
  
  test('should create a user', async () => {
    const user = await accessor.create('test_users', {
      email: 'test@example.com',
      name: 'Test User'
    });
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

## 🚀 Building and Development

### Development Mode

```bash
# Start development server with auto-reload
npm run dev

# Watch for file changes and rebuild
npm run build -- --watch
```

### Production Build

```bash
# Build for production
npm run build

# The build process:
# 1. Transpiles ES6+ code to ES5
# 2. Optimizes for Node.js environments
# 3. Generates distribution files in /dist
```

### Publishing

```bash
# Build, test, and publish to npm
npm run publish

# This will:
# 1. Run all tests
# 2. Run linting
# 3. Build the package
# 4. Publish to npm registry
```

## 🔍 Troubleshooting

### Common Issues

#### Connection Errors
```javascript
// Check your database connection
const accessor = new BaseAccessor();
try {
  await accessor.query('SELECT 1');
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection failed:', error.message);
}
```

#### Schema Discovery Issues
```javascript
// Manually check table schema
const schema = await accessor.query(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = $1
`, ['users']);

console.log('Table schema:', schema);
```

#### Performance Issues
```javascript
// Enable query logging
const accessor = new BaseAccessor({
  log: console.log,
  logLevel: 'debug'
});

// Use connection pooling
const accessor = new BaseAccessor({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

### Debug Mode

```javascript
// Enable debug logging
const accessor = new BaseAccessor({
  log: console.log,
  logLevel: 'debug'
});

// This will log:
// - SQL queries being executed
// - Parameter values
// - Execution time
// - Connection pool status
```

## 📊 Performance Considerations

### Connection Pooling
- Default pool size: 20 connections
- Adjust based on your application load
- Monitor connection usage in production

### Query Optimization
- Use indexes on frequently queried columns
- Avoid SELECT * in production
- Use LIMIT for large result sets
- Consider pagination for large datasets

### Batch Operations
- Use `batch()` for multiple operations
- Use transactions for related operations
- Consider bulk insert for large datasets

## 🔒 Security Features

### SQL Injection Protection
- All queries use parameterized statements
- Input validation and sanitization
- No direct string concatenation in queries

### Connection Security
- SSL/TLS support for production
- Environment variable configuration
- No hardcoded credentials

### Data Validation
- Type checking for input data
- Constraint validation
- Error handling for invalid data

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/easynet-world/7129-postgresql-data-accessor.git
cd 7129-postgresql-data-accessor

# Install dependencies
npm install

# Setup test database
npm run setup-test-db

# Run tests
npm test

# Build the package
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [node-postgres](https://github.com/brianc/node-postgres)
- Inspired by modern ORM patterns
- Community-driven development

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/easynet-world/7129-postgresql-data-accessor/issues)
- **Documentation**: [GitHub Wiki](https://github.com/easynet-world/7129-postgresql-data-accessor/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/easynet-world/7129-postgresql-data-accessor/discussions)

---

**Made with ❤️ for the Node.js community**
