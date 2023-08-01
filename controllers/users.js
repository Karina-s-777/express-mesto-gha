const NoError = 200;
const CastError = 400;
const DocumentNotFoundError = 404;
const InternalServerError = 500;

// Создаем контроллеры - функции, ответственные за взаимодействие с моделью.
// То есть это функции, которые выполняют создание, чтение, обновление или удаление документа.
// Файл контроллеров описывает логику обработки запросов
const { default: mongoose } = require('mongoose');
const User = require('../models/user');

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

//   // роверяем, равен ли наш id === 24 символа
//   if (req.params.userId.length === 24) {
//     // если id корректный, то
//     User.findById(req.params.userId)
//       .then((user) => {
//         // если юзер не найден
//         if (!user) {
//           res.status(404).send({ message: 'Пользователь не найден' });
//           // обрываем функцию
//           return;
//         }
//         res.send(user);
//       })
//       .catch(() => {
//         // если id не найден в базе, то ошибка 404
//         res.status(404).send({ message: 'Пользователь не найден' });
//       });
//   } else {
//     // если id некорректный
//     res.status(400).send({ message: 'Неверный id' });
//   }

// Создание документов
module.exports.addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  // // получим из объекта запроса имя, описание пользователя и аватар
  User.create({ name, about, avatar })
  // Метод create может быть промисом — ему можно добавить обработчики then и catch.
  // Так обычно и делают, чтобы вернуть клиенту данные или ошибку
    .then((user) => {
      res.status(NoError).send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(CastError).send({ message: error.message });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports.editUserData = (req, res) => {
  const { name, about } = req.body;
  // если id существет, поле не пустое, то мы используем метод findByIdAndUpdate -
  // ищем данные и обновляем
  if (req.user._id) {
    // runValidators - обновление валидаторов
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
    // если юзер найден - мы его возвращаем
      .then((user) => res.send(user))
    // если юзер не найден - мы проверяем "почему?"
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(CastError).send({ message: error.message });
        } else {
          res.status(DocumentNotFoundError).send({ message: 'Пользователь не найден' });
        }
      });
  } else {
    res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
  }
};

module.exports.editUserAvatar = (req, res) => {
  // если id существет, поле не пустое, то мы используем метод findByIdAndUpdate -
  // ищем данные и обновляем
  if (req.user._id) {
    // runValidators - обновление валидаторов
    User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    // если юзер найден - мы его возвращаем
      .then((user) => res.send(user))
    // если юзер не найден - мы проверяем "почему?"
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(CastError).send({ message: error.message });
        } else {
          res.status(DocumentNotFoundError).send({ message: 'Пользователь не найден' });
        }
      });
  } else {
    res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
  }
};
