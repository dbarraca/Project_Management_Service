var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Skls';

router.get('/', function(req, res) {
   var vld = req.validator;

   var handler = function(err, skill) {
      if (vld.chain(skill, Tags.notFound)
       .check(req.session, Tags.noLogin) && !err) {
         res.json(skill);
      }
      req.cnn.release();
   }

   if (req.query.sklId) {
      req.cnn.chkQry('select name from Skill where id = ?',
       [req.query.sklId], handler);
   }
   else {
      req.cnn.chkQry('select name from Skill',
       [], handler);
   }
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   console.log("trying to post skill");
});

module.exports = router;