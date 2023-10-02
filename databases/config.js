const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.db_mongo, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    const dbName = process.env.db_name;

    db.once("open", () => {
      console.log("DB Connect");

      db.db.listCollections({ name: dbName }).next((err, collinfo) => {
        if (collinfo) {
          console.log(`Usando la base de datos existente: ${dbName}`);
        } else {
          db.db.createCollection(dbName);
          console.log(`Base de datos creada: ${dbName}`);
        }
      });
    });

    db.on("error", (error) => {
      console.error("Error de conexión a la base de datos:", error);
    });
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  }
};

module.exports = {
  connectDb,
};
