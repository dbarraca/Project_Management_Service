var Express = require('express');
var CnnPool = require('../CnnPool.js');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});

router.baseURL = '/Ssns';

router.get('/', function(req, res) {
   var body = [], ssn;

   if (req.validator.check(req.session && req.session.isAdmin(), 
    Tags.noPermission)) {
      for (var cookie in ssnUtil.sessions) {
         ssn = ssnUtil.sessions[cookie];
         body.push({cookie: cookie, usrId: ssn.id, loginTime: ssn.loginTime});
      }
      res.status(200).json(body);
   }

   req.cnn.release();
});

router.post('/:random', function(req, res) {
   res.status(404).end();
});

router.post('/', function(req, res) {
   var cookie;
   var cnn = req.cnn;
 
   cnn.chkQry('select * from User where email = ?', [req.body.email],
   function(err, result) {
      if (req.validator.check(result.length && result[0].password ===
       req.body.password, Tags.badLogin)) {
         cookie = ssnUtil.makeSession(result[0], res);
         res.location(router.baseURL + '/' + cookie).status(200).end();
      }

      cnn.release();
   });
});

router.delete('/:cookie', function(req, res) {
   if (req.validator
    .check(req.session && req.session.isAdmin() || req.params.cookie === 
    req.cookies[ssnUtil.cookieName] && ssnUtil.sessions && 
    ssnUtil.sessions[req.params.cookie] && 
    Object.keys(ssnUtil.sessions).indexOf(req.params.cookie) >= 0,
    Tags.noPermission)) {
      ssnUtil.deleteSession(req.params.cookie);
      res.status(200).end();
   }

   req.cnn.release();
});

router.get('/:cookie', function(req, res, next) {
   var cookie = req.params.cookie;
   var vld = req.validator;

   if (vld.chain(ssnUtil.sessions && ssnUtil.sessions[cookie] && 
    ssnUtil.sessions[cookie].id && (Object.keys(ssnUtil.sessions)
    .indexOf(cookie) >= 0), Tags.notFound)
    .check(ssnUtil.sessions && ssnUtil.sessions[cookie] && 
    ssnUtil.sessions[cookie].id && req.session && (req.session.isAdmin() || 
    parseInt(req.session.id) === parseInt(ssnUtil.sessions[cookie].id)), 
    Tags.noPermission)) {

      res.json({cookie: cookie, usrId: ssnUtil.sessions[cookie].id, 
       loginTime: ssnUtil.sessions[cookie].loginTime});
      res.status(200).end();
   }

   req.cnn.release();
});

module.exports = router;
