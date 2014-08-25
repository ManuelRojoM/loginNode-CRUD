var UserModel = require('../models/api');

exports.getUsers = function(req, res) {
	UserModel.getUsers(function(error, data){
		res.json(data)
	});
}

exports.insertUser = function(req, res) {
	var userData = {
		id: null,
		username : req.body.username,
		email : req.body.email,
		password : req.body.password,
	};
	UserModel.insertUser(userData, function(error, data){

		if (error) {
			res.send(error);

		}else{
			UserModel.getUsers(function(error, data){
				res.json(data)
			});
		}
	});
}

exports.updateUser = function(req, res) {
	//almacenamos los datos del formulario en un objeto
    var userData = {
    	id:req.param('id'),
    	username : req.body.username,
		email : req.body.email,
		password : req.body.password,
    };
    console.log(userData.id);
    UserModel.updateUser(userData,function(error, data){

    	if (error) {
			res.send(error);

		}else{
			UserModel.getUsers(function(error, data){
				res.json(data)
			});
		}
    });
}

exports.deleteUser = function(req, res) {
	//id del usuario a eliminar
    var userData = {
    	id:req.param('id')
    };
    console.log(userData.id);
    UserModel.deleteUser(userData,function(error, data){

    	if(data && data.msg === "success" || data.msg === "error"){
    		UserModel.getUsers(function(error, data){
    			if (error) {
    				res.json(error);
    			}else{
    				res.json(data);
    			}
			});

		}else{
			res.send(error);
		}
    });
}


