// Load environment variables from .env file
try {
  require('dotenv').config();
  console.log('Environment variables loaded from .env file');
} catch (error) {
  console.warn('Warning: dotenv not available, environment variables may not be loaded:', error.message);
}

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
    // Validate required environment variables
    const requiredEnvVars = ['DB_USER', 'DB_NAME', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_SCHEMA'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
    }

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

  /**
   * Check if all required environment variables are set
   * @returns {Object} Object with validation results
   */
  static checkEnvironmentConfig() {
    const requiredEnvVars = ['DB_USER', 'DB_NAME', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_SCHEMA'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    const presentVars = requiredEnvVars.filter(varName => process.env[varName]);
    
    return {
      isValid: missingVars.length === 0,
      missing: missingVars,
      present: presentVars,
      total: requiredEnvVars.length
    };
  }

}

module.exports = PGClientFactory;