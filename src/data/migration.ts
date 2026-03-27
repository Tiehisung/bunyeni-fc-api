import mongoose from "mongoose";

const SOURCE_URI = "";
const TARGET_URI = "";

export async function migrateAllCollections(source_uri: string = SOURCE_URI, target_uri: string = TARGET_URI) {
    const sourceConn = await mongoose.createConnection(source_uri).asPromise();
    const targetConn = await mongoose.createConnection(target_uri).asPromise();

    const sourceDb = sourceConn.db;
    const targetDb = targetConn.db;

    if (!sourceDb || !targetDb) {
        throw new Error("Database connection failed");
    }

    const collections = await sourceDb.listCollections().toArray();

    console.log(`Found ${collections.length} collections`);

    for (const collectionInfo of collections) {
        const name = collectionInfo.name;


        if (name == 'news') {



            console.log(`Migrating collection: ${name}`);

            const sourceCollection = sourceDb.collection(name);
            const targetCollection = targetDb.collection(name);

            const documents = await sourceCollection.find({}).toArray();

            if (documents.length === 0) {
                console.log(`Skipping empty collection: ${name}`);
                continue;
            }

            await targetCollection.insertMany(documents);

            console.log(`✓ Migrated ${documents.length} documents from ${name}`);
        }
    }

    await sourceConn.close();
    await targetConn.close();


    console.log("Migration complete");
    return collections
}

// migrateAllCollections().catch((err) => {
//     console.error("Migration failed:", err);
// });