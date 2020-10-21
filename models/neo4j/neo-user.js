var _ = require("lodash");

var User = (module.exports = function (_node) {
  var email = _node.properties["email"];
  var firstName = _node.properties['firstName'];
  var lastName = _node.properties['lastName'];
  var dob = _node.properties['dob'];

  _.extend(this, {
    id: _node.properties["id"],
    email: email,
    firstName: firstName,
    lastName: lastName,
    dob: dob,
  });
});
