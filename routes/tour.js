var express = require('express');
var router = express.Router();

const Controller = require('../constrollers/tour_ctrl.js');
		
router.get('/', Controller.index);
router.get('/:cnt', Controller.index_paging);

// router.get('/areas/',Controller.area_show); // ToDo
router.get('/area/:name/:page',Controller.area_search);
router.get('/content/:id',Controller.content_show);
router.get('/title/:name/:page',Controller.title_search);

module.exports = router;
