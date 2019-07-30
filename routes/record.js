var express = require('express');
var router = express.Router();
const Controller = require('../constrollers/record_ctrl.js');

router.get('/', Controller.index);
router.get('/:id', Controller.show);
// router.get('/daily/:id/:date', Controller.dailyShow);
router.post('/', Controller.create);

// router.delete('/:id', (req,res) =>{
//   const id = parseInt(req.params.id, 10);
//   if(!id){
//     return res.status(400).json({error:'Incorrect id'});
//   }
//   const userIdx = users.findIndex(user => user.id === id);
//   if (userIdx === -1) {
//     return res.status(404).json({error: 'Unknown user'});
//   }

//   users.splice(userIdx, 1);
//   return res.status(204).json({message:'Success'}); 
// })

//


module.exports = router;
