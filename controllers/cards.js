const {
  Created,
  // CastError,
  // DocumentNotFoundError,
  // InternalServerError,
} = require('../status/status');
const Card = require('../models/card');
const InaccurateDataError = require('../errors/InaccurateDataError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

// создаем карточку
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  // создаем  карточку и внутрь кладем id
  Card.create({ name, link, owner: req.user._id })
  // когда карточка создалась, берем её
    .then((card) => res.status(Created).send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new InaccurateDataError('Переданы некорректные данные при создании карточки'));
      } else {
        next(error);
      }
    });
};
module.exports.deleteCard = (req, res, next) => {
  const { id: cardId } = req.params;
  const { userId } = req.user;
  Card
    .findById({
      _id: cardId,
    })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Данные по указанному id не найдены');
      }
      const { owner: cardOwnerId } = card;
      if (cardOwnerId.valueOf() !== userId) {
        throw new ForbiddenError('Нет прав доступа');
      }
      return Card.findByIdAndDelete(cardId);
    })
    .then((deletedCard) => {
      if (!deletedCard) {
        throw new NotFoundError('Карточка уже была удалена');
      }
      res.send({ data: deletedCard });
    })
    .catch(next);
};

// module.exports.deleteCard = (req, res, next) => {
//   Card.findByIdAndRemove(req.params.cardId)
//     .then((card) => {
//       res.send(card);
//     })
//     .catch((error) => {
//       if (error.name === InaccurateDataError) {
//         next(new InaccurateDataError('Переданы некорректные данные при создании карточки'));
//       } else if (error.name === 'NotFoundError') {
//         next(new NotFoundError('Пользователь не найден'));
//       } else {
//         next(error);
//       }
//     });
// };

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .then((card) => {
      if (card) return res.send({ data: card });
      throw new NotFoundError('Карточка с указанным id не найдена');
    })
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new InaccurateDataError('Переданы некорректные данные при добавлении лайка карточке'));
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
      if (card) return res.send({ data: card });

      throw new NotFoundError('Данные по указанному id не найдены');
    })
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new InaccurateDataError('Переданы некорректные данные при снятии лайка карточки'));
      } else {
        next(error);
      }
    });
};
