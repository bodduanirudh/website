const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017'; // Use your MongoDB Atlas connection string here if using Atlas

// Database Name
const dbName = 'price_comparison';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Establish and verify connection
        const db = client.db(dbName);
        console.log("Connected successfully to MongoDB");

        // Example: Create a collection (table equivalent in SQL)
        const collection = db.collection('products');

        // Example: Insert a document (row equivalent in SQL)
        const product = { name: "Example Product", category: "Electronics" };
        const result = await collection.insertOne(product);
        console.log(`New product inserted with id: ${result.insertedId}`);

        // Example: Find the inserted document
        const foundProduct = await collection.findOne({ _id: result.insertedId });
        console.log("Found product:", foundProduct);

    } finally {
        // Close the connection
        await client.close();
    }
}

run().catch(console.dir);
