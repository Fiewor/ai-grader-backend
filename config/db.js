const mongoose = require("mongoose");
const uri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI
    : `mongodb://localhost:27017/textExtract`;
// ? `mongodb+srv://john:${process.env.MONGODB_ATLAS_KEY}@cluster0.crs9nx1.mongodb.net/?retryWrites=true&w=majority`

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
