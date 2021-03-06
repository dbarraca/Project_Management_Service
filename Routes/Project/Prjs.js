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
   };

   if (req.query.user && !req.query.skill) {
      req.cnn.chkQry('select pr.id, pr.ownerId, pr.title, pr.level,' +
       ' pr.type, pr.description from Participation p join Project pr on' +
       ' p.prjId=pr.id where p.usrId=?', [req.query.user], handler);
   }
   else if (!req.query.user && req.query.skill) {
      req.cnn.chkQry('select pr.id, pr.ownerId, pr.title, pr.level, pr.type,' +
       ' pr.description from Project pr join ProjectSkills ps on' +
       ' pr.id=ps.prjId where sklId=?', [req.query.skill], handler);
   }
   else if (req.query.user && req.query.skill) {
      req.cnn.chkQry('select pr.id, pr.ownerId, pr.title, pr.level, pr.type,' +
       ' pr.description from Participation p join Project pr on' +
       ' p.prjId=pr.id join ProjectSkills ps on ps.prjId=p.prjId where' +
       ' sklId=? AND p.usrId=?', [req.query.skill, req.query.user], handler);
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
   };

   if(vld.check(req.session, Tags.noLogin))
      cnn.chkQry('select * from Project where id = ?', [prjId], handler);
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

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
      if (vld.chain(body.title && body.title.length > 0, Tags.missingField,
       ["title"])
       .chain(!existingPrj.length, Tags.dupTitle, ["title"])
       .check(body.title && parseInt(body.title.length) < 81, Tags.badValue,
       ["title"], cb)) {
         cnn.chkQry("insert into Project (title, ownerId, type, description," +
          " level) values (?, ?, ?, ?, ?)", [body.title, req.session.id,
          body.type, body.description, body.level], cb);
      }
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cnn.chkQry("insert into Participation (usrId, prjId) values(?, ?)",
       [req.session.id, insRes.insertId], cb);
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

router.post('/:prjId/Skls', function(req, res) {

   var vld = req.validator;
   var prjId = req.params.prjId;
   var cnn = req.cnn;
   var body = req.body;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select id from Project where id = ?',
        [prjId],cb);
   },
   function(prj, fields, cb) {
       cnn.chkQry("insert into ProjectSkills (sklId, prjId) values (?, ?)",
        [body.sklId, prjId], cb);
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.get('/:prjId/Skls', function(req, res) {
   var vld = req.validator;
   var prjId = req.params.prjId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
     if(vld.check(req.session, Tags.noLoogin))
        cnn.chkQry('select * from Project where id = ?', [prjId], cb);
   },
   function(prjs, fields, cb) {
      if (vld.chain(prjs && prjs[0], Tags.notFound)
       .check(req.session, Tags.noLogin)) {
         cnn.chkQry('select * from ProjectSkills where prjId = ?', [prjId],
          cb);
      }
   },
   function(prjSkls, fields, cb) {
      res.json(prjSkls);
      cb();
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

router.get('/:prjId/Usrs', function(req, res) {
  var vld = req.validator;
  var prjId = req.params.prjId;
  var cnn = req.cnn;

  var handler = function(err, usrs) {
      if (vld.chain(usrs, Tags.notFound)
       .check(req.session, Tags.noLogin) && !err) {
         res.json(usrs);
      }
      req.cnn.release();
   };

   if(vld.check(req.session, Tags.noLogin))
   cnn.chkQry('select u.id, u.email, u.firstName, u.lastName, u.phoneNum' +
    ' from Participation p join User u on p.usrId=u.id where p.prjId = ?',
    [prjId], handler);
});

// needs error checking
router.post('/:prjId/Usrs', function(req, res) {
  var vld = req.validator;
  var prjId = req.params.prjId;
  var cnn = req.cnn;
  var body = req.body;

  async.waterfall([
   function(cb) {
      cnn.chkQry('select id from User where email = ?',
        [body.email],cb);
   },
   function(userId, fields, cb) {
      console.log(userId);
         cnn.chkQry("insert into Participation (usrId, prjId) values (?, ?)",
          [userId[0].id, prjId], cb);

   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.delete('/:prjId/Usrs/:usrId', function(req, res) {
  var vld = req.validator;
  var prjId = req.params.prjId;
  var usrId = req.params.usrId;
  var cnn = req.cnn;

  async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Participation where prjId = ?', [prjId], cb);
   },
   function(prjs, fields, cb) {
      if (vld.chain(prjs && prjs.length, Tags.notFound, null, cb))
         cnn.chkQry('delete from Participation where usrId = ? AND prjId=?',
          [usrId, prjId], cb);
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

module.exports = router;
