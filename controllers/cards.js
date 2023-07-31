const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  // используем методы mongo find и т.д.
  // Пустой объект метода ({}) вернет все объекты, которые мы писали в базе
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
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
        .then((data) => res.status(201).send(data))
        .catch(() => {
          // если id не найден в базе, то ошибка 404
          res.status(404).send({ message: 'Карточка не найдена' });
        });
    })
    .catch((error) => {
      // если id не найден в базе, то ошибка 404
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: error.message });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  if (req.params.cardId.length === 24) {
    // если id корректный, то
    Card.findByIdAndRemove(req.params.cardId)
      .then((card) => {
        // если карточка не найдена
        if (!card) {
          res.status(404).send({ message: 'Карточка не найдена' });
          // обрываем функцию
          return;
        }
        res.send({ message: 'Карточка успешно удалена' });
      })
      .catch(() => {
        // если id не найден в базе, то ошибка 404
        res.status(404).send({ message: 'Карточка не найдена' });
      });
  } else {
    // если id некорректный
    res.status(400).send({ message: 'Неверный id' });
  }
};

module.exports.likeCard = (req, res) => {
  if (req.params.cardId.length === 24) {
    // если id корректный, то
    Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    // подтягиваем два свойства
      .populate(['owner', 'likes'])
      .then((card) => {
        // если карточка не найдена
        if (!card) {
          res.status(404).send({ message: 'Карточка не найдена' });
          // обрываем функцию
          return;
        }
        res.send(card);
      })
      .catch(() => {
        // если id не найден в базе, то ошибка 404
        res.status(404).send({ message: 'Карточка не найдена' });
      });
  } else {
    // если id некорректный
    res.status(400).send({ message: 'Неверный id' });
  }
};

module.exports.dislikeCard = (req, res) => {
  if (req.params.cardId.length === 24) {
    // если id корректный, то
    Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    // подтягиваем два свойства
      .populate(['owner', 'likes'])
      .then((card) => {
        // если карточка не найдена
        if (!card) {
          res.status(404).send({ message: 'Карточка не найдена' });
          // обрываем функцию
          return;
        }
        res.send(card);
      })
      .catch(() => {
        // если id не найден в базе, то ошибка 404
        res.status(404).send({ message: 'Карточка не найдена' });
      });
  } else {
    // если id некорректный
    res.status(400).send({ message: 'Неверный id' });
  }
};
