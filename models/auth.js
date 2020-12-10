"use strict";

var _ = require("lodash");
var bcrypt = require("bcrypt");
var uuid = require("uuid");

var NeoUser = require("./neo4j/neo-user");

var register = async function (
  session,
  firstName,
  lastName,
  email,
  password,
  gender,
  dob,
  city,
  stateAbbrev
) {
  return session
    .readTransaction((txc) =>
      txc.run("MATCH (user:User {email: $email}) RETURN user", { email: email })
    )
    .catch((error) => {
      throw { transaction: error, status: 503 };
    })
    .then(async (result) => {
      if (!_.isEmpty(result.records)) {
        throw { email: "Email already exists.", status: 401 };
      } else {
        var hashedPassword = await bcrypt.hash(password, 10);
        return session
          .writeTransaction((txc) =>
            txc.run(
              "CREATE (user:User {uuid: $uuid, firstName: $firstName, lastName: $lastName, email: $email, password: $password, gender: $gender, dob: $dob, city: $city, stateAbbrev: $stateAbbrev, registrationDate: datetime(), lastLogin: datetime()}) RETURN user",
              {
                uuid: uuid.v4(),
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                gender: gender,
                dob: dob,
                city: city,
                stateAbbrev: stateAbbrev,
              }
            )
          )
          .then((result) => {
            if (result.summary.counters.updates().nodesCreated == 0) {
              throw {
                user_creation: "User could not be created.",
                status: 503,
              };
            } else {
              return new NeoUser(result.records[0].get("user"));
            }
          });
      }
    })
    .finally(() => {
      session.close();
    });
};

var login = async function (session, email, password) {
  return session
    .readTransaction((txc) =>
      txc.run("MATCH (user:User {email: $email}) RETURN user", { email: email })
    )
    .catch((error) => {
      throw { transaction: error, status: 503 };
    })
    .then(async (result) => {
      if (_.isEmpty(result.records)) {
        throw { email: "Email does not exist.", status: 401 };
      } else {
        var dbUser = _.get(result.records[0].get("user"), "properties");
        var isValidPassword = await bcrypt.compare(password, dbUser.password);
        if (!isValidPassword) {
          throw { password: "Password is incorrect.", status: 401 };
        }
        return {
          uuid: dbUser.uuid,
          email: dbUser.email,
        };
      }
    })
    .finally(() => {
      session.close();
    });
};

module.exports = {
  register,
  login,
};
