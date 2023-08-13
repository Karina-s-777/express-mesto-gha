const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {
  DocumentNotFoundError,
} = require('./status/status');

// Слушаем 3000 порт, mestodb — имя базы данных, которая будет создана.
const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const app = express();

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// поключаемся к серверу mongoose
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '64d8b4183c1756eaf138dc35',
  };
  next();
});

app.use('/', require('./routes/index'));

// Обработка неправильного пути с ошибкой 404
app.use('*', (req, res) => {
  res.status(DocumentNotFoundError).send({ message: 'Страница не найдена' });
});

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(PORT);
