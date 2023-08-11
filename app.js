const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const { login, addUser } = require('./controllers/users');
const { auth } = require('./middlewares/auth');
const { validateUserBody, validateLogin } = require('./middlewares/validate');
const NotFoundError = require('./errors/NotFoundError');
// Слушаем 3000 порт, mestodb — имя базы данных, которая будет создана.
const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// поключаемся к серверу mongoose
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.post('/signup', validateUserBody, addUser);
app.post('/signin', validateLogin, login);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

// Обработка неправильного пути с ошибкой 404
app.use('*', () => {
  throw new NotFoundError('Пользователь с таким id не найден');
});

app.use(errors());

app.listen(PORT);
