const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');

// Создаем контроллеры - функции, ответственные за взаимодействие с моделью.
// То есть это функции, которые выполняют создание, чтение, обновление или удаление документа.
// Файл контроллеров описывает логику обработки запросов

const { default: mongoose } = require('mongoose');
const { SECRET_SIGNING_KEY } = require('../utils/constants');
const {
  NoError,
  CastError,
  DocumentNotFoundError,
  InternalServerError,
  Unauthorized,
  ConflictError,
} = require('../status/status');

const User = require('../models/user');
// const bcrypt = require('bcryptjs');

module.exports.getUsers = (req, res) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      //  оператор instanceof позволяет определить, является ли указанный объект (ошибка)
      //  экземпляром некоторого класса c учётом иерархии наследования.
      if (error instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Неверный id' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Пользователь не найден' });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports.addUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // // получим из объекта запроса имя, описание пользователя и аватар
  bcrypt.hash(password, 8)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
  // Метод create может быть промисом — ему можно добавить обработчики then и catch.
  // Так обычно и делают, чтобы вернуть клиенту данные или ошибку
    .then((user) => {
      const { _id } = user;
      return res.status(NoError).send({
        email,
        name,
        about,
        avatar,
        _id,
      });
    })
    .catch((error) => {
      if (error.code === 11000) {
        res.status(ConflictError).send({ message: 'Пользователь с таким электронным адресом уже зарегистрирован' });
      } else if (error instanceof mongoose.Error.ValidationError) {
        res.status(CastError).send({ message: error.message });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

// Создание документов
// module.exports.addUser = (req, res) => {
//   const {
//     email, password, name, about,avatar,
//   } = req.body;
//   // // получим из объекта запроса имя, описание пользователя и аватар
//   bcrypt.hash(password, 8)
//     .then((hash) => User.create({
//       email, password: hash,
//     }))
//     // Метод create может быть промисом — ему можно добавить обработчики then и catch.
//     // Так обычно и делают, чтобы вернуть клиенту данные или ошибку
//     .then((user) => {
//       return res.status(NoError).send({
//         _id: user._id,
//         email: user.email,
//       });
//     })
//     .catch((error) => {
//       if (error.code === 11000) {
//         res.status(ConflictError).send({ message:
// 'Пользователь с таким электронным адресом уже зарегистрирован' });
//       } else if (error.name === 'ValidationError') {
//         res.status(CastError).send({ message: error.message });
//       } else {
//         res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
//       }
//     });
// };

module.exports.editUserData = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(CastError).send({ message: 'Неверный id' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Пользователь не найден' });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports.editUserAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(CastError).send({ message: 'Неверный id' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Пользователь не найден' });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports.getUserData = (req, res) => {
  User.findById(req.user.userId)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(CastError).send({ message: 'Неверный id' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Пользователь не найден' });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        SECRET_SIGNING_KEY,
        { expiresIn: '7d' }, // токен будет просрочен через час после создания
      );
        // вернём токен
      res.status(NoError).send({ token });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res
          .status(Unauthorized)
          .send({ message: 'Введены неправильные данные' });
      }
      res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
    });
};
