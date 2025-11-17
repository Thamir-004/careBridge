const dbManager = require('../config/db');
const logger = require('../utils/logger');

class DataSyncService {
  /**
   * Sync data between two hospitals (bidirectional)
   */
  async syncBetweenHospitals(hospitalA, hospitalB, collection) {
    try {
      const connA = dbManager.getConnection(hospitalA);
      const connB = dbManager.getConnection(hospitalB);

      // Get data from both hospitals
      const dataA = await connA.db.collection(collection).find({}).toArray();
      const dataB = await connB.db.collection(collection).find({}).toArray();

      let syncedToA = 0;
      let syncedToB = 0;

      // Sync B -> A (records in B but not in A)
      for (const doc of dataB) {
        const existsInA = dataA.some(d => d._id.equals(doc._id));
        if (!existsInA) {
          const { _id, ...docData } = doc;
          await connA.db.collection(collection).insertOne(docData);
          syncedToA++;
        }
      }

      // Sync A -> B (records in A but not in B)
      for (const doc of dataA) {
        const existsInB = dataB.some(d => d._id.equals(doc._id));
        if (!existsInB) {
          const { _id, ...docData } = doc;
          await connB.db.collection(collection).insertOne(docData);
          syncedToB++;
        }
      }

      logger.info(`Sync completed: ${syncedToA} to ${hospitalA}, ${syncedToB} to ${hospitalB}`);

      return {
        success: true,
        syncedToA,
        syncedToB,
        totalA: dataA.length + syncedToA,
        totalB: dataB.length + syncedToB,
      };
    } catch (error) {
      logger.error('Data sync failed:', error);
      throw error;
    }
  }

  /**
   * Check if data is in sync between hospitals
   */
  async checkSyncStatus(hospitalA, hospitalB, collection) {
    try {
      const connA = dbManager.getConnection(hospitalA);
      const connB = dbManager.getConnection(hospitalB);

      const countA = await connA.db.collection(collection).countDocuments();
      const countB = await connB.db.collection(collection).countDocuments();

      const inSync = countA === countB;

      return {
        inSync,
        hospitalA: { count: countA },
        hospitalB: { count: countB },
        difference: Math.abs(countA - countB),
      };
    } catch (error) {
      logger.error('Sync status check failed:', error);
      throw error;
    }
  }

  /**
   * Update existing records across hospitals
   */
  async syncUpdates(collection, query, updateData) {
    try {
      const hospitals = dbManager.getAllHospitals();
      const results = {};

      for (const hospital of hospitals) {
        const conn = dbManager.getConnection(hospital.id);
        const result = await conn.db.collection(collection).updateMany(query, { $set: updateData });
        
        results[hospital.id] = {
          matched: result.matchedCount,
          modified: result.modifiedCount,
        };
      }

      logger.info(`Sync updates completed across ${hospitals.length} hospitals`);

      return results;
    } catch (error) {
      logger.error('Sync updates failed:', error);
      throw error;
    }
  }
}

module.exports = new DataSyncService();