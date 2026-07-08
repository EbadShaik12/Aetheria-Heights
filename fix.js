import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aetheria_heights';

async function fix() {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    await db.collection('profiles').updateMany(
        { hotelName: 'http://localhost:5173' },
        { $set: { hotelName: 'Aetheria Heights' } }
    );
    console.log('Fixed DB');
    process.exit(0);
}

fix();
