var express = require('express');
var router = express.Router();
const authMiddleware = require('../middlewares/auth');

/* GET users listing. */
router.get('/', authMiddleware.requireLogin, function(req, res, next) {
  res.render('profile')
});

module.exports = router;
