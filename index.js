const express = require('express');
const { connectDb, } = require('./databases/config');
const cors = require('cors');
const { generateUsers } = require('./helpers/generateUsers');
require('dotenv').config();

const app = express();

//helpers
// generateUsers();

app.use(express.static('./public'));

//database
connectDb();
//cors
app.use(cors());

//boddy requeres
app.use(express.json());

// rutas
app.use('/app/auth',require('./routes/auth'));
app.use('/app/events',require('./routes/events'));



app.listen(process.env.PORT,()=>{
    console.log(`Servidor corriendo desde el puero ${process.env.PORT}`);
});