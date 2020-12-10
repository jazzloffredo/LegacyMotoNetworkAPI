var _ = require("lodash");

var NeoUser = (module.exports = function (_node) {
  var uuid = _node.properties["uuid"];
  var firstName = _node.properties["firstName"];
  var lastName = _node.properties["lastName"];
  var email = _node.properties["email"];
  var password = _node.properties["password"];
  var gender = _node.properties["gender"];
  var dob = _node.properties["dob"];
  var city = _node.properties["city"];
  var stateAbbrev = _node.properties["stateAbbrev"];
  var registrationDate = _node.properties["registrationDate"];
  var lastLogin = _node.properties["lastLogin"];

  _.extend(this, {
    uuid: uuid,
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    gender: gender,
    dob: dob,
    city: city,
    stateAbbrev: stateAbbrev,
    registrationDate: registrationDate,
    lastLogin: lastLogin,
  });
});
