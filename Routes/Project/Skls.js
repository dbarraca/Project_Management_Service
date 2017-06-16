var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Skls';

module.exports = router;

router.get('/', function(req, res) {
   var vld = req.validator;
   console.log("trying to get skill");

});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   console.log("trying to post skill");
});
