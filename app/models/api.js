// Llamamos al paquete mysql instalado
var mysql = require('mysql'),
// Creamos la conexion a nuestra base de datos
connection = mysql.createConnection(
    { 
        host: 'localhost', 
        user: 'root',  
        password: 'root', 
        database: 'test'
    }
);
 
// Creamos un objeto para ir almacenando todo lo que necesitemos
var userModel = {};
 
/** Esta es la parte del modelo donde se crean los querys **/

// Obtenemos todos los usuarios
userModel.getUsers = function(callback)
{
    if (connection) 
    {
        connection.query('SELECT * FROM users ORDER BY id', function(error, rows) {
            if(error)
            {
                throw error;
            }
            else
            {
                callback(null, rows);
            }
        });
    }
}
 
// Obtenemos un usuario por su id
userModel.getUser = function(id,callback)
{
    if (connection) 
    {
        var sql = 'SELECT * FROM users WHERE id = ' + connection.escape(id);
        connection.query(sql, function(error, row) 
        {
            if(error)
            {
                throw error;
            }
            else
            {
                callback(null, row);
            }
        });
    }
}
 
// Añadimos un nuevo usuario
userModel.insertUser = function(userData,callback)
{
    if (connection) 
    {
        connection.query('INSERT INTO users SET ?', userData, function(error, result) 
        {
            if(error)
            {
                throw error;
            }
            else
            {
                //devolvemos la última id insertada
                callback(null,{"insertId" : result.insertId});
            }
        });
    }
}
 
// Actualizamos a un usuario
userModel.updateUser = function(userData, callback)
{
    //console.log(userData); return;
    if(connection)
    {
        var sql = 'UPDATE users SET username = ' + connection.escape(userData.username) + ',' +  
        'email = ' + connection.escape(userData.email) +
        'WHERE id = ' + userData.id;
 
        connection.query(sql, function(error, result) 
        {
            if(error)
            {
                throw error;
            }
            else
            {
                callback(null,{"msg":"success"});
            }
        });
    }
}
 
// Eliminarmos un usuario pasando la id a eliminar
userModel.deleteUser = function(userData, callback)
{
    if(connection)
    {
        //console.log(id);
        var sqlExists = "SELECT * FROM users WHERE id ="+userData.id;
        connection.query(sqlExists, function(error, result) 
        {
            //si existe la id del usuario a eliminar
            if(result)
            {

                var sql = "DELETE FROM users WHERE id ="+userData.id;
                connection.query(sql, function(error, result) 
                {
                    if(error)
                    {
                        throw error;
                    }
                    else
                    {
                        callback(null,{"msg":"success"});
                    }
                });
            }
            else
            {
                callback(null,{"msg":"error"});
            }
        });
    }
}


 
// Exportamos el objeto para tenerlo disponible en la zona de rutas
module.exports = userModel;