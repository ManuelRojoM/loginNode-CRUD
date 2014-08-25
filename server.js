//Inicializacion, obtenemos todas las dependencias que utilizaremos
var express      = require('express');
var app          = express();
var mysql        = require('mysql');
var port         = process.env.PORT || 3000;
var passport     = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var flash        = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

/** Empieza la configuración de la app **/

// Concexión con la base de datos
require('./config/database.js');

require('./config/passport')(passport); // pass passport for configuration

// Configuramos las dependencias utilizadfas


app.use(morgan('dev')); 	// Log para la consola
app.use(cookieParser()); 	// Cookies 
app.use(bodyParser()); 		// Para leer la información de los formularios

app.set('view engine', 'ejs'); // Confiracion del templating utilizado en este caso EJS

// Requerido por Passport
app.use(session({ secret: 'techinguelego' })); 	// Llave secreta de la sesión
app.use(passport.initialize());
app.use(passport.session()); 					// Sesiónes
app.use(flash()); 								// Mensajes flash en la sesion

// =========================================================
// Rutas
// =========================================================

// Cargamos las rutas y le enviamos la configuración de la app y de passport
require('./app/routes.js')(app, passport);

// =========================================================
// Arrancar server
// =========================================================
app.listen(port);
console.log('La magia pasa por el puerto ' + port);