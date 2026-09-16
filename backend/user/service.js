const User = require("./model");

exports.getUsers = () => {
	return User.findAll();
};
