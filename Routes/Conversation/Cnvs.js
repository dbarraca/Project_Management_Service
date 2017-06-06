var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Cnvs';

router.get('/', function(req, res) {
   var vld = req.validator;

   var handler = function(err, cnvs) {
      if (vld.chain(cnvs, Tags.notFound)
       .check(req.session, Tags.noLogin) && !err) {

         cnvs.forEach(function(cnv) {
            if(cnv.lastMessage)
               cnv.lastMessage = cnv.lastMessage.getTime();
         });

         res.json(cnvs);
      }
      req.cnn.release();
   }

   if (req.query.owner) {
      req.cnn.chkQry('select * from Conversation where ownerId = ?', 
       [req.query.owner.toString()], handler);
   }
   else {
      req.cnn.chkQry('select * from Conversation', null, handler);
   }
});

router.get('/:cnvId', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;

   var handler = function(err, cnvs) {
      if (vld.chain(cnvs && cnvs[0], Tags.notFound)
       .check(req.session, Tags.noLogin) && !err) {
         if (cnvs[0].lastMessage)
            cnvs[0].lastMessage = cnvs[0].lastMessage.getTime();
         res.json(cnvs[0]);
      }
      req.cnn.release();
   }

   if(vld.check(req.session, Tags.noLogin))
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], handler);
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.check(body.title && body.title.length > 0, Tags.missingField, 
       ["title"], cb))
         cnn.chkQry('select * from Conversation where title = ?', 
          [body.title],cb);
   },
   function(existingCnv, fields, cb) {
      if (vld.chain(body.title && body.title.length > 0, Tags.missingField, 
       ["title"])
       .chain(!existingCnv.length, Tags.dupTitle, ["title"])
       .check(body.title && parseInt(body.title.length) < 81, Tags.badValue, 
       ["title"], cb))
         cnn.chkQry("insert into Conversation (title, ownerId, lastMessage) values (?, ?, null)", [body.title, req.session.id], cb);
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.put('/:cnvId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var cnvId = req.params.cnvId;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(cnvs[0].ownerId, cb))
         cnn.chkQry('select * from Conversation where id <> ? && title = ?',
          [cnvId, body.title], cb);
   },
   function(sameTtl, fields, cb) {
      if (vld.check(!sameTtl.length, Tags.dupTitle, null, cb))
         cnn.chkQry("update Conversation set title = ? where id = ?",
          [body.title, cnvId], cb);
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      req.cnn.release();
   });
});

router.delete('/:cnvId', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;
   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs && cnvs.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(cnvs[0].ownerId, cb))
         cnn.chkQry('delete from Conversation where id = ?', [cnvId], cb);
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

router.get('/:cnvId/Msgs', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;
   var query = 'select Message.id, whenMade, email, content from Conversation'
    + ' c join Message on cnvId = c.id join Person p on prsId = p.id where '
    + 'c.id = ?'
   var params = [cnvId];

   if (req.query.dateTime) {
      query += ' and  (UNIX_TIMESTAMP(whenMade)*1000) <= ?';
      params.push(req.query.dateTime);
   }

   query += ' order by whenMade, Message.id';

   if (req.query.num) {
      query += ' limit ?';
      params.push(parseInt(req.query.num));
   }

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb)) {
         cnn.chkQry(query, params, cb);
      }
   },
   function(msgs, fields, cb) {
      msgs.forEach(function(msg) {
         msg.whenMade = msg.whenMade.getTime();
      });
      res.json(msgs);
      cb();
   }],
   function(err){
      cnn.release();
   });
});

router.post('/:cnvId/Msgs', function(req, res){
   var vld = req.validator;
   var cnn = req.cnn;
   var cnvId = req.params.cnvId;
   var now;

   async.waterfall([
   function(cb) {
      if(vld.check(req.body.content && req.body.content.length > 0
       , Tags.missingField, ["content"], cb))
         cnn.chkQry('select * from Conversation where id = ?', 
          [parseInt(cnvId)], cb);
   },
   function(cnvs, fields, cb) {
      if (vld.chain(req.body.content && req.body.content.length
       < 5001, Tags.badValue, ["content"])
       .check(cnvs.length, Tags.notFound, null, cb))
         cnn.chkQry('insert into Message set ?',
          {cnvId: cnvId, prsId: req.session.id,
          whenMade: now = new Date(), content: req.body.content}, cb);
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cnn.chkQry("update Conversation set lastMessage = ? where id = ?",
       [now, parseInt(cnvId)], cb);
   }],
   function(err) {
      cnn.release();
   });
});

module.exports = router;