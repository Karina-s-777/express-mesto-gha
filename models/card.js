const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    // добовляем сообщения об ошибке валидации
    required: [true, 'Заполните поле'],
    minlength: [2, 'Минимальное количество символов - 2'],
    maxlength: [30, 'Максимальное количество символов - 30'],
  },
  // ссылка на модель автора карточки, тип ObjectId, обязательное поле
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true],
    // Настраиваем связи через ref. Чтобы сделать это на уровне схемы,
    // полю следует установить специальный тип — mongoose.Schema.Types.ObjectId и свойство ref.
    // В это свойство записывают имя модели, на которую мы ссылаемся:
    ref: 'user',
  },
  link: {
    type: String,
    required: [true, 'Заполните поле'],
    validate: { // опишем свойство validate
      validator(url) { // Регулярное выражение URL, начинающееся с HTTP или HTTPS
        return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(url);
      },
      message: 'Неправильный url', // когда validator вернёт false, будет использовано это сообщение
    },
  },
  // Список лайкнувших пост пол-ей, массив ObjectId, по умолчанию — пустой массив (поле default);
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }],
  //  createsAt - дата создания, тип Date, значение по умолчанию Date.now
  createsAt: {
    type: Date,
    default: Date.now,
  },
  // отключить атрибут «__v» в определениях схемы через versionKey
}, { versionKey: false });

// создаём модель и экспортируем её.
// Мы передали методу mongoose.model два аргумента: имя модели и схему,
// которая описывает будущие документы
module.exports = mongoose.model('card', cardSchema);
