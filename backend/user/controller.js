const userService = require("./service");
const { respondWithError } = require("../utils/response");

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
    respondWithError(res, 500, "Error retrieving users.", err);
  }
};
