var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Prss';

router.get('/', function(req, res) {
   var email = req.session && req.session.isAdmin() && req.query.email ||
    !req.session.isAdmin() && req.session.email;

   var handler = function(err, prsArr) {
      res.json(prsArr);
      req.cnn.release();
   };

   if (!req.session.isAdmin() && req.query.email && 
    !req.session.email.includes(req.query.email)) {
      req.cnn.chkQry('select id, email from Person where email = ?', [''],
      handler);
   }
   else if (email) {
      req.cnn.chkQry('select id, email from Person where email like ?', 
       [(email + "%")], handler);
   }
   else if(req.session.isAdmin()) {
      req.cnn.chkQry('select id, email from Person', handler);
   }
});

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   if (admin && !body.password)
      body.password = "*";

   body.whenRegistered = new Date();

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ["email", "lastName", "password", "role"], cb)
       && vld.chain(body.email.length !== 0, Tags.missingField, "email")
       .chain(body.lastName.length !== 0, Tags.missingField, "lastName")
       .chain(body.password.length !== 0, Tags.missingField, "password")
       .chain(body.role === 0 || admin, Tags.noPermission)
       .chain(body.termsAccepted || admin, Tags.noTerms)
       .check(body.role >= 0, Tags.badValue, ["role"], cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },
   function(existingPrss, fields, cb) {
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         if((!body.termsAccepted || body.termsAccepted === false) && admin) {
             body.termsAccepted = null;
         }
         else {
            body.termsAccepted = new Date();
         } 
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   function(result, fields, cb) {
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});


router.get('/:id', function(req, res) {
   var vld = req.validator;
   if (vld.chain(req.session && req.session.id && req.session.isAdmin() || 
    (req.params.id && parseInt(req.params.id) > 0), Tags.noLogin)
    .checkPrsOK(req.params.id)) {
      req.cnn.query('select email, id, firstName, lastName, whenRegistered,'
       + ' role, termsAccepted  from Person where id = ?', [req.params.id],
       function(err, prsArr) {

          if (vld.chain(prsArr.length, Tags.notFound)
           .check(req.session && req.session.id && req.session.isAdmin() 
           || (prsArr.length && parseInt(prsArr[0].id) === 
           parseInt(req.params.id) && parseInt(req.session.id) === 
           parseInt(req.params.id)), Tags.noLogin)) {
             res.json(prsArr);
          }
          req.cnn.release();
       });
   }
   else {
      req.cnn.release();
   }
});

router.put('/:id', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session.isAdmin();
   var cnn = req.cnn;

   if (!body.hasOwnProperty("id")) {
      async.waterfall([
      function(cb) {
         if (vld.checkPrsOK(req.params.id, cb) && vld.hasOnlyFields(body,
          ["firstName", "lastName", "password", "oldPassword", "role"], cb) &&
          vld.chain(!body.role || body.role === 0 || admin && body.role === 1, 
          Tags.badValue, ["role"])
          .chain(!body.oldPassword || body.password && body.password.length, 
          Tags.badValue, ["password"])
          .check(!body.password || body.oldPassword || admin, Tags.noOldPwd, 
          null, cb)) {
            cnn.chkQry("Select * from Person where id = ? ", 
             [req.params.id], cb); 
         }
      },
      function(qRes, fields, cb) {
         if (vld.check(qRes.length, Tags.notFound, null, cb) && 
          vld.check(admin || !body.password || body.oldPassword === 
          qRes[0].password, Tags.oldPwdMismatch, null, cb)) {
            delete body.oldPassword;
            cnn.chkQry("update Person set ? where id = ?", 
             [body, req.params.id], cb)
         }
      },
      function(updRes, fields, cb) {
              res.status(200).end();
                   cb();
      }],
      function() {
              cnn.release();
      });
   }
   else {
      res.status(500).end();
      cnn.release();
   }
});

router.delete('/:id', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   async.waterfall([
   function(cb) {
      cnn.chkQry('SELECT * from Person where id = ?', [req.params.id], cb);
   },
   function(result, fields, cb) {
      if (vld.chain(result && result.length > 0, Tags.notFound).checkAdmin(cb))
         cnn.chkQry('DELETE from Person where id = ?', [req.params.id], cb);
   },
   function(result, err, cb) {
      if (!err)
         res.status(200).end();
      cb();
   }],
   function() {
        cnn.release();
  });

})

module.exports = router;
