const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');

const { SECRET_SIGNING_KEY } = require('../utils/constants');
const {
  NoError,
} = require('../status/status');

const User = require('../models/user');
// 401
// const UnauthorizedError = require('../errors/UnauthorizedError');
// 400
const InaccurateDataError = require('../errors/InaccurateDataError');
// 409
const ConflictError = require('../errors/ConflictError');
// 404
const NotFoundError = require('../errors/NotFoundError');

module.exports.getUsers = (req, res, next) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  User.find({})
    .then((users) => res.send({ users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) return res.send({ user });
      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new InaccurateDataError('Передан некорректный id'));
      } else {
        next(error);
      }
    });
};

// app.use('*', () => {
//   throw new NotFoundError('Пользователь с таким id не найден');
// });

module.exports.addUser = (req, res, next) => {
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
      if (error.name === 'ValidationError') {
        next(new InaccurateDataError('Переданы некорректные данные при регистрации пользователя'));
      } else if (error.code === 11000) {
        next(new ConflictError('Пользователь с таким электронным адресом уже зарегистрирован'));
      } else {
        next(error);
      }
    });
};

module.exports.editUserData = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
    .then((user) => {
      if (user) return res.send({ user });
      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new InaccurateDataError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(error);
      }
    });
};

module.exports.editUserAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .then((user) => {
      if (user) return res.send({ user });
      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new InaccurateDataError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(error);
      }
    });
};

module.exports.getUserData = (req, res, next) => {
  User.findById(req.user.userId)
    .then((user) => {
      if (user) return res.send({ user });
      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new InaccurateDataError('Передан некорректный id'));
      } else {
        next(error);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        SECRET_SIGNING_KEY,
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};
