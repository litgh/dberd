import Dexie from 'dexie';

const db = new Dexie('dberd');
db.version(1).stores({
  diagrams: '++id, lastModified'
});

export default db;