const respondWithError = (res, statusCode, message, err) => {
  if (err) {
    console.error(err);
  }

  return res.status(statusCode).json({ status: "error", message });
};

module.exports = { respondWithError };
