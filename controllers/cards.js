const Created = 201;
const CastError = 400;
const DocumentNotFoundError = 404;
const InternalServerError = 500;

const { default: mongoose } = require('mongoose');
const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch(() => res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' }));
};

// создаем карточку
module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  // создаем  карточку и внутрь кладем id
  Card.create({ name, link, owner: req.user._id })
  // когда карточка создалась, берем её
    .then((card) => {
      // по созданной карточке берем её id и делаем поиск
      Card.findById(card._id)
      // ссылаемся на документ в других коллекциях. Работает с уже созданными документами
      // положили тут объект пользователя
        .populate('owner')
        // берем данные и возвращаем в ответе
        .then((data) => res.status(Created).send(data))
        .catch(() => {
          // если id не найден в базе, то ошибка 404
          res.status(DocumentNotFoundError).send({ message: 'Карточка не найдена' });
        });
    })
    .catch((error) => {
      // если id не найден в базе, то ошибка 404
      if (error.name === 'ValidationError') {
        res.status(CastError).send({ message: error.message });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Неверный id' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка не найдена' });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .populate(['owner', 'likes'])
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Неверный id' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка не найдена' });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .populate(['owner', 'likes'])
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Неверный id' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка не найдена' });
      } else {
        res.status(InternalServerError).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};
