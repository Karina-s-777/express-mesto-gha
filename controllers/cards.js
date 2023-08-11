const {
  Created,
  // CastError,
  // DocumentNotFoundError,
  // InternalServerError,
} = require('../status/status');
const Card = require('../models/card');
const InaccurateDataError = require('../errors/InaccurateDataError');
const NotFoundError = require('../errors/NotFoundError');

module.exports.getCards = (req, res, next) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch(next);
};

// создаем карточку
module.exports.createCard = (req, res, next) => {
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
          next(new NotFoundError('Карточка не найдена'));
        });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InaccurateDataError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail()
    .then((card) => {
      res.send(card);
    })
    .catch((error) => {
      if (error.name === InaccurateDataError) {
        next(new InaccurateDataError('Переданы некорректные данные при создании карточки'));
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.send(card);
    })
    .catch((error) => {
      if (error.name === InaccurateDataError) {
        next(new InaccurateDataError('Переданы некорректные данные при создании карточки'));
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.send(card);
    })
    .catch((error) => {
      if (error.name === InaccurateDataError) {
        next(new InaccurateDataError('Переданы некорректные данные при создании карточки'));
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        next(error);
      }
    });
};
