import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectionString: string = `mongodb+srv://benjamin:${process.env.MONGODB_PASSWORD}@cluster0.kbcedtl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

class Database {
  static instance: any;

  constructor() {
    this.connect();
  }

  connect() {
    mongoose.set("debug", true);
    mongoose.set("debug", { color: true });
    mongoose
      .connect(connectionString)
      .then((_) => {
        console.log(`Connected MongoDb successful`);
      })
      .catch((err: any) => console.log("Error Connection!", err.stack));
  }

  static getInstance = () => {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  };
}

const instanceMongodb = Database.getInstance;

export { instanceMongodb };
