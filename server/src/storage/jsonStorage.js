const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const config = require('../config/env');

/**
 * Thread-safe, atomic JSON collection storage abstraction.
 * Allows seamless drop-in replacement with MongoDB ODM/drivers in the future.
 */
class JsonStorage {
  constructor(collectionName, options = {}) {
    if (!collectionName) {
      throw new Error('JsonStorage requires a collectionName');
    }
    this.collectionName = collectionName;
    this.dataDir = options.dataDir || config.storage.dataDir;
    this.filePath = path.join(this.dataDir, `${collectionName}.json`);
    this.writeLock = Promise.resolve();
    
    // Ensure data directory exists
    if (!fsSync.existsSync(this.dataDir)) {
      fsSync.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Safe asynchronous file read with missing-file auto-initialization.
   */
  async _readRaw() {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to read data from ${this.collectionName}: ${err.message}`);
    }
  }

  /**
   * Atomic file write using a temporary file and atomic rename.
   * Serialized via internal write lock queue to prevent race conditions.
   */
  async _atomicWrite(data) {
    const operation = async () => {
      const tempPath = path.join(this.dataDir, `.${this.collectionName}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
      const serialized = JSON.stringify(data, null, 2);
      
      await fs.writeFile(tempPath, serialized, 'utf8');
      try {
        await fs.rename(tempPath, this.filePath);
      } catch (renameErr) {
        // Windows EPERM / antivirus transient lock fallback
        if (renameErr.code === 'EPERM' || renameErr.code === 'EBUSY') {
          await new Promise(r => setTimeout(r, 25));
          try {
            await fs.rename(tempPath, this.filePath);
          } catch (retryErr) {
            await fs.copyFile(tempPath, this.filePath);
            await fs.unlink(tempPath).catch(() => {});
          }
        } else {
          throw renameErr;
        }
      }
    };

    // Chain to previous write operation to ensure strict serial execution
    this.writeLock = this.writeLock.then(operation, operation);
    return this.writeLock;
  }

  /**
   * Find all items matching optional predicate or query filter object
   */
  async find(filter = {}) {
    const items = await this._readRaw();
    if (typeof filter === 'function') {
      return items.filter(filter);
    }
    const filterKeys = Object.keys(filter);
    if (filterKeys.length === 0) {
      return items;
    }
    return items.filter(item => {
      return filterKeys.every(key => item[key] === filter[key]);
    });
  }

  /**
   * Find a single item matching filter
   */
  async findOne(filter = {}) {
    const items = await this.find(filter);
    return items.length > 0 ? items[0] : null;
  }

  /**
   * Find item by unique ID field
   */
  async findById(id) {
    if (!id) return null;
    return this.findOne({ id: String(id) });
  }

  /**
   * Insert a new record
   */
  async insert(record) {
    if (!record || typeof record !== 'object') {
      throw new Error('Record to insert must be a non-null object');
    }

    const items = await this._readRaw();
    const now = new Date().toISOString();
    const doc = {
      ...record,
      createdAt: record.createdAt || now,
      updatedAt: record.updatedAt || now
    };

    items.push(doc);
    await this._atomicWrite(items);
    return doc;
  }

  /**
   * Update a record by ID
   */
  async updateById(id, updates) {
    if (!id) throw new Error('ID is required for update');

    const items = await this._readRaw();
    const index = items.findIndex(item => item.id === String(id));
    if (index === -1) {
      return null;
    }

    const updatedDoc = {
      ...items[index],
      ...updates,
      id: items[index].id, // protect immutable ID
      createdAt: items[index].createdAt, // protect creation date
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedDoc;
    await this._atomicWrite(items);
    return updatedDoc;
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id) {
    if (!id) throw new Error('ID is required for deletion');

    const items = await this._readRaw();
    const index = items.findIndex(item => item.id === String(id));
    if (index === -1) {
      return false;
    }

    const deleted = items.splice(index, 1);
    await this._atomicWrite(items);
    return deleted.length > 0;
  }

  /**
   * Count records matching filter
   */
  async count(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }

  /**
   * Check storage readiness and accessibility
   */
  async checkHealth() {
    try {
      if (!fsSync.existsSync(this.dataDir)) {
        await fs.mkdir(this.dataDir, { recursive: true });
      }
      // Attempt read or access test
      await fs.access(this.dataDir, fsSync.constants.R_OK | fsSync.constants.W_OK);
      return {
        healthy: true,
        type: 'local-json',
        dataDir: this.dataDir
      };
    } catch (err) {
      return {
        healthy: false,
        type: 'local-json',
        error: err.message
      };
    }
  }
}

module.exports = JsonStorage;

