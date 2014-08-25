// Cargamos lo que vamos a utilizar
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var mysql    = require('mysql');

var connection = mysql.createConnection({
				  host     : 'localhost',
				  user     : 'root',
				  password : 'root'
				});

connection.query('USE test');	

// Definimos el modelo
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

/** Metodos **/

// Generando un Hash para el password
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Verificamos que el password sea valido
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// Creamos y exportamos el modelo para la app
module.exports = mongoose.model('User', userSchema);