var express = require('express');
var router = express.Router();

const Controller = require('../constrollers/tour_ctrl.js');
		
router.get('/', Controller.index);
router.get('/:cnt', Controller.index_paging);

router.get('/area/:name/:cnt',Controller.area_show);
router.get('/content/:id',Controller.content_show);
router.get('/title/:name',Controller.title_search);

module.exports = router;
