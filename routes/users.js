var express = require("express");
var router = express.Router();

var _ = require("lodash");

var dbUtils = require("../utils/dbUtils");

var UserModel = require("../models/user");

router.get("/:userID", function (req, res, next) {
  var uuid = req.params.userID;

  UserModel.getUser(dbUtils.getSession(), uuid)
    .catch((error) => next(error))
    .then((response) => {
      res.status(200).json(response);
    });
});

router.patch("/:userID", function (req, res, next) {
  var uuid = req.params.userID;
  var details = req.body;

  UserModel.updateUser(dbUtils.getSession(), uuid, details)
    .catch((error) => next(error))
    .then(() => {
      res.status(204).send();
    });
});

router.delete("/:userID", function (req, res, next) {});

router.delete("/:userID/motorcycle", function (req, res, next) {});

module.exports = router;
