require('dotenv').config();

const {Client} = require('pg');

class PGClientFactory {

    static get client() {
        if (!this._client) {
            this._client = null;
        }
        return this._client;
    }

    static set client(value) {
        this._client = value;
    }

    static async getPGClient() {
        if (!PGClientFactory.client) {
            PGClientFactory.client = new Client({
                user: process.env.DB_USER,
                database: process.env.DB_NAME,
                password: process.env.DB_PASSWORD,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
            });
            
            try {
                if (!PGClientFactory.client._connected) {
                    await PGClientFactory.client.connect();
                    await PGClientFactory.client.query(`SET search_path TO ${process.env.DB_SCHEMA}`);
                }
            } catch (error) {
                console.error('Failed to connect to database:', error);
                throw error;
            }
        }
        return PGClientFactory.client;
    }

    static async closeConnection() {
        if (PGClientFactory.client && PGClientFactory.client._connected) {
            await PGClientFactory.client.end();
            PGClientFactory.client = null;
        }
    }

}

module.exports = PGClientFactory;