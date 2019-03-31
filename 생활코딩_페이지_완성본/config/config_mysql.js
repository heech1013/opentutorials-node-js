module.exports = ()=>{
    const mysql = require('mysql');

    const conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '111111',
        database: 'o2'
    });
    conn.connect();

    return conn;
};