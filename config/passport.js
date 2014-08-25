// Cargamos las dependencias que utilizaremos
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var configAuth       = require('./auth');
var passport         = require('passport');
var bcrypt           = require('bcrypt-nodejs');
var mysql            = require('mysql');
 
var connection = mysql.createConnection({
                  host     : 'localhost',
                  user     : 'root',
                  password : 'root'
                });
 
connection.query('USE test');

// Cargamos el Modelo
var User       		= require('../app/models/user');

// Generamos la funcion para passport
module.exports = function(passport) {

    // =========================================================================
    // Configuración de la sesión con Passport
    // =========================================================================

    // Serializamos al usuario
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserializamos al usuario
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = "+id,function(err,rows){   
            done(err, rows[0]);
        });
    });

 	// =========================================================================
    // Registro Local
    // =========================================================================

    passport.use('local-signup', new LocalStrategy({
        // Por default Passport utiliza username y password para la autentificación
        // aqui utilizamos el email y password
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // Regresa toda la solicitud
    },
    function(req, email, password, done) {

        process.nextTick(function() {

            // Buscamos si ya existe el usuario y en caso de que exista regresamos el error
     
            connection.query("SELECT * FROM users WHERE email = '"+email+"'",function(err,rows){
                if (err){return done(err);}
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'Este correo electronico ya ha sido registrado'));
                } else {
     
                    // En caso de que no exista el usuario, lo creamos
                    var newUserMysql = new Object();
                    
                    // Le hacemos un hash al password por seguridad
                    password              = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

                    // Guardamos los datos en el objeto creado
                    newUserMysql.email    = email;
                    newUserMysql.password = password;
                    
                    // Hacemo sla inserción de los datos en la tabla
                    var insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ password +"')";
                    connection.query(insertQuery,function(err,rows){
                        // Serializamos el usuario para poderlo utilizar en la sesión
                        newUserMysql.id = rows.insertId;
                        return done(null, newUserMysql);
                    }); 
                }   
            });   

        });

    }));

    // =========================================================================
    // Inicio de sesión local
    // =========================================================================
 
    passport.use('local-login', new LocalStrategy({

        // Por default Passport utiliza username y password para la autentificación
        // aqui utilizamos el email y password
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) { // Devolvemos la llamada con los datos requeridos
        
        // Verificamos que el usuario exista, de lo contrario mandamos un mensaje de error
        connection.query("SELECT * FROM users WHERE email = '" + email + "'",function(err,rows){
            if (err)
                return done(err);
             if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'Error con las credenciales.')); // req.flash de esta manera mandamos el mensaje
            } 

            // Comparamos el password en caso de no coincidir mandamos un mensaje de error
            // Utilizamos la funcion bcrypt.compareSync para hacer la comparacion
            if (! bcrypt.compareSync(password, rows[0].password)) 
                return done(null, false, req.flash('loginMessage', 'Error con las credenciales.')); // Creamos el loginMessage y lo salvamos en la sesión como flashdata
            
            // Si todo sale bien, regresamos el usuario
            return done(null, rows[0]);         
        
        });
    }));

    // =========================================================================
    // Facebook
    // =========================================================================
    passport.use(new FacebookStrategy({

        // Ingresamos el id y el secret que teniamos en el auth.js
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        // profileFields: ['id', 'displayName', 'user_photos', 'emails']

    },

    // Facebook nos devuelve el token y el perfil
    function(token, refreshToken, profile, done) {

        process.nextTick(function() {

            var idProvider = profile.id;

            // Buscamos el usuario en la tabla con el identificador facebook_id
            // en caso de encontrarlo devovemos el usuario
            connection.query("SELECT * FROM users WHERE facebook_id = '"+idProvider+"'",function(err,rows){
                if (err){return done(err);}
                if (rows.length) {
                    return done(null, rows[0]);
                } else {

                    // Si no existe el usuario lo creamos
                    var newUserFaceMysql = new Object();
                    
                    // Guardamos los datos en variables para ingresarlos en la tabla
                    var id_facebook              = profile.id;
                    var name                     = profile.name.givenName + ' ' + profile.name.familyName;
                    var email                    = profile.emails[0].value;
                    // var photo                 = profile.photos[0].value;

                    // Guardamos los datos en el objeto creado
                    newUserFaceMysql.facebook_id = profile.id;
                    newUserFaceMysql.token       = token;
                    newUserFaceMysql.username    = profile.name.givenName + ' ' + profile.name.familyName;
                    newUserFaceMysql.email       = profile.emails[0].value; // Facebook devuelve varias cuentas de correo, tomamos la primera
                    // newUserFaceMysql.photo = profile.photos[0].value;

                    // Hacemo sla inserción de los datos en la tabla
                    var insertQuery = "INSERT INTO users (username, email, facebook_id, token ) values ('" + name +"','"+ email +"','"+ id_facebook +"','"+ token +"')";
                    connection.query(insertQuery,function(err,rows){
                        // Serializamos el usuario para poderlo utilizar en la sesión
                        newUserFaceMysql.id = rows.insertId;
                        return done(null, newUserFaceMysql);
                    }); 
                }   

            });
        });

    }));

    // =========================================================================
    // Twitter
    // =========================================================================
    passport.use(new TwitterStrategy({

        // Ingresamos el id y el secret que teniamos en el auth.js
        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL

    },
    
    // Twitter nos devuelve el token y el perfil
    function(token, tokenSecret, profile, done) {

        process.nextTick(function() {

            var idProvider = profile.id;

            // Buscamos el usuario en la tabla con el identificador twitter_id
            // en caso de encontrarlo devovemos el usuario
            connection.query("SELECT * FROM users WHERE twitter_id = '"+idProvider+"'",function(err,rows){
                if (err){return done(err);}
                if (rows.length) {
                    return done(null, rows[0]);
                } else {

                    // Si no existe el usuario lo creamos
                    var newUsertwitterMysql = new Object();
                    
                    // Guardamos los datos en variables para ingresarlos en la tabla
                    var id_twitter                  = profile.id;
                    var name                        = profile.username;
                    var displayname                 = profile.displayName;
                    var photo                       = profile.photos[0].value;
                    
                    // Guardamos los datos en el objeto creado
                    newUsertwitterMysql.twitter_id  = profile.id;
                    newUsertwitterMysql.token       = token;
                    newUsertwitterMysql.username    = profile.username;
                    newUsertwitterMysql.displayname = profile.displayName;
                    newUsertwitterMysql.photo       = profile.photos[0].value;
                
                    // Hacemo sla inserción de los datos en la tabla
                    var insertQuery = "INSERT INTO users (username, displayname, photo, twitter_id, token ) values ('" + name +"','"+ displayname +"','"+ photo +"','"+ id_twitter +"','"+ token +"')";
                    connection.query(insertQuery,function(err,rows){
                        // Serializamos el usuario para poderlo utilizar en la sesión
                        newUsertwitterMysql.id = rows.insertId;
                        return done(null, newUsertwitterMysql);
                    }); 
                }   

            });

        });

    }));


};
