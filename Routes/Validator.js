// Create a validator that draws its session from |req|, and reports
// errors on |res|
var Validator = function(req, res) {
   this.errors = [];   // Array of error objects having tag and params
   this.session = req.session;
   this.res = res;
};

// List of errors, and their corresponding resource string tags
Validator.Tags = {
   noLogin: "noLogin",              // No active session/login
   noPermission: "noPermission",    // Login lacks permission.
   missingField: "missingField",    // Field missing from request. Params[0] is field name
   badValue: "badValue",            // Field has bad value.  Params[0] gives field name
   notFound: "notFound",            // Entity not present in DB
   badLogin: "badLogin",            // Email/password combination invalid
   dupEmail: "dupEmail",            // Email duplicates an existing email
   noTerms: "noTerms",              // Acceptance of terms is required.
   forbiddenField: "forbiddenField",// Cannot set un changable fields
   forbiddenRole: "forbiddenRole",  // Cannot set to this role
   noOldPwd: "noOldPwd",            // Change of password requires an old password
   dupTitle: "dupTitle",            // Title duplicates an existing Project title
   dupEnrollment: "dupEnrollment",  // Duplicate enrollment
   oldPwdMismatch: "oldPwdMismatch",
   queryFailed: "queryFailed"
};

// Check |test|.  If false, add an error with tag and possibly empty array
// of qualifying parameters, e.g. name of missing field if tag is
// Tags.missingField.
//
// Regardless, check if any errors have accumulated, and if so, close the
// response with a 400 and a list of accumulated errors, and throw
//  this validator as an error to |cb|, if present.  Thus,
// |check| may be used as an "anchor test" after other tests have run w/o
// immediately reacting to accumulated errors (e.g. checkFields and chain)
// and it may be relied upon to close a response with an appropriate error
// list and call an error handler (e.g. a waterfall default function),
// leaving the caller to cover the "good" case only.
Validator.prototype.check = function(test, tag, params, cb) {
   if (!test)
      this.errors.push({tag: tag, params: params});
   if (this.errors.length) {


      this.errors.forEach(function(err) {
         console.log("error " + err.tag);
      });

      if (this.res) {
         if ((this.errors[0].tag === Validator.Tags.noLogin)) {
            this.res.status(401).end();
         }
         else if (this.errors[0].tag === Validator.Tags.noPermission) {
            this.res.status(403).end();
         }
         else {
            console.log("testcheck");
            this.res.status(400).json(this.errors);
         }
         this.res = null;   // Preclude repeated closings
      }
      if (cb) {
         cb(this);
      }
   }
   return !this.errors.length;
};

// Somewhat like |check|, but designed to allow several chained checks
// in a row, finalized by a check call.
Validator.prototype.chain = function(test, tag, params) {
   if (!test) {
      this.errors.push({tag: tag, params: params});
   }
   return this;
};

Validator.prototype.checkAdmin = function(cb) {
   return this.check(this.session && this.session.isAdmin(),
    Validator.Tags.noPermission, null, cb);
};

// Validate that AU is the specified User or is an admin
Validator.prototype.checkUsrOK = function(UsrId, cb) {

   return this.check(this.session && UsrId &&
    (this.session.isAdmin() || parseInt(this.session.id) === parseInt(UsrId)),
    Validator.Tags.noPermission, null, cb);
};

// Check presence of truthy property in |obj| for all fields in fieldList
Validator.prototype.hasFields = function(obj, fieldList, cb) {
   var self = this;

   fieldList.forEach(function(name) {
      self.chain(obj.hasOwnProperty(name), Validator.Tags.missingField,
       [name]);
   });

   return this.check(true, null, null, cb);
};


// Check presence of truthy property in |obj| for all fields in fieldList and only those fields
Validator.prototype.hasOnlyFields = function(obj, fieldList, cb) {
   var self = this;
      Object.keys(obj).forEach(function(name) {
         self.chain(fieldList.indexOf(name.toString()) >= 0,
          Validator.Tags.forbiddenField, [name.toString()]);
      });

   return this.check(true, null, null, cb);
};

module.exports = Validator;
