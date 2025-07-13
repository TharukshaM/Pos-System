require('dotenv').config();
const mysql = require('mysql2');

var connection = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) {
        console.log(err);
    }
    else{
        console.log('Connected to the database successfully');
    }
});

module.exports = connection;