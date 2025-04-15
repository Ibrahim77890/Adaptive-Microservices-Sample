// Following is the example of a sample adapter implementation

// import { MongoClient, Db } from 'mongodb';
// import { DatabaseAdapter } from './database.adapter';
// import { DatabaseConfig } from '../config/database';

// export class MongoDBAdapter implements DatabaseAdapter {
//   private client: MongoClient | null = null;
//   private db: Db | null = null;

//   constructor(private config: DatabaseConfig) {}

//   async connect(): Promise<void> {
//     try {
//       const uri = this.config.uri || `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
//       this.client = new MongoClient(uri);
//       await this.client.connect();
//       this.db = this.client.db(this.config.database);
//       console.log('Connected to MongoDB');
//     } catch (error) {
//       console.error('MongoDB connection error:', error);
//       throw error;
//     }
//   }

//   async disconnect(): Promise<void> {
//     if (this.client) {
//       await this.client.close();
//       this.client = null;
//       this.db = null;
//       console.log('Disconnected from MongoDB');
//     }
//   }

//   getClient(): { client: MongoClient; db: Db } {
//     if (!this.client || !this.db) {
//       throw new Error('MongoDB client not connected');
//     }
//     return { client: this.client, db: this.db };
//   }
// }