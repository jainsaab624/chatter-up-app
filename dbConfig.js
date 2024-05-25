import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

// Connecting to the Mongodb here.
const baseUrl = process.env.MONGODB || '0.0.0.0:27017';

const connectUsingMongoose = async ()=>{
    try {
        await mongoose.connect(`mongodb://${baseUrl}/chatterApp`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Mongodb is connected.");
    } catch (error) {
        console.log(error);
    }
}

export default connectUsingMongoose;
