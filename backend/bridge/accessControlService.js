const dbManager = require('../config/db');
const logger = require('../utils/logger');

class AccessControlService {
  constructor() {
    // Simple in-memory access control rules
    this.accessRules = new Map();
  }

  /**
   * Grant hospital access to another hospital's data
   */
  grantAccess(requestingHospital, targetHospital, permissions = {}) {
    const key = `${requestingHospital}:${targetHospital}`;
    
    this.accessRules.set(key, {
      requestingHospital,
      targetHospital,
      permissions: {
        read: permissions.read || false,
        write: permissions.write || false,
        transfer: permissions.transfer || false,
      },
      grantedAt: new Date(),
      expiresAt: permissions.expiresAt || null,
    });

    logger.info(`Access granted: ${requestingHospital} -> ${targetHospital}`);

    return this.accessRules.get(key);
  }

  /**
   * Revoke access
   */
  revokeAccess(requestingHospital, targetHospital) {
    const key = `${requestingHospital}:${targetHospital}`;
    const deleted = this.accessRules.delete(key);

    if (deleted) {
      logger.info(`Access revoked: ${requestingHospital} -> ${targetHospital}`);
    }

    return deleted;
  }

  /**
   * Check if hospital has permission
   */
  hasPermission(requestingHospital, targetHospital, permissionType = 'read') {
    const key = `${requestingHospital}:${targetHospital}`;
    const rule = this.accessRules.get(key);

    if (!rule) {
      return false;
    }

    // Check if expired
    if (rule.expiresAt && new Date() > new Date(rule.expiresAt)) {
      this.revokeAccess(requestingHospital, targetHospital);
      return false;
    }

    return rule.permissions[permissionType] === true;
  }

  /**
   * Validate access before operation
   */
  validateAccess(requestingHospital, targetHospital, operation = 'read') {
    // Own hospital always has full access
    if (requestingHospital === targetHospital) {
      return { allowed: true, reason: 'Own hospital' };
    }

    // Check if target hospital exists
    if (!dbManager.hospitalExists(targetHospital)) {
      return { allowed: false, reason: 'Target hospital does not exist' };
    }

    // Check permissions
    const hasPermission = this.hasPermission(requestingHospital, targetHospital, operation);

    if (!hasPermission) {
      logger.warn(`Access denied: ${requestingHospital} -> ${targetHospital} (${operation})`);
      return { allowed: false, reason: 'Permission denied' };
    }

    return { allowed: true, reason: 'Permission granted' };
  }

  /**
   * Get all access rules for a hospital
   */
  getAccessRules(hospitalId) {
    const rules = [];

    for (const [key, rule] of this.accessRules.entries()) {
      if (rule.requestingHospital === hospitalId || rule.targetHospital === hospitalId) {
        rules.push(rule);
      }
    }

    return rules;
  }

  /**
   * Log access attempt (audit trail)
   */
  logAccess(requestingHospital, targetHospital, operation, success, details = {}) {
    const logEntry = {
      timestamp: new Date(),
      requestingHospital,
      targetHospital,
      operation,
      success,
      ...details,
    };

    logger.logAudit(
      `${operation.toUpperCase()}_ACCESS`,
      requestingHospital,
      targetHospital,
      logEntry
    );

    return logEntry;
  }

  /**
   * Bulk grant access (for emergencies)
   */
  grantEmergencyAccess(requestingHospital, duration = 24) {
    const hospitals = dbManager.getAllHospitals();
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
    const granted = [];

    for (const hospital of hospitals) {
      if (hospital.id !== requestingHospital) {
        this.grantAccess(requestingHospital, hospital.id, {
          read: true,
          write: false,
          transfer: true,
          expiresAt,
        });
        granted.push(hospital.id);
      }
    }

    logger.info(`Emergency access granted to ${requestingHospital} for ${duration} hours`);

    return {
      requestingHospital,
      grantedAccess: granted,
      expiresAt,
    };
  }

  /**
   * Clear all access rules
   */
  clearAllRules() {
    const count = this.accessRules.size;
    this.accessRules.clear();
    logger.info(`Cleared ${count} access rules`);
    return count;
  }
}

module.exports = new AccessControlService();