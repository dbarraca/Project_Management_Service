var Express = require('express');
var CnnPool = require('../CnnPool.js');
var Tags = require('../Validator.js').Tags;
var mysql = require('mysql');
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Msgs';

router.get('/:msgId', function(req, res) {
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      req.cnn.chkQry('select * from Message where id = ?', 
       [req.params.msgId], cb);
   },
   function(msgs, fields, cb) {
      if (vld.chain(msgs.length, Tags.notFound)
       .check(msgs.length && req.session && req.params.msgId, 
       Tags.noPermission, null, cb)) {
         req.cnn.chkQry('select * from Message left join Person on '
          + 'Message.prsId = Person.id where Message.id = ?', 
          + parseInt(req.params.msgId), cb);
      }
   },
   function(result, fields, cb) {
      if (vld.chain(req.session, Tags.noLogin, null)
       .check(result && result[0], Tags.notFount,null, cb)) { 
         res.json(result[0]);
      }
      res.status(200).end();
      cb();
   }],
   function() {
      req.cnn.release();
   });
});

module.exports = router;

