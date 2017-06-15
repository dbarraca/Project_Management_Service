var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Prjs';

router.get('/', function(req, res) {
   var vld = req.validator;

   var handler = function(err, prjs) {
      if (vld.chain(prjs, Tags.notFound)
       .check(req.session, Tags.noLogin) && !err) {

         res.json(prjs);
      }
      req.cnn.release();
   }

   if (req.query.owner) {
      req.cnn.chkQry('select * from Project where ownerId = ?', 
       [req.query.owner.toString()], handler);
   }
   else {
      req.cnn.chkQry('select * from Project', null, handler);
   }
});

router.get('/:prjId', function(req, res) {
   var vld = req.validator;
   var prjId = req.params.prjId;
   var cnn = req.cnn;

   var handler = function(err, prjs) {
      if (vld.chain(prjs && prjs[0], Tags.notFound)
       .check(req.session, Tags.noLogin) && !err) {
         res.json(prjs[0]);
      }
      req.cnn.release();
   }

   if(vld.check(req.session, Tags.noLogin))
      cnn.chkQry('select * from Project where id = ?', [prjId], handler);
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   console.log("went to posting prj");

   async.waterfall([
   function(cb) {
      if (vld.check(body.title && body.title.length > 0, Tags.missingField, 
       ["title"], cb)) {
         console.log("has title: " + body.title);
         cnn.chkQry('select * from Project where title = ?', 
          [body.title],cb);
      }
   },
   function(existingPrj, fields, cb) {
    console.log("checking existing project");
      if (vld.chain(body.title && body.title.length > 0, Tags.missingField, 
       ["title"])
       .chain(!existingPrj.length, Tags.dupTitle, ["title"])
       .check(body.title && parseInt(body.title.length) < 81, Tags.badValue, 
       ["title"], cb)) {
         cnn.chkQry("insert into Project (title, ownerId, type, description, level) values (?, ?, ?, ?, ?)", 
          [body.title, req.session.id, body.type, body.description, body.level], cb);
         console.log("insert Project");
         console.log("body.title " + body.title);
         console.log("req.session.id " + req.session.id);
         console.log("body.level" + body.level);
      }
   },
   function(insRes, fields, cb) {
    console.log("setting location");
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.put('/:prjId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var prjId = req.params.prjId;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Project where id = ?', [prjId], cb);
   },
   function(prjs, fields, cb) {
      if (vld.check(prjs.length, Tags.notFound, null, cb) &&
       vld.checkUsrOK(prjs[0].ownerId, cb))
         cnn.chkQry('select * from Project where id <> ? && title = ?',
          [prjId, body.title], cb);
   },
   function(sameTtl, fields, cb) {
      if (vld.check(!sameTtl.length, Tags.dupTitle, null, cb))
         cnn.chkQry("update Project set title = ? where id = ?",
          [body.title, prjId], cb);
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      req.cnn.release();
   });
});

router.delete('/:prjId', function(req, res) {
   var vld = req.validator;
   var prjId = req.params.prjId;
   var cnn = req.cnn;
   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Project where id = ?', [prjId], cb);
   },
   function(prjs, fields, cb) {
      if (vld.check(prjs && prjs.length, Tags.notFound, null, cb) &&
       vld.checkUsrOK(prjs[0].ownerId, cb))
         cnn.chkQry('delete from Project where id = ?', [prjId], cb);
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

module.exports = router;