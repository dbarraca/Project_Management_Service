var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

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
      req.cnn.chkQry('select * from Skill where id = ?',
       [req.query.sklId], handler);
   }
   else if (req.query.name) {
      req.cnn.chkQry('select * from Skill where name = ?',
       [req.query.name], handler);
   }
   else {
      req.cnn.chkQry('select * from Skill',
       [], handler);
   }
});

module.exports = router;
