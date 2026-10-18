import mongoose from 'mongoose';
import { createId, readCollection, updateCollection } from '../config/localStore.js';

const matches = (record, filter = {}) => Object.entries(filter).every(([key, value]) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if ('$in' in value && Array.isArray(value.$in)) {
      return value.$in.some((v) => String(record[key] ?? '') === String(v ?? ''));
    }
    if ('$ne' in value) {
      return String(record[key] ?? '') !== String(value.$ne ?? '');
    }
  }
  return String(record[key] ?? '') === String(value ?? '');
});

const project = (record, selection) => {
  if (!record || !selection) return record;
  const fields = selection.split(/\s+/).filter(Boolean);
  const excluded = fields.filter((field) => field.startsWith('-')).map((field) => field.slice(1));
  const included = fields.filter((field) => !field.startsWith('-'));

  if (included.length) {
    return Object.fromEntries(included.filter((field) => field in record).map((field) => [field, record[field]]));
  }
  return Object.fromEntries(Object.entries(record).filter(([field]) => !excluded.includes(field)));
};

class LocalDocument {
  constructor(data, collection) {
    Object.assign(this, data);
    Object.defineProperty(this, '_collection', { value: collection, enumerable: false, writable: true });
  }

  toObject() {
    return Object.fromEntries(Object.entries(this));
  }

  toJSON() {
    return this.toObject();
  }

  async save() {
    if (!this._collection) return this;
    const self = this;
    return updateCollection(this._collection, (records) => {
      const index = records.findIndex((r) => String(r._id) === String(self._id));
      self.updatedAt = new Date().toISOString();
      if (index === -1) {
        records.push(self.toObject());
      } else {
        records[index] = { ...records[index], ...self.toObject(), updatedAt: self.updatedAt };
      }
      return self;
    });
  }
}

class LocalQuery {
  constructor(execute, collection) {
    this.executeQuery = execute;
    this.collection = collection;
    this.selection = '';
    this.sortOrder = null;
    this.result = undefined;
    this.execution = null;
  }

  select(selection) {
    this.selection = selection;
    return this;
  }

  sort(sortOrder) {
    this.sortOrder = sortOrder;
    return this;
  }

  async exec() {
    if (!this.execution) {
      this.execution = (async () => {
        let value = await this.executeQuery();
        const asArray = Array.isArray(value);
        let records = asArray ? value : value ? [value] : [];

        if (this.sortOrder) {
          const [[field, direction]] = Object.entries(this.sortOrder);
          records = records.sort((left, right) => {
            const comparison = String(left[field] ?? '').localeCompare(String(right[field] ?? ''), undefined, { numeric: true });
            return comparison * (direction < 0 ? -1 : 1);
          });
        }

        records = records.map((record) => new LocalDocument(project(record, this.selection), this.collection));
        value = asArray ? records : records[0] || null;
        this.result = value;
        return value;
      })();
    }
    return this.execution;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

export const createLocalModel = (collection) => class LocalModel {
  static find(filter = {}) {
    return new LocalQuery(async () => (await readCollection(collection)).filter((record) => matches(record, filter)), collection);
  }

  static findOne(filter = {}) {
    return new LocalQuery(async () => (await readCollection(collection)).find((record) => matches(record, filter)) || null, collection);
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async countDocuments(filter = {}) {
    const records = await readCollection(collection);
    return records.filter((record) => matches(record, filter)).length;
  }

  static create(data) {
    return updateCollection(collection, (records) => {
      const now = new Date().toISOString();
      const document = { ...data, _id: data._id || createId(), createdAt: now, updatedAt: now };
      records.push(document);
      return new LocalDocument(document, collection);
    });
  }

  static findOneAndUpdate(filter, updates, options = {}) {
    return new LocalQuery(() => updateCollection(collection, (records) => {
      let index = records.findIndex((record) => matches(record, filter));
      if (index === -1 && options.upsert) {
        records.push({ ...filter, ...updates, _id: createId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        index = records.length - 1;
      }
      if (index === -1) return null;

      const before = records[index];
      records[index] = {
        ...before,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return new LocalDocument(options.new ? records[index] : before, collection);
    }), collection);
  }

  static findByIdAndUpdate(id, updates, options = {}) {
    return this.findOneAndUpdate({ _id: id }, updates, options);
  }

  static findOneAndDelete(filter) {
    return new LocalQuery(() => updateCollection(collection, (records) => {
      const index = records.findIndex((record) => matches(record, filter));
      if (index === -1) return null;
      return new LocalDocument(records.splice(index, 1)[0], collection);
    }), collection);
  }

  static findByIdAndDelete(id) {
    return this.findOneAndDelete({ _id: id });
  }

  static updateOne(filter, update) {
    return new LocalQuery(() => updateCollection(collection, (records) => {
      const record = records.find((entry) => matches(entry, filter));
      if (!record) return { matchedCount: 0, modifiedCount: 0 };
      Object.assign(record, update.$set || update, { updatedAt: new Date().toISOString() });
      return { matchedCount: 1, modifiedCount: 1 };
    }), collection);
  }

  static deleteMany(filter = {}) {
    return new LocalQuery(() => updateCollection(collection, (records) => {
      let deletedCount = 0;
      for (let i = records.length - 1; i >= 0; i--) {
        if (matches(records[i], filter)) {
          records.splice(i, 1);
          deletedCount++;
        }
      }
      return { deletedCount };
    }), collection);
  }
};

export const createHybridModel = (modelName, collectionName, schema) => {
  let MongooseModel;
  try {
    MongooseModel = mongoose.model(modelName);
  } catch {
    MongooseModel = mongoose.model(modelName, schema);
  }
  const LocalFallback = createLocalModel(collectionName);

  return new Proxy(MongooseModel, {
    get(target, prop) {
      if (mongoose.connection.readyState === 1) {
        return target[prop];
      }
      if (prop in LocalFallback) {
        return LocalFallback[prop];
      }
      return target[prop];
    },
  });
};
