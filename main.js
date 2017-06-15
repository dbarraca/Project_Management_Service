var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var async = require('async');
var Session = require('./Routes/Session.js');
var CnnPool = require('./Routes/CnnPool.js');
var Validator = require('./Routes/Validator.js');
var Tags = require('./Routes/Validator.js').Tags;

var app = express();
//app.use(function(req, res, next) {console.log("Hello"); next();});
// Static paths to be served like index.html and all client side js
app.use(express.static(path.join(__dirname, 'public')));

// Parse all request bodies using JSON
app.use(bodyParser.json());

// Attach cookies to req as req.cookies.<cookieName>
app.use(cookieParser());

// Set up Session on req if available
app.use(Session.router);

// Check general login.  If OK, add Validator to |req| and continue processing,
// otherwise respond immediately with 401 and noLogin error tag.
app.use(function(req, res, next) {
   console.log(req.method + " " + req.path);
   if (req.session || (req.method === 'POST' && (req.path === '/Usrs' ||
    req.path === '/Ssns'))) {
      req.validator = new Validator(req, res);
      next();
   }
   else
      res.status(401).end();
});

// Add DB connection, with smart chkQry method, to |req|
app.use(CnnPool.router);

// Load all subroutes

app.use('/Usrs', require('./Routes/Account/Usrs.js'));
app.use('/Ssns', require('./Routes/Account/Ssns.js'));
app.use('/Prjs', require('./Routes/Project/Prjs.js'));
app.use('/Skls', require('./Routes/Project/Skls.js'));

// Special debugging route for /DB DELETE.  Clears all table contents,
//resets all auto_increment keys to start at 1, and reinserts one admin user.
app.delete('/DB', function(req, res) {
   if (req.validator.check(req.session && req.session.isAdmin(),
    Tags.noPermission)) {
      // Callbacks to clear tables
      var cbs = ["User", "Project", "Participation", "Skill", "ProjectSkills"].map(function(tblName) {
         return function(cb) {
            req.cnn.query("delete from " + tblName, cb);
         };
      });

      // Callbacks to reset increment bases
      cbs = cbs.concat(["User", "Project", "Participation", "Skill", "ProjectSkills"].map(function(tblName) {
         return function(cb) {
            req.cnn.query("alter table " + tblName + " auto_increment = 1", cb);
         };
      }));

      // Callback to reinsert admin user
      cbs.push(function(cb) {
         req.cnn.query('INSERT INTO User (firstName, lastName, email,' +
             ' password, phoneNum, role) VALUES ' +
             '("Joe", "Admin", "adm@11.com", "password", "1111111111", 1);', cb);
      });

      // Callback to clear sessions, release connection and return result
      cbs.push(function(callback){
         for (var session in Session.sessions)
            delete Session.sessions[session];
         callback();
      });
   }

   async.series(cbs, function(err) {
      req.cnn.release();
      if (err)
         res.status(400).json(err);
      else
         res.status(200).end();
   });
});

// Handler of last resort.  Print a stacktrace to console and send a 500 response.
app.use(function(req, res, next) {
   res.status(500).end();
   req.cnn.release();
});

var argBeforePort;

process.argv.forEach(function (val, index, array) {
   if (val === "-p")
      argBeforePort = index;
});

app.listen(process.argv[argBeforePort + 1], function () {
   console.log('App Listening on port ' + process.argv[argBeforePort + 1]);
});
