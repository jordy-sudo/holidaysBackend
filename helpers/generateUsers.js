const { connectMySqlDb, closeMySqlDb } = require("../databases/config");
const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');

const generateUsers = async () => {
  let connection;

  try {
    connection = await connectMySqlDb();

    const [rows] = await connection.execute('SELECT * FROM vacaciones_new_tb');

    const results = [];

    for (const row of rows) {
      const postData = {
        user: row.nombres,
      };

      try {
        const apiResponse = await axios.post('http://200.7.249.21:90/Ldap/controllers/authenticated_test', postData);
        console.log('API Response:', apiResponse.data);
        // console.log(apiResponse.data[0]["Correo"]);

        // Agregar resultados a la matriz results
        results.push({
          user: row.nombres,
          apiResponse: apiResponse.data[0]["Correo"],
        });
      } catch (apiError) {
        console.error('Error making API request:', apiError);

        // Si hay un error, agregar una entrada de error a los resultados
        results.push({
          user: row.nombres,
          error: apiError.message,
        });
      }
    }
    console.log(results);
    // Convertir los resultados a un libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, 'Results');

    // Guardar el libro de Excel en un archivo
    const excelFileName = 'results.xlsx';
    XLSX.writeFile(wb, excelFileName);
    console.log(`Results saved to ${excelFileName}`);
  } catch (queryError) {
    console.error('Error executing SELECT query:', queryError);
  } finally {
    if (connection) {
      await closeMySqlDb(connection);
    }
  }
};

module.exports = {
  generateUsers,
};
