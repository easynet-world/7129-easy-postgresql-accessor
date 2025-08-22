const {Client} = require('pg'); // eslint-disable-line no-unused-vars
const ObjectUtility = require('../utils/ObjectUtility.js');
const PGClientFactory = require('../utils/PGClientFactory.js');

class PostgreSQLAccessor {

    constructor() {
        this.objectUtility = new ObjectUtility();
        this.columnsMap = new Map();
        this.uniqueColumnsMap = new Map();
        this.primaryKeyColumnsMap = new Map();
    }

    async initialize() {
        this.client = await PGClientFactory.getPGClient();
    }

    async addTable(tableName) {
        if (!this.client) {
            await this.initialize();
        }
        
        await this.addTableColumns(tableName);
        await this.addUniqueTableColumns(tableName);
        await this.addPrimaryKeyColumns(tableName);
    }

    async addTableColumns(tableName) {
        try {
            const res = await this.client.query(`
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = $1`, [tableName]);
            
            const tableColumns = res.rows.map(row => row.column_name);
            this.columnsMap.set(tableName, tableColumns);
        } catch (e) {
            console.log('Error retrieving column names:', e);
            throw e;
        }
    }

    async addUniqueTableColumns(tableName) {
        try {
            const res = await this.client.query(`
                SELECT c.column_name
                FROM information_schema.columns c
                         JOIN information_schema.key_column_usage kcu
                              ON c.table_schema = kcu.table_schema
                                  AND c.table_name = kcu.table_name
                                  AND c.column_name = kcu.column_name
                         JOIN information_schema.table_constraints tc
                              ON kcu.table_schema = tc.table_schema
                                  AND kcu.table_name = tc.table_name
                                  AND kcu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'UNIQUE'
                  AND c.table_name = $1`, [tableName]);

            const uniqueTableColumns = res.rows.map(row => row.column_name);
            this.uniqueColumnsMap.set(tableName, uniqueTableColumns);
        } catch (e) {
            console.log('Error retrieving unique column names:', e);
            throw e;
        }
    }

    async addPrimaryKeyColumns(tableName) {
        try {
            const res = await this.client.query(`
                SELECT c.column_name
                FROM information_schema.columns c
                         JOIN information_schema.key_column_usage kcu
                              ON c.table_schema = kcu.table_schema
                                  AND c.table_name = kcu.table_name
                                  AND c.column_name = kcu.column_name
                         JOIN information_schema.table_constraints tc
                              ON kcu.table_schema = tc.table_schema
                                  AND kcu.table_name = tc.table_name
                                  AND kcu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND c.table_name = $1`, [tableName]);
            
            const primaryKeyColumns = res.rows.map(row => row.column_name);
            this.primaryKeyColumnsMap.set(tableName, primaryKeyColumns);
        } catch (e) {
            console.log('Error retrieving primary key column names:', e);
            throw e;
        }
    }

    filterWithTableColumnName(data, tableName) {
        const filteredData = {};

        if (data) {
            const dataMap = this.objectUtility.convertObjectToFlat(data);
            const tableColumns = this.columnsMap.get(tableName);

            if (!tableColumns) {
                throw new Error(`Table ${tableName} columns not found. Call addTable() first.`);
            }

            for (const key in dataMap) {
                if (tableColumns.includes(key) && dataMap[key] !== undefined) {
                    filteredData[key] = dataMap[key];
                }
            }
        }

        return filteredData;
    }

    toConditionClause(conditions) {
        let whereClause = '';
        const params = [];
        let paramIndex = 1;

        if (conditions) {
            for (const [key, value] of Object.entries(conditions)) {
                if (value !== undefined && value !== null) {
                    let operator = '=';
                    let v = value;
                    
                    if (value && typeof value === 'object' && value.operator) {
                        operator = value.operator;
                        v = value.value;
                    }
                    
                    whereClause += ` AND ${key} ${operator} $${paramIndex}`;
                    params.push(v);
                    paramIndex++;
                }
            }
        }
        
        return { whereClause, params };
    }

    async upsert(tableName, data, conditions) {
        if (!this.client) {
            await this.initialize();
        }

        const filteredData = this.filterWithTableColumnName(data, tableName);
        const keys = Object.keys(filteredData);
        const values = Object.values(filteredData);

        if (keys.length === 0) {
            throw new Error('No valid columns found for upsert operation');
        }

        const { params: conditionParams } = this.toConditionClause(conditions);
        const allParams = [...values, ...conditionParams];

        let uniqueColumns = this.primaryKeyColumnsMap.get(tableName);
        if (!uniqueColumns || uniqueColumns.length === 0) {
            uniqueColumns = this.uniqueColumnsMap.get(tableName);
        }

        if (!uniqueColumns || uniqueColumns.length === 0) {
            throw new Error(`No unique constraints found for table ${tableName}`);
        }

        const query = `
            INSERT INTO ${tableName} (${keys.join(', ')})
            VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')})
            ON CONFLICT (${uniqueColumns.join(', ')})
            DO UPDATE SET ${keys.map((key, i) => `${key} = $${i + 1}`).join(', ')}
            RETURNING *`;

        console.debug(query);
        console.debug(allParams);

        const result = await this.client.query(query, allParams);
        return result.rows;
    }

    async update(tableName, data, conditions) {
        if (!this.client) {
            await this.initialize();
        }

        const filteredData = this.filterWithTableColumnName(data, tableName);
        
        if (Object.keys(filteredData).length === 0) {
            throw new Error('No valid columns found for update operation');
        }

        const { whereClause, params: conditionParams } = this.toConditionClause(conditions);
        const updateParams = Object.values(filteredData);
        const allParams = [...updateParams, ...conditionParams];

        const query = `
            UPDATE ${tableName}
            SET ${Object.keys(filteredData).map((key, i) => `${key} = $${i + 1}`).join(', ')}
            WHERE 1 = 1 ${whereClause}
            RETURNING *`;

        const result = await this.client.query(query, allParams);
        return result.rows;
    }

    async read(tableName, conditions = {}) {
        if (!this.client) {
            await this.initialize();
        }

        const { whereClause, params } = this.toConditionClause(conditions);

        const query = `
            SELECT *
            FROM ${tableName}
            WHERE 1 = 1 ${whereClause}`;

        const result = await this.client.query(query, params);
        return result.rows;
    }

    async delete(tableName, conditions) {
        if (!this.client) {
            await this.initialize();
        }

        const { whereClause, params } = this.toConditionClause(conditions);

        const query = `
            DELETE
            FROM ${tableName}
            WHERE 1 = 1 ${whereClause}
            RETURNING *`;
            
        const result = await this.client.query(query, params);
        return result.rows;
    }

    async query(query, params = []) {
        if (!this.client) {
            await this.initialize();
        }

        console.debug(query);
        console.debug(params);
        
        const result = await this.client.query(query, params);
        console.debug(result.rows);
        return result.rows;
    }

    async disconnect() {
        await PGClientFactory.closeConnection();
    }

}

module.exports = PostgreSQLAccessor;
