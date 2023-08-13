const { HTTP_STATUS_CREATED, HTTP_STATUS_OK } = require('http2').constants;
const { default: mongoose } = require('mongoose');
const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getCards = (req, res, next) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.status(HTTP_STATUS_OK).send(cards);
    })
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
        .then((data) => res.status(HTTP_STATUS_CREATED).send(data))
        .catch(() => {
          // если id не найден в базе, то ошибка 404
          next(new NotFoundError('Карточка не найдена'));
        });
    })
    .catch((error) => {
      // если id не найден в базе, то ошибка 404
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else {
        next(error);
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
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Неверный id'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карточка не найдена'));
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
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Неверный id'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карточка не найдена'));
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
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Неверный id'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карточка не найдена'));
      } else {
        next(error);
      }
    });
};
