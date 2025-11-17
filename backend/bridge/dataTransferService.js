const dbManager = require('../config/db');
const logger = require('../utils/logger');

class DataTransferService {
  /**
   * Copy data from one hospital to another
   */
  async transferData(sourceHospital, destHospital, collection, query = {}) {
    try {
      const sourceConn = dbManager.getConnection(sourceHospital);
      const destConn = dbManager.getConnection(destHospital);

      // Get data from source
      const data = await sourceConn.db.collection(collection).find(query).toArray();

      if (data.length === 0) {
        return { transferred: 0, message: 'No data found to transfer' };
      }

      // Remove _id to avoid duplicates
      const cleanData = data.map(doc => {
        const { _id, ...rest } = doc;
        return { ...rest, hospital_id: destHospital };
      });

      // Insert into destination
      const result = await destConn.db.collection(collection).insertMany(cleanData);

      logger.info(`Transferred ${result.insertedCount} records from ${sourceHospital} to ${destHospital}`);

      return {
        transferred: result.insertedCount,
        collection,
        sourceHospital,
        destHospital,
      };
    } catch (error) {
      logger.error('Data transfer failed:', error);
      throw error;
    }
  }

  /**
   * Copy single document
   */
  async transferDocument(sourceHospital, destHospital, collection, documentId) {
    try {
      const sourceConn = dbManager.getConnection(sourceHospital);
      const destConn = dbManager.getConnection(destHospital);

      // Find document in source
      const doc = await sourceConn.db.collection(collection).findOne({ _id: documentId });

      if (!doc) {
        throw new Error(`Document ${documentId} not found in source hospital`);
      }

      // Remove _id and insert into destination
      const { _id, ...docData } = doc;
      docData.hospital_id = destHospital;

      const result = await destConn.db.collection(collection).insertOne(docData);

      logger.info(`Document transferred: ${documentId}`);

      return {
        success: true,
        documentId: result.insertedId,
      };
    } catch (error) {
      logger.error('Document transfer failed:', error);
      throw error;
    }
  }

  /**
   * Move data (transfer + delete from source)
   */
  async moveData(sourceHospital, destHospital, collection, query = {}) {
    try {
      // Transfer data
      const transferResult = await this.transferData(sourceHospital, destHospital, collection, query);

      // Delete from source
      const sourceConn = dbManager.getConnection(sourceHospital);
      const deleteResult = await sourceConn.db.collection(collection).deleteMany(query);

      logger.info(`Moved ${deleteResult.deletedCount} records from ${sourceHospital} to ${destHospital}`);

      return {
        ...transferResult,
        deleted: deleteResult.deletedCount,
      };
    } catch (error) {
      logger.error('Data move failed:', error);
      throw error;
    }
  }
}

module.exports = new DataTransferService();