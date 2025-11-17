const dbManager = require('../config/database');
const logger = require('../utils/logger');

class QueryRouterService {
  /**
   * Route query to specific hospital
   */
  async queryHospital(hospitalId, collection, query = {}, options = {}) {
    try {
      const conn = dbManager.getConnection(hospitalId);
      const { limit = 100, skip = 0, sort = {} } = options;

      const results = await conn.db
        .collection(collection)
        .find(query)
        .limit(limit)
        .skip(skip)
        .sort(sort)
        .toArray();

      return {
        hospitalId,
        collection,
        count: results.length,
        data: results,
      };
    } catch (error) {
      logger.error(`Query failed for hospital ${hospitalId}:`, error);
      throw error;
    }
  }

  /**
   * Query across all hospitals
   */
  async queryAllHospitals(collection, query = {}, options = {}) {
    try {
      const hospitals = dbManager.getAllHospitals();
      const results = [];

      for (const hospital of hospitals) {
        const conn = dbManager.getConnection(hospital.id);
        const { limit = 100, skip = 0, sort = {} } = options;

        const data = await conn.db
          .collection(collection)
          .find(query)
          .limit(limit)
          .skip(skip)
          .sort(sort)
          .toArray();

        if (data.length > 0) {
          results.push({
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            count: data.length,
            data: data,
          });
        }
      }

      const totalRecords = results.reduce((sum, r) => sum + r.count, 0);

      logger.info(`Cross-hospital query: ${totalRecords} records from ${results.length} hospitals`);

      return {
        totalHospitals: results.length,
        totalRecords,
        results,
      };
    } catch (error) {
      logger.error('Cross-hospital query failed:', error);
      throw error;
    }
  }

  /**
   * Aggregate data across hospitals
   */
  async aggregateAcrossHospitals(collection, pipeline = []) {
    try {
      const hospitals = dbManager.getAllHospitals();
      const results = [];

      for (const hospital of hospitals) {
        const conn = dbManager.getConnection(hospital.id);
        const data = await conn.db.collection(collection).aggregate(pipeline).toArray();

        results.push({
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          data: data,
        });
      }

      return results;
    } catch (error) {
      logger.error('Aggregation failed:', error);
      throw error;
    }
  }

  /**
   * Find which hospital has specific data
   */
  async findDataLocation(collection, query) {
    try {
      const hospitals = dbManager.getAllHospitals();
      const locations = [];

      for (const hospital of hospitals) {
        const conn = dbManager.getConnection(hospital.id);
        const count = await conn.db.collection(collection).countDocuments(query);

        if (count > 0) {
          locations.push({
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            recordCount: count,
          });
        }
      }

      return {
        found: locations.length > 0,
        locations,
      };
    } catch (error) {
      logger.error('Data location search failed:', error);
      throw error;
    }
  }

  /**
   * Count records across all hospitals
   */
  async countAcrossHospitals(collection, query = {}) {
    try {
      const hospitals = dbManager.getAllHospitals();
      const counts = {};
      let total = 0;

      for (const hospital of hospitals) {
        const conn = dbManager.getConnection(hospital.id);
        const count = await conn.db.collection(collection).countDocuments(query);
        counts[hospital.id] = count;
        total += count;
      }

      return {
        total,
        byHospital: counts,
      };
    } catch (error) {
      logger.error('Count failed:', error);
      throw error;
    }
  }
}

module.exports = new QueryRouterService();