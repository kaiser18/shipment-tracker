const userService = require("./service");

exports.getUsers = async (req, res, next) => {
	try {
		const users = await userService.getUsers();
		res.status(200).json({
			status: "success",
			data: {
				users,
			},
		});
	} catch (err) {
		console.error(err);
		res
			.status(500)
			.json({ status: "error", message: "Error retrieving users." });
	}
};
