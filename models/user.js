// есть ресурсы — в проекте Mesto это пользователи и карточки.
// Каждый из ресурсов должен соответствовать задуманной структуре:
// например, у пользователя должно быть имя и информация о себе.
// Зададим схему для пользователя через Mongoose:
// const isEmail = require('validator/lib/isEmail');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // импортируем bcryptnpm
const validator = require('validator');
const {
  Unauthorized,
} = require('../status/status');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // добовляем сообщения об ошибке валидации
    minlength: [2, 'Минимальное количество символов - 2'],
    maxlength: [30, 'Максимальное количество символов - 30'],
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: [2, 'Минимальное количество символов - 2'],
    maxlength: [30, 'Максимальное количество символов - 30'],
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: { // опишем свойство validate
      validator(url) { // Регулярное выражение URL, начинающееся с HTTP или HTTPS
        return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(url);
      },
      message: 'Неправильный url', // когда validator вернёт false, будет использовано это сообщение
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    // Email должен быть уникальным, поскольку пользователь проходит аутентификацию по электронной
    // почте. Для этого мы добавляем свойство unique со значением true
    unique: true,
    validate: {
      validator(email) { // Регулярное выражение email
        validator.isEmail(email);
      },
      message: 'Введите верный E-mail',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    // {select: false} - поле вообще не будет запрашиваться из базы данных.
    // Таким образом, вы не можете получить к нему доступ внутри метода,
    // если только вы специально не переопределите этот параметр.
    // Так по умолчанию хеш пароля пользователя не будет возвращаться из базы.
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
          }
          return user; // теперь user доступен
        });
    });
};

// создаём модель и экспортируем её.
// Мы передали методу mongoose.model два аргумента: имя модели и схему,
// которая описывает будущие документы
module.exports = mongoose.model('user', userSchema);
