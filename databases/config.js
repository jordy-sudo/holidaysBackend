const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.db_mongo, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connect");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  connectDb,
};
