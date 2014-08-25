var Controller = require('./controllers/controller');
var UserModel = require('./models/api');

module.exports = function(app, passport) {

	// ====================================================
	// Pagina Principal 
	// ====================================================
	app.get('/', function(req, res) {

		// Cargamos la vista
		res.render('index.ejs'); 
	});

	// ====================================================
	// Login
	// ====================================================
	app.get('/login', function(req, res) {

		// Cargamos la vista del login con un mensaje en la sesión
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	// Procesamos el formulario 
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile',
		failureRedirect : '/login', 
		failureFlash : true // Acepta Mensajes en la sesión
	}));


	// ====================================================
	// Registro 
	// ====================================================
	app.get('/signup', function(req, res) {

		// Cargamos la pagina de registro y enviamos un mensaje
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// Procesamos el formilario
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup', 
		failureFlash : true 
	}));

	// ====================================================
	// Sección del perfil
	// 
	// Verificaremos que este logueado en esta sección
	// para ello utilizamos la funcion isLoggedIn
	// ====================================================
	app.get('/profile', isLoggedIn, function(req, res) {
		// Cargamos la vista del perfil y obtenemos el usuario de la sesión y lo mandamos a la vista
		res.render('profile.ejs', {
			user : req.user 
		});
	});

	// ====================================================
	// Rutas de Facebook
	// ====================================================
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email'}));

	// Procesamos la petición y regresamos la información en caso de ser correctas
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
		}));

	// ====================================================
	// Rutas de Twitter
	// ====================================================
	app.get('/auth/twitter', passport.authenticate('twitter'));

	// Procesamos la petición y regresamos la información en caso de ser correctas
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect : '/profile',
			failureRedirect : '/'
		}));

	// ====================================================
	// Logout
	// ====================================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// ====================================================
	// Vistas de CRUD
	// ====================================================
	app.get('/home', isLoggedIn, function(req, res) {
		// Cargamos la vista
		res.render('home.ejs');  
	});
	// devolver todos los Personas
	app.get('/api/usuario', isLoggedIn, Controller.getUsers);
	// Crear una nueva Persona
	app.post('/api/usuario', isLoggedIn, Controller.insertUser);
	// Modificar los datos de una Persona
	app.put('/api/usuario/:usuario_id', isLoggedIn, Controller.updateUser);
	// Borrar una Persona
	app.delete('/api/delete/:id', isLoggedIn, Controller.deleteUser);
};

// Esta es la función para verificar que este logueado
function isLoggedIn(req, res, next) {

	// Si el usuario esta logueado seguimos
	if (req.isAuthenticated()) {return next();}

	// Si no lo esta lo redireccionamos al principio
	res.redirect('/');
}