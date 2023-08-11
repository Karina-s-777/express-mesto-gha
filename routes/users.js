// Создаем роуты для пользователей и карточек
// файл маршрутов определяет, при каком запросе применять логику  обработки запросов
const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { URL_REGEX } = require('../utils/constants');
const {
  getUsers, getUserById, editUserData, editUserAvatar, getUserData,
} = require('../controllers/users');

// //  возвращает всех пользователей
// router.get('/', getUsers);
// //  возвращает пользователя по _id
// router.get('/:userId', getUserById);
// // //  создаёт пользователя
// // router.post('/', addUser);
// // получения информации о пользователе
// router.get('/me', getUserData);
// // обновляет профиль
// router.patch('/me', editUserData);
// // обновляет аватар
// router.patch('/me/avatar', editUserAvatar);

//  возвращает всех пользователей
router.get('/', getUsers);
//  возвращает пользователя по _id
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), getUserById);
// //  создаёт пользователя
// router.post('/', addUser);
// получения информации о пользователе
router.get('/me', getUserData);
// обновляет профиль
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), editUserData);
// обновляет аватар
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi
      .string()
      .pattern(URL_REGEX),
  }),
}), editUserAvatar);

module.exports = router;
