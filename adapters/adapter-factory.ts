// The adapter-factory.ts file is typically used to define a factory class or function responsible for creating and configuring adapter instances. These adapters are often used to abstract and standardize interactions with external systems, services, or APIs, enabling easier integration and maintainability within a microservices architecture.

// Following is the sample for usage
// Factory for creating the appropriate adapter
// import { dbConfig } from '../config/database';

// export class DatabaseAdapterFactory {
//   static createAdapter(): DatabaseAdapter {
//     switch (dbConfig.type) {
//       case 'mongodb':
//         return new MongoDBAdapter(dbConfig);
//       case 'dynamodb':
//         return new DynamoDBAdapter(dbConfig);
//       case 'sql':
//         return new SQLAdapter(dbConfig);
//       default:
//         throw new Error(`Unsupported database type: ${dbConfig.type}`);
//     }
//   }
// }