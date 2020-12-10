var express = require("express");
var router = express.Router();

var _ = require("lodash");

var dbUtils = require("../utils/dbUtils");

var AuthModel = require("../models/auth");

/* POST user registration */
router.post("/register", function (req, res, next) {
  var firstName = _.get(req.body, "firstName");
  var lastName = _.get(req.body, "lastName");
  var email = _.get(req.body, "email");
  var password = _.get(req.body, "password");
  var gender = _.get(req.body, "gender");
  var dob = _.get(req.body, "dob");
  var city = _.get(req.body, "city");
  var stateAbbrev = _.get(req.body, "stateAbbrev");

  if (!firstName) {
    throw {
      firstName: "First name field not included in request.",
      status: 400,
    };
  } else if (!lastName) {
    throw {
      lastName: "Last name field not included in request.",
      status: 400,
    };
  } else if (!email) {
    throw { email: "Email field not included in request.", status: 400 };
  } else if (!password) {
    throw { password: "Password field not included in request.", status: 400 };
  } else if (!gender) {
    throw { gender: "Gender field not included in request.", status: 400 };
  } else if (!dob) {
    throw { dob: "Date of birth field not included in request.", status: 400 };
  } else if (!city) {
    throw { city: "City field not included in request.", status: 400 };
  } else if (!stateAbbrev) {
    throw {
      stateAbbrev: "State abbreviation field not included in request.",
      status: 400,
    };
  }

  AuthModel.register(
    dbUtils.getSession(),
    firstName,
    lastName,
    email,
    password,
    gender,
    dob,
    city,
    stateAbbrev
  )
    .catch((error) => {
      next(error);
    })
    .then((user) => {
      res.status(201).json({
        uuid: _.get(user, "uuid"),
      });
    });
});

/* POST user login */
router.post("/login", function (req, res, next) {
  var email = _.get(req.body, "email");
  var password = _.get(req.body, "password");

  if (!email) {
    throw { email: "Email field not included in request.", status: 400 };
  }
  if (!password) {
    throw { password: "Password field not included in request.", status: 400 };
  }

  AuthModel.login(dbUtils.getSession(), email, password)
    .catch((error) => {
      next(error);
    })
    .then((response) => {
      req.session.uuid = response.uuid;
      req.session.isAuthenticated = true;
      res.status(200).json({
        uuid: response.uuid,
      });
    });
});

router.post("/logout", function (req, res) {
  req.session.destroy();
  res.status(200).send();
});

router.get("/session", function (req, res, next) {
  if (req.session.isAuthenticated === false || !req.session.uuid) {
    res.status(404).send();
  } else {
    res.status(200).json({
      uuid: req.session.uuid,
    });
  }
});

module.exports = router;
