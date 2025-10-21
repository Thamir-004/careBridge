const mongoose = require('mongoose');
const logger = require('../utils/logger');

class DatabaseManager {
  constructor() {
    this.connections = new Map();
    this.hospitals = [];
  }

  /**
   * Initialize all hospital database connections from environment variables
   */
  async initializeConnections() {
    try {
      // Dynamically detect all hospital configurations from env
      const hospitalConfigs = this.extractHospitalConfigs();
      
      logger.info(`Found ${hospitalConfigs.length} hospital configurations`);

      // Connect to each hospital database
      for (const config of hospitalConfigs) {
        await this.createConnection(config);
      }

      // Connect to audit database if enabled
      if (process.env.ENABLE_AUDIT_LOG === 'true') {
        await this.createAuditConnection();
      }

      logger.info('All database connections established successfully');
      return true;
    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Extract hospital configurations from environment variables
   */
  extractHospitalConfigs() {
    const configs = [];
    const envKeys = Object.keys(process.env);
    
    // Find all HOSPITAL_X_MONGO_URI patterns
    const hospitalPrefixes = new Set();
    envKeys.forEach(key => {
      const match = key.match(/^HOSPITAL_([A-Z])_MONGO_URI$/);
      if (match) {
        hospitalPrefixes.add(match[1]);
      }
    });

    // Build config objects for each hospital
    hospitalPrefixes.forEach(prefix => {
      const config = {
        id: process.env[`HOSPITAL_${prefix}_ID`],
        name: process.env[`HOSPITAL_${prefix}_NAME`],
        uri: process.env[`HOSPITAL_${prefix}_MONGO_URI`],
        prefix: prefix.toLowerCase()
      };

      if (config.id && config.name && config.uri) {
        configs.push(config);
        this.hospitals.push({
          id: config.id,
          name: config.name,
          prefix: config.prefix
        });
      } else {
        logger.warn(`Incomplete configuration for HOSPITAL_${prefix}`);
      }
    });

    return configs;
  }

  /**
   * Create a connection for a specific hospital
   */
  async createConnection(config) {
    try {
      const connection = await mongoose.createConnection(config.uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
      });

      // Connection event handlers
      connection.on('connected', () => {
        logger.info(`✓ Connected to ${config.name} database`);
      });

      connection.on('error', (err) => {
        logger.error(`Database error for ${config.name}:`, err);
      });

      connection.on('disconnected', () => {
        logger.warn(`Disconnected from ${config.name} database`);
      });

      // Store connection with hospital ID as key
      this.connections.set(config.id, {
        connection,
        name: config.name,
        prefix: config.prefix,
        id: config.id
      });

      return connection;
    } catch (error) {
      logger.error(`Failed to connect to ${config.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Create connection for audit logging database
   */
  async createAuditConnection() {
    const uri = process.env.AUDIT_DB_URI;
    if (!uri) {
      logger.warn('Audit database URI not provided');
      return null;
    }

    try {
      const connection = await mongoose.createConnection(uri, {
        maxPoolSize: 5,
        minPoolSize: 1,
      });

      connection.on('connected', () => {
        logger.info('✓ Connected to Audit database');
      });

      this.connections.set('AUDIT', { connection, name: 'Audit Database' });
      return connection;
    } catch (error) {
      logger.error('Failed to connect to audit database:', error.message);
      throw error;
    }
  }

  /**
   * Get connection for a specific hospital by ID
   */
  getConnection(hospitalId) {
    const conn = this.connections.get(hospitalId);
    if (!conn) {
      throw new Error(`No database connection found for hospital: ${hospitalId}`);
    }
    return conn.connection;
  }

  /**
   * Get all hospital information (without exposing connections)
   */
  getAllHospitals() {
    return this.hospitals.map(h => ({ ...h }));
  }

  /**
   * Check if a hospital exists in the system
   */
  hospitalExists(hospitalId) {
    return this.connections.has(hospitalId);
  }

  /**
   * Get audit database connection
   */
  getAuditConnection() {
    const audit = this.connections.get('AUDIT');
    return audit ? audit.connection : null;
  }

  /**
   * Close all database connections gracefully
   */
  async closeAllConnections() {
    logger.info('Closing all database connections...');
    
    const closePromises = Array.from(this.connections.values()).map(
      ({ connection, name }) =>
        connection.close().then(() => {
          logger.info(`Closed connection to ${name}`);
        })
    );

    await Promise.all(closePromises);
    this.connections.clear();
    this.hospitals = [];
    logger.info('All database connections closed');
  }

  /**
   * Health check for all connections
   */
  async healthCheck() {
    const status = {};

    for (const [id, { connection, name }] of this.connections) {
      status[id] = {
        name,
        connected: connection.readyState === 1,
        state: this.getConnectionState(connection.readyState)
      };
    }

    return status;
  }

  /**
   * Get readable connection state
   */
  getConnectionState(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[state] || 'unknown';
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;