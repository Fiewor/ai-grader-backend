const errorHandler = (err, req, res, next) => {
  // if statusCode is set in controller use that, if not respond with 500
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  //   stack (additional info.) only shows in development
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
