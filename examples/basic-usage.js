// For production use:
// const { BaseAccessor } = require('postgresql-data-accessor');

// For development/testing use:
const { BaseAccessor } = require('../src/index');

// Example usage of the Data Accessor
async function exampleUsage() {
    const accessor = new BaseAccessor();
    
    try {
        // Initialize the accessor (connects to database)
        await accessor.initialize();
        
        // Discover table schema
        console.log('Discovering table schema...');
        await accessor.addTable('users');
        
        // Create a new user
        console.log('Creating new user...');
        const newUser = {
            email: 'john.doe@example.com',
            name: 'John Doe',
            googleId: 'google123',
            acl: 'user'
        };
        
        const createdUser = await accessor.upsert('users', newUser, { email: newUser.email });
        console.log('Created user:', createdUser[0]);
        
        // Read user by email
        console.log('Reading user by email...');
        const foundUser = await accessor.read('users', { email: 'john.doe@example.com' });
        console.log('Found user:', foundUser[0]);
        
        // Update user
        console.log('Updating user...');
        const updateData = { name: 'John Smith' };
        const updatedUser = await accessor.update('users', updateData, { email: 'john.doe@example.com' });
        console.log('Updated user:', updatedUser[0]);
        
        // Read all users
        console.log('Reading all users...');
        const allUsers = await accessor.read('users');
        console.log('All users:', allUsers);
        
        // Custom query example
        console.log('Running custom query...');
        const userCount = await accessor.query('SELECT COUNT(*) as count FROM users');
        console.log('Total users:', userCount[0].count);
        
        // Delete user
        console.log('Deleting user...');
        const deletedUser = await accessor.delete('users', { email: 'john.doe@example.com' });
        console.log('Deleted user:', deletedUser[0]);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Always disconnect when done
        await accessor.disconnect();
        console.log('Disconnected from database');
    }
}

// Example with error handling and transactions
async function advancedExample() {
    const accessor = new BaseAccessor();
    
    try {
        await accessor.initialize();
        await accessor.addTable('users');
        
        // Example of handling complex data
        const complexUser = {
            profile: {
                firstName: 'Jane',
                lastName: 'Smith'
            },
            contact: {
                email: 'jane.smith@example.com',
                phone: '+1234567890'
            },
            preferences: {
                theme: 'dark',
                notifications: true
            }
        };
        
        // The ObjectUtility will automatically flatten this nested structure
        const createdUser = await accessor.upsert('users', complexUser, { 
            email: 'jane.smith@example.com' 
        });
        console.log('Created complex user:', createdUser[0]);
        
        // Example of using operators in conditions
        const recentUsers = await accessor.read('users', {
            createdAt: { operator: '>', value: '2024-01-01' }
        });
        console.log('Recent users:', recentUsers);
        
    } catch (error) {
        console.error('Advanced example error:', error.message);
    } finally {
        await accessor.disconnect();
    }
}

// Example of batch operations
async function batchExample() {
    const accessor = new BaseAccessor();
    
    try {
        await accessor.initialize();
        await accessor.addTable('users');
        
        const users = [
            { email: 'user1@example.com', name: 'User 1', acl: 'user' },
            { email: 'user2@example.com', name: 'User 2', acl: 'user' },
            { email: 'user3@example.com', name: 'User 3', acl: 'admin' }
        ];
        
        console.log('Creating multiple users...');
        for (const user of users) {
            await accessor.upsert('users', user, { email: user.email });
        }
        
        console.log('All users created successfully!');
        
        // Read all users
        const allUsers = await accessor.read('users');
        console.log('Total users in database:', allUsers.length);
        
        // Clean up
        for (const user of users) {
            await accessor.delete('users', { email: user.email });
        }
        console.log('All test users cleaned up');
        
    } catch (error) {
        console.error('Batch example error:', error.message);
    } finally {
        await accessor.disconnect();
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    console.log('=== Basic Usage Example ===');
    exampleUsage()
        .then(() => {
            console.log('\n=== Advanced Example ===');
            return advancedExample();
        })
        .then(() => {
            console.log('\n=== Batch Operations Example ===');
            return batchExample();
        })
        .then(() => {
            console.log('\nAll examples completed successfully!');
        })
        .catch(error => {
            console.error('Example execution failed:', error);
            process.exit(1);
        });
}

module.exports = {
    exampleUsage,
    advancedExample,
    batchExample
};
