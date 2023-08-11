module.exports.errorHandler = (error, _, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : error.message;
  res.status(statusCode).send({ message });
  next();
};
