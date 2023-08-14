// Создаем контроллеры - функции, ответственные за взаимодействие с моделью.
// То есть это функции, которые выполняют создание, чтение, обновление или удаление документа.
// Файл контроллеров описывает логику обработки запросов
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require('http2').constants;
const { default: mongoose } = require('mongoose');
// const SECRET_SIGNING_KEY = require('../utils/constants');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/NotFoundError');
// npm
const User = require('../models/user');

module.exports.getUsers = (req, res, next) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((error) => {
      //  оператор instanceof позволяет определить, является ли указанный объект (ошибка)
      //  экземпляром некоторого класса c учётом иерархии наследования.
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Неверный id'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        next(error);
      }
    });
};

// Создание документов
module.exports.addUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // Метод create может быть промисом — ему можно добавить обработчики then и catch.
  // Так обычно и делают, чтобы вернуть клиенту данные или ошибку
  bcrypt.hash(password, 8)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      const { _id } = user;
      return res.status(HTTP_STATUS_CREATED).send({
        email,
        name,
        about,
        avatar,
        _id,
      });
    })
    .catch((error) => {
      if (error.code === 11000) {
        next(new ConflictError('Пользователь с таким электронным адресом уже зарегистрирован'));
      } else if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else {
        next(error);
      }
    });
};

// module.exports.login = (req, res, next) => {
//   const { email, password } = req.body;
//   return User.findOne({ email }).select('+password')
//     .then((user) => {
//       if (!user || !bcrypt.compareSync(password, user.password)) {
//         throw new UnauthorizedError('Неправильные почта или пароль');
//       }
//       const token = jwt.sign(
//         { _id: user._id },
//         'some-secret-key',
//         { expiresIn: '7d' },
//       );
//       res.send({ token });
//     })
//     .catch((error) => next(error));
// };

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((error) => next(error));
};

module.exports.editUserData = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => {
      res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.editUserAvatar = (req, res, next) => {
  // runValidators - флаг, который позволяет с Update валидировать по схеме
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => {
      res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        next(error);
      }
    });
};
