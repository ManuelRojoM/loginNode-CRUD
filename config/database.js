// Ontenemos las dependencias que utilizamos
var mysql = require('mysql');
 
// Conexión con la base de datos
 
var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root'
    });
 
// Creación de la base de datos y la tabla
 
connection.query('CREATE DATABASE IF NOT EXISTS test', function (err) {
    if (err) {throw err;}
    connection.query('USE test', function (err) {
        if (err) {throw err;}
        connection.query('CREATE TABLE IF NOT EXISTS users('
            + 'id INT NOT NULL AUTO_INCREMENT,'
            + 'PRIMARY KEY(id),'
            + 'username VARCHAR(30),'
            + 'displayname VARCHAR(50),'
            + 'email VARCHAR(50),'
            + 'photo VARCHAR(100),'
            + 'token VARCHAR(350),'
            + 'facebook_id VARCHAR(50),'
            + 'twitter_id VARCHAR(50),'
            + 'password VARCHAR(100)'
            +  ')', function (err) {
                if (err) {throw err;}
            });
    });
});
 