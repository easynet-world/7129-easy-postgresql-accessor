const ObjectUtility = require('../../src/utils/ObjectUtility');

describe('ObjectUtility', () => {
    let objectUtility;

    beforeEach(() => {
        objectUtility = new ObjectUtility();
    });

    describe('camelToSnakeCase', () => {
        test('should convert camelCase to snake_case', () => {
            expect(objectUtility.camelToSnakeCase('firstName')).toBe('first_name');
            expect(objectUtility.camelToSnakeCase('userName')).toBe('user_name');
            expect(objectUtility.camelToSnakeCase('emailAddress')).toBe('email_address');
        });

        test('should handle single word strings', () => {
            expect(objectUtility.camelToSnakeCase('name')).toBe('name');
            expect(objectUtility.camelToSnakeCase('Name')).toBe('_name');
        });

        test('should handle numbers in strings', () => {
            expect(objectUtility.camelToSnakeCase('user123Name')).toBe('user123_name');
            expect(objectUtility.camelToSnakeCase('123UserName')).toBe('123_user_name');
        });

        test('should handle empty string', () => {
            expect(objectUtility.camelToSnakeCase('')).toBe('');
        });

        test('should throw error for non-string input', () => {
            expect(() => objectUtility.camelToSnakeCase(null)).toThrow('Input must be a string');
            expect(() => objectUtility.camelToSnakeCase(undefined)).toThrow('Input must be a string');
            expect(() => objectUtility.camelToSnakeCase(123)).toThrow('Input must be a string');
            expect(() => objectUtility.camelToSnakeCase({})).toThrow('Input must be a string');
        });
    });

    describe('convertObjectToFlat', () => {
        test('should flatten simple object', () => {
            const input = { firstName: 'John', lastName: 'Doe' };
            const expected = { first_name: 'John', last_name: 'Doe' };
            expect(objectUtility.convertObjectToFlat(input)).toEqual(expected);
        });

        test('should flatten nested object', () => {
            const input = {
                user: {
                    firstName: 'John',
                    lastName: 'Doe'
                },
                email: 'john@example.com'
            };
            const expected = {
                user_first_name: 'John',
                user_last_name: 'Doe',
                email: 'john@example.com'
            };
            expect(objectUtility.convertObjectToFlat(input)).toEqual(expected);
        });

        test('should handle deeply nested objects', () => {
            const input = {
                user: {
                    profile: {
                        firstName: 'John',
                        lastName: 'Doe'
                    }
                }
            };
            const expected = {
                user_profile_first_name: 'John',
                user_profile_last_name: 'Doe'
            };
            expect(objectUtility.convertObjectToFlat(input)).toEqual(expected);
        });

        test('should handle arrays (keep as is)', () => {
            const input = {
                tags: ['javascript', 'nodejs'],
                name: 'test'
            };
            const expected = {
                tags: ['javascript', 'nodejs'],
                name: 'test'
            };
            expect(objectUtility.convertObjectToFlat(input)).toEqual(expected);
        });

        test('should handle null and undefined values', () => {
            const input = {
                name: 'John',
                age: null,
                email: undefined
            };
            const expected = {
                name: 'John',
                age: null,
                email: undefined
            };
            expect(objectUtility.convertObjectToFlat(input)).toEqual(expected);
        });

        test('should handle empty object', () => {
            expect(objectUtility.convertObjectToFlat({})).toEqual({});
        });

        test('should handle null and undefined gracefully', () => {
            expect(objectUtility.convertObjectToFlat(null)).toEqual({});
            expect(objectUtility.convertObjectToFlat(undefined)).toEqual({});
        });

        test('should throw error for non-object input', () => {
            expect(() => objectUtility.convertObjectToFlat('string')).toThrow('Input must be an object');
            expect(() => objectUtility.convertObjectToFlat(123)).toThrow('Input must be an object');
        });

        test('should handle object with parent key', () => {
            const input = { firstName: 'John' };
            const expected = { user_first_name: 'John' };
            expect(objectUtility.convertObjectToFlat(input, 'user')).toEqual(expected);
        });
    });
});
