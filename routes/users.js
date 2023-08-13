// Создаем роуты для пользователей и карточек
// файл маршрутов определяет, при каком запросе применять логику  обработки запросов
const router = require('express').Router();
const {
  getUsers, getUserById, addUser, editUserData, editUserAvatar,
} = require('../controllers/users');

//  возвращает всех пользователей
router.get('/', getUsers);
//  возвращает пользователя по _id
router.get('/:userId', getUserById);
//  создаёт пользователя
router.post('/', addUser);
// обновляет профиль
router.patch('/me', editUserData);
// обновляет аватар
router.patch('/me/avatar', editUserAvatar);

module.exports = router;
