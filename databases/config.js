const mongoose = require("mongoose");
const mysql = require("mysql2/promise");

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

const connectMySqlDb = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.db_mysql_36_host,
      port: process.env.db_mysql_36_port,
      user: process.env.db_mysql_36_user,
      password: process.env.db_mysql_36_passwd,
      database: process.env.db_mysql_36_table,
    });

    console.log("Connected to MySQL 36");
    return connection;
  } catch (error) {
    console.error("Error al conectar a la base de datos MySQL:", error);
    throw error;
  }
};

const closeMySqlDb = async (connection) => {
  try {
    await connection.destroy();
    console.log("MySQL connection closed");
  } catch (error) {
    console.error("Error closing MySQL connection:", error);
    throw error;
  }
};


module.exports = {
  connectDb,
  connectMySqlDb,
  closeMySqlDb,
};
