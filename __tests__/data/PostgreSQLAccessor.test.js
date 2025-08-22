const PostgreSQLAccessor = require('../../src/data/PostgreSQLAccessor');
const PGClientFactory = require('../../src/utils/PGClientFactory');
const ObjectUtility = require('../../src/utils/ObjectUtility');

// Mock dependencies
jest.mock('../../src/utils/PGClientFactory');
jest.mock('../../src/utils/ObjectUtility');

describe('PostgreSQLAccessor', () => {
    let baseAccessor;
    let mockClient;
    let mockObjectUtility;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Setup mock client
        mockClient = {
            query: jest.fn()
        };
        
        // Setup mock object utility
        mockObjectUtility = {
            convertObjectToFlat: jest.fn()
        };
        
        // Mock PGClientFactory
        PGClientFactory.getPGClient.mockResolvedValue(mockClient);
        
        // Mock ObjectUtility constructor
        ObjectUtility.mockImplementation(() => mockObjectUtility);
        
        // Create instance
        baseAccessor = new PostgreSQLAccessor();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        test('should initialize with empty maps and object utility', () => {
            expect(baseAccessor.columnsMap).toBeInstanceOf(Map);
            expect(baseAccessor.uniqueColumnsMap).toBeInstanceOf(Map);
            expect(baseAccessor.primaryKeyColumnsMap).toBeInstanceOf(Map);
            expect(baseAccessor.objectUtility).toBe(mockObjectUtility);
            expect(baseAccessor.client).toBeUndefined();
        });
    });

    describe('initialize', () => {
        test('should get client from PGClientFactory', async () => {
            await baseAccessor.initialize();
            
            expect(PGClientFactory.getPGClient).toHaveBeenCalled();
            expect(baseAccessor.client).toBe(mockClient);
        });
    });

    describe('addTable', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
        });

        test('should call all table schema methods', async () => {
            // Mock the individual methods
            jest.spyOn(baseAccessor, 'addTableColumns').mockResolvedValue();
            jest.spyOn(baseAccessor, 'addUniqueTableColumns').mockResolvedValue();
            jest.spyOn(baseAccessor, 'addPrimaryKeyColumns').mockResolvedValue();

            await baseAccessor.addTable('users');

            expect(baseAccessor.addTableColumns).toHaveBeenCalledWith('users');
            expect(baseAccessor.addUniqueTableColumns).toHaveBeenCalledWith('users');
            expect(baseAccessor.addPrimaryKeyColumns).toHaveBeenCalledWith('users');
        });

        test('should initialize client if not already initialized', async () => {
            baseAccessor.client = undefined;
            
            jest.spyOn(baseAccessor, 'initialize').mockResolvedValue();
            jest.spyOn(baseAccessor, 'addTableColumns').mockResolvedValue();
            jest.spyOn(baseAccessor, 'addUniqueTableColumns').mockResolvedValue();
            jest.spyOn(baseAccessor, 'addPrimaryKeyColumns').mockResolvedValue();

            await baseAccessor.addTable('users');

            expect(baseAccessor.initialize).toHaveBeenCalled();
        });
    });

    describe('addTableColumns', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
        });

        test('should query and store table columns', async () => {
            const mockRows = [
                { column_name: 'id' },
                { column_name: 'name' },
                { column_name: 'email' }
            ];
            
            mockClient.query.mockResolvedValue({ rows: mockRows });

            await baseAccessor.addTableColumns('users');

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT column_name'),
                ['users']
            );
            expect(baseAccessor.columnsMap.get('users')).toEqual(['id', 'name', 'email']);
        });

        test('should handle query errors', async () => {
            const error = new Error('Database error');
            mockClient.query.mockRejectedValue(error);

            await expect(baseAccessor.addTableColumns('users')).rejects.toThrow('Database error');
        });
    });

    describe('addUniqueTableColumns', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
        });

        test('should query and store unique columns', async () => {
            const mockRows = [
                { column_name: 'email' }
            ];
            
            mockClient.query.mockResolvedValue({ rows: mockRows });

            await baseAccessor.addUniqueTableColumns('users');

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('UNIQUE'),
                ['users']
            );
            expect(baseAccessor.uniqueColumnsMap.get('users')).toEqual(['email']);
        });

        test('should handle query errors', async () => {
            const error = new Error('Database error');
            mockClient.query.mockRejectedValue(error);

            await expect(baseAccessor.addUniqueTableColumns('users')).rejects.toThrow('Database error');
        });
    });

    describe('addPrimaryKeyColumns', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
        });

        test('should query and store primary key columns', async () => {
            const mockRows = [
                { column_name: 'id' }
            ];
            
            mockClient.query.mockResolvedValue({ rows: mockRows });

            await baseAccessor.addPrimaryKeyColumns('users');

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('PRIMARY KEY'),
                ['users']
            );
            expect(baseAccessor.primaryKeyColumnsMap.get('users')).toEqual(['id']);
        });

        test('should handle query errors', async () => {
            const error = new Error('Database error');
            mockClient.query.mockRejectedValue(error);

            await expect(baseAccessor.addPrimaryKeyColumns('users')).rejects.toThrow('Database error');
        });
    });

    describe('filterWithTableColumnName', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
            baseAccessor.columnsMap.set('users', ['id', 'name', 'email']);
        });

        test('should filter data based on table columns', () => {
            const inputData = { name: 'John', email: 'john@example.com', age: 30 };
            mockObjectUtility.convertObjectToFlat.mockReturnValue(inputData);

            const result = baseAccessor.filterWithTableColumnName(inputData, 'users');

            expect(result).toEqual({ name: 'John', email: 'john@example.com' });
            expect(result.age).toBeUndefined();
        });

        test('should handle undefined data', () => {
            const result = baseAccessor.filterWithTableColumnName(undefined, 'users');
            expect(result).toEqual({});
        });

        test('should throw error if table columns not found', () => {
            expect(() => {
                baseAccessor.filterWithTableColumnName({ name: 'John' }, 'nonexistent');
            }).toThrow('Table nonexistent columns not found. Call addTable() first.');
        });
    });

    describe('toConditionClause', () => {
        test('should build where clause with parameters', () => {
            const conditions = { name: 'John', email: 'john@example.com' };
            
            const result = baseAccessor.toConditionClause(conditions);
            
            expect(result.whereClause).toContain('name = $1');
            expect(result.whereClause).toContain('email = $2');
            expect(result.params).toEqual(['John', 'john@example.com']);
        });

        test('should handle operator objects', () => {
            const conditions = {
                age: { operator: '>', value: 18 },
                name: 'John'
            };
            
            const result = baseAccessor.toConditionClause(conditions);
            
            expect(result.whereClause).toContain('age > $1');
            expect(result.whereClause).toContain('name = $2');
            expect(result.params).toEqual([18, 'John']);
        });

        test('should handle empty conditions', () => {
            const result = baseAccessor.toConditionClause({});
            expect(result.whereClause).toBe('');
            expect(result.params).toEqual([]);
        });

        test('should skip null and undefined values', () => {
            const conditions = { name: 'John', age: null, email: undefined };
            
            const result = baseAccessor.toConditionClause(conditions);
            
            expect(result.whereClause).toContain('name = $1');
            expect(result.params).toEqual(['John']);
        });
    });

    describe('upsert', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
            baseAccessor.columnsMap.set('users', ['id', 'name', 'email']);
            baseAccessor.primaryKeyColumnsMap.set('users', ['id']);
            mockObjectUtility.convertObjectToFlat.mockReturnValue({ id: 1, name: 'John', email: 'john@example.com' });
        });

                test('should execute upsert query', async () => {
            const data = { id: 1, name: 'John', email: 'john@example.com' };
            const conditions = { id: 1 };
            const mockRows = [{ id: 1, name: 'John', email: 'john@example.com' }];

            mockClient.query.mockResolvedValue({ rows: mockRows });

            const result = await baseAccessor.upsert('users', data, conditions);

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                expect.arrayContaining([1, 'John', 'john@example.com'])
            );
            expect(result).toEqual(mockRows[0]); // Now returns single object
        });

        test('should throw error if no valid columns found', async () => {
            mockObjectUtility.convertObjectToFlat.mockReturnValue({});

            await expect(baseAccessor.upsert('users', {}, {})).rejects.toThrow('No valid columns found for upsert operation');
        });

        test('should throw error if no unique constraints found', async () => {
            baseAccessor.primaryKeyColumnsMap.set('users', []);
            baseAccessor.uniqueColumnsMap.set('users', []);

            await expect(baseAccessor.upsert('users', { name: 'John' }, {})).rejects.toThrow('No unique constraints found for table users');
        });
    });

    describe('read', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
        });

        test('should execute read query', async () => {
            const conditions = { name: 'John' };
            const mockRows = [{ id: 1, name: 'John' }];
            
            mockClient.query.mockResolvedValue({ rows: mockRows });

            const result = await baseAccessor.read('users', conditions);

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringMatching(/SELECT[\s\S]*FROM users/),
                ['John']
            );
            expect(result).toEqual(mockRows);
        });

        test('should handle empty conditions', async () => {
            const mockRows = [{ id: 1, name: 'John' }];
            mockClient.query.mockResolvedValue({ rows: mockRows });

            const result = await baseAccessor.read('users');

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringMatching(/SELECT[\s\S]*FROM users/),
                []
            );
            expect(result).toEqual(mockRows);
        });
    });

    describe('delete', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
        });

        test('should execute delete query', async () => {
            const conditions = { id: 1 };
            const mockRows = [{ id: 1, name: 'John' }];
            
            mockClient.query.mockResolvedValue({ rows: mockRows });

            const result = await baseAccessor.delete('users', conditions);

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringMatching(/DELETE[\s\S]*FROM users/),
                [1]
            );
            expect(result).toEqual(mockRows);
        });
    });

    describe('query', () => {
        beforeEach(async () => {
            await baseAccessor.initialize();
        });

        test('should execute custom query', async () => {
            const customQuery = 'SELECT COUNT(*) FROM users';
            const mockRows = [{ count: 5 }];
            
            mockClient.query.mockResolvedValue({ rows: mockRows });

            const result = await baseAccessor.query(customQuery);

            expect(mockClient.query).toHaveBeenCalledWith(customQuery, []);
            expect(result).toEqual(mockRows);
        });

        test('should execute query with parameters', async () => {
            const customQuery = 'SELECT * FROM users WHERE id = $1';
            const params = [1];
            const mockRows = [{ id: 1, name: 'John' }];
            
            mockClient.query.mockResolvedValue({ rows: mockRows });

            const result = await baseAccessor.query(customQuery, params);

            expect(mockClient.query).toHaveBeenCalledWith(customQuery, params);
            expect(result).toEqual(mockRows);
        });
    });

    describe('disconnect', () => {
        test('should close connection', async () => {
            await baseAccessor.disconnect();
            
            expect(PGClientFactory.closeConnection).toHaveBeenCalled();
        });
    });
});
