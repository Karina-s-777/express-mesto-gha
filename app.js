const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const {
  DocumentNotFoundError,
} = require('./status/status');

const { login, addUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
// Слушаем 3000 порт, mestodb — имя базы данных, которая будет создана.
const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const { validateUserBody } = require('./middlewares/validata');

const app = express();

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// поключаемся к серверу mongoose
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.post('/signin', validateUserBody, addUser);
app.post('/signup', validateUserBody, login);

app.use(errors());
app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

// Обработка неправильного пути с ошибкой 404
app.use('*', (req, res) => {
  res.status(DocumentNotFoundError).send({ message: 'Страница не найдена' });
});

app.listen(PORT);
