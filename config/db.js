const mongoose = require("mongoose");
const uri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI
    : `mongodb://localhost:27017/textExtract`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
};
const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(uri, options);
    const conn = await mongoose.connect(
      "mongodb+srv://john:fiewor@cluster0.crs9nx1.mongodb.net/?retryWrites=true&w=majority",
      options
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
