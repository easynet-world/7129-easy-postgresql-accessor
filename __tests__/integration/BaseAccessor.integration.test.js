const BaseAccessor = require('../../src/data/BaseAccessor');

// These tests require a test database to be running
// They are marked as integration tests and can be run separately

describe('BaseAccessor Integration Tests', () => {
    let baseAccessor;

    beforeAll(async () => {
        // Set test environment variables
        process.env.DB_USER = process.env.TEST_DB_USER || 'testuser';
        process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'testpass';
        process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
        process.env.DB_PORT = process.env.TEST_DB_PORT || '5432';
        process.env.DB_NAME = process.env.TEST_DB_NAME || 'testdb';
        process.env.DB_SCHEMA = process.env.TEST_DB_SCHEMA || 'public';

        baseAccessor = new BaseAccessor();
        await baseAccessor.initialize();
    });

    afterAll(async () => {
        if (baseAccessor) {
            await baseAccessor.disconnect();
        }
    });

    beforeEach(async () => {
        // Clean up test data before each test
        try {
            await baseAccessor.query('DELETE FROM users WHERE email LIKE \'%test%\'');
        } catch (error) {
            // Table might not exist yet, which is fine
        }
    });

    describe('Table Schema Discovery', () => {
        test('should discover table columns', async () => {
            await baseAccessor.addTable('users');
            
            const columns = baseAccessor.columnsMap.get('users');
            expect(columns).toBeDefined();
            expect(columns).toContain('id');
            expect(columns).toContain('email');
            expect(columns).toContain('name');
        });

        test('should discover unique constraints', async () => {
            await baseAccessor.addTable('users');
            
            const uniqueColumns = baseAccessor.uniqueColumnsMap.get('users');
            expect(uniqueColumns).toBeDefined();
            expect(uniqueColumns).toContain('email');
        });

        test('should discover primary key constraints', async () => {
            await baseAccessor.addTable('users');
            
            const primaryKeyColumns = baseAccessor.primaryKeyColumnsMap.get('users');
            expect(primaryKeyColumns).toBeDefined();
            expect(primaryKeyColumns).toContain('id');
        });
    });

    describe('CRUD Operations', () => {
        beforeEach(async () => {
            await baseAccessor.addTable('users');
        });

        test('should create new user', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                googleId: 'test123'
            };

            const result = await baseAccessor.upsert('users', userData, { email: 'test@example.com' });
            
            expect(result).toHaveLength(1);
            expect(result[0].email).toBe('test@example.com');
            expect(result[0].name).toBe('Test User');
        });

        test('should update existing user', async () => {
            // First create a user
            const userData = {
                email: 'update@example.com',
                name: 'Original Name',
                googleId: 'update123'
            };

            await baseAccessor.upsert('users', userData, { email: 'update@example.com' });

            // Then update the user
            const updateData = {
                name: 'Updated Name'
            };

            const result = await baseAccessor.update('users', updateData, { email: 'update@example.com' });
            
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Updated Name');
        });

        test('should read user by conditions', async () => {
            // Create a user first
            const userData = {
                email: 'read@example.com',
                name: 'Read User',
                googleId: 'read123'
            };

            await baseAccessor.upsert('users', userData, { email: 'read@example.com' });

            // Read the user
            const result = await baseAccessor.read('users', { email: 'read@example.com' });
            
            expect(result).toHaveLength(1);
            expect(result[0].email).toBe('read@example.com');
            expect(result[0].name).toBe('Read User');
        });

        test('should delete user', async () => {
            // Create a user first
            const userData = {
                email: 'delete@example.com',
                name: 'Delete User',
                googleId: 'delete123'
            };

            await baseAccessor.upsert('users', userData, { email: 'delete@example.com' });

            // Delete the user
            const result = await baseAccessor.delete('users', { email: 'delete@example.com' });
            
            expect(result).toHaveLength(1);
            expect(result[0].email).toBe('delete@example.com');

            // Verify user is deleted
            const readResult = await baseAccessor.read('users', { email: 'delete@example.com' });
            expect(readResult).toHaveLength(0);
        });
    });

    describe('Data Filtering', () => {
        beforeEach(async () => {
            await baseAccessor.addTable('users');
        });

        test('should filter data based on table columns', () => {
            const inputData = {
                name: 'Filter Test',
                email: 'filter@example.com',
                invalidColumn: 'should be filtered out'
            };

            const filteredData = baseAccessor.filterWithTableColumnName(inputData, 'users');
            
            expect(filteredData.name).toBe('Filter Test');
            expect(filteredData.email).toBe('filter@example.com');
            expect(filteredData.invalidColumn).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        test('should handle non-existent table gracefully', async () => {
            await expect(baseAccessor.addTable('nonexistent_table')).rejects.toThrow();
        });

        test('should handle invalid table operations', async () => {
            await expect(baseAccessor.read('nonexistent_table', {})).rejects.toThrow();
        });
    });
});
