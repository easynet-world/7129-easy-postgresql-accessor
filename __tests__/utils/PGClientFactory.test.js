const PGClientFactory = require('../../src/utils/PGClientFactory');

// Mock pg module
jest.mock('pg', () => ({
    Client: jest.fn()
}));

// Mock dotenv
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

describe('PGClientFactory', () => {
    let mockClient;
    let mockQuery;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Setup mock client
        mockQuery = jest.fn();
        mockClient = {
            connect: jest.fn(),
            query: mockQuery,
            end: jest.fn(),
            _connected: false
        };
        
        // Mock Client constructor
        const { Client } = require('pg');
        Client.mockImplementation(() => mockClient);
        
        // Make Client available globally for tests
        global.Client = Client;
        
        // Mock environment variables
        process.env.DB_USER = 'testuser';
        process.env.DB_PASSWORD = 'testpass';
        process.env.DB_HOST = 'localhost';
        process.env.DB_PORT = '5432';
        process.env.DB_NAME = 'testdb';
        process.env.DB_SCHEMA = 'public';
        
        // Reset static client
        PGClientFactory.client = null;
    });

    afterEach(() => {
        // Clean up
        PGClientFactory.client = null;
    });

    describe('getPGClient', () => {
        test('should create new client on first call', async () => {
            mockClient.connect.mockResolvedValue();
            mockQuery.mockResolvedValue({ rows: [] });

            const client = await PGClientFactory.getPGClient();

            expect(Client).toHaveBeenCalledWith({
                user: 'testuser',
                database: 'testdb',
                password: 'testpass',
                host: 'localhost',
                port: '5432'
            });
            expect(client).toBe(mockClient);
        });

        test('should reuse existing client on subsequent calls', async () => {
            mockClient.connect.mockResolvedValue();
            mockQuery.mockResolvedValue({ rows: [] });

            const client1 = await PGClientFactory.getPGClient();
            const client2 = await PGClientFactory.getPGClient();

            expect(Client).toHaveBeenCalledTimes(1);
            expect(client1).toBe(client2);
        });

        test('should connect and set search path on first call', async () => {
            mockClient.connect.mockResolvedValue();
            mockQuery.mockResolvedValue({ rows: [] });

            await PGClientFactory.getPGClient();

            expect(mockClient.connect).toHaveBeenCalled();
            expect(mockQuery).toHaveBeenCalledWith('SET search_path TO public');
        });

        test('should not reconnect if already connected', async () => {
            mockClient._connected = true;
            mockQuery.mockResolvedValue({ rows: [] });

            await PGClientFactory.getPGClient();

            expect(mockClient.connect).not.toHaveBeenCalled();
        });

        test('should handle connection errors', async () => {
            const connectionError = new Error('Connection failed');
            mockClient.connect.mockRejectedValue(connectionError);

            await expect(PGClientFactory.getPGClient()).rejects.toThrow('Connection failed');
        });

        test('should handle search path setting errors', async () => {
            mockClient.connect.mockResolvedValue();
            mockQuery.mockRejectedValue(new Error('Search path failed'));

            await expect(PGClientFactory.getPGClient()).rejects.toThrow('Search path failed');
        });
    });

    describe('closeConnection', () => {
        test('should close and reset client connection', async () => {
            // Set up the client first
            mockClient._connected = true;
            mockClient.end.mockResolvedValue();
            PGClientFactory.client = mockClient;

            await PGClientFactory.closeConnection();

            expect(mockClient.end).toHaveBeenCalled();
            expect(PGClientFactory.client).toBeNull();
        });

        test('should handle case when no client exists', async () => {
            await PGClientFactory.closeConnection();
            // Should not throw any error
        });

        test('should handle case when client is not connected', async () => {
            mockClient._connected = false;

            await PGClientFactory.closeConnection();

            expect(mockClient.end).not.toHaveBeenCalled();
            expect(PGClientFactory.client).toBeNull();
        });
    });

    describe('environment variables', () => {
        test('should use correct environment variables', async () => {
            mockClient.connect.mockResolvedValue();
            mockQuery.mockResolvedValue({ rows: [] });

            await PGClientFactory.getPGClient();

            expect(Client).toHaveBeenCalledWith({
                user: 'testuser',
                database: 'testdb',
                password: 'testpass',
                host: 'localhost',
                port: '5432'
            });
        });
    });
});
