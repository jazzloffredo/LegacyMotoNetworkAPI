"use strict";

var _ = require("lodash");

var NeoUser = require("./neo4j/neo-user");

var getUser = async function (session, uuid) {
  return session
    .readTransaction((txc) =>
      txc.run("MATCH (user:User {uuid: $uuid}) RETURN user", { uuid: uuid })
    )
    .catch((error) => {
      console.error("ERROR: Get user query failed.", error);
    })
    .then((results) => {
      if (_.isEmpty(results.records)) {
        // User does not exist.
        throw { uuid: "UUID does not exist.", status: 401 };
      } else if (results.records.length > 1) {
        // Should not get here. Email is unique within Neo4j DB. Add check just to be safe.
        throw { UUID: "UUID mapped to multiple users.", status: 409 };
      } else {
        // Found the user.
        return new NeoUser(results.records[0].get("user"));
      }
    })
    .finally(() => {
      session.close();
    });
};

var updateUser = function (session, uuid, details) {
  return session
    .writeTransaction((txc) =>
      txc.run(
        "MATCH (user:User {uuid: $uuid}) SET user.firstName = $details.firstName SET user.lastName = $details.lastName SET user.email = $details.email SET user.gender = $details.gender SET user.dob = $details.dob SET user.city = $details.city SET user.statAbbrev = $details.stateAbbrev",
        { uuid: uuid, details: details }
      )
    )
    .catch((error) => {
      throw { transaction: error, status: 503 };
    })
    .finally(() => {
      session.close();
    });
};

var deleteUser = function (session, uuid) {
  session
    .readTransaction((txc) =>
      txc.run("MATCH (user:User {uuid: $uuid}) RETURN user", { uuid: uuid })
    )
    .catch((error) => {
      throw { transaction: error, status: 503 };
    })
    .then((result) => {
      /* Ensure we're only going to match to a single user before writing a delete transaction. */
      if (_.isEmpty(result.records)) {
        /* User does not exist. */
        throw { email: "Email address does not exist.", status: 401 };
      } else if (result.records.length > 1) {
        /* Should not get here. Email is unique within Neo4j DB. Add check just to be safe. */
        throw { email: "Email address mapped to multiple users.", status: 409 };
      } else {
        /* Only a single user to delete. */
        /* Match user then get subgraph of all relevant connected nodes. */
        transaction =
          "MATCH (user:User {email: $email}) " +
          "OPTIONAL MATCH (user)-[:HAS_PROFILE_PICTURE]->(avatar:Avatar) " +
          "OPTIONAL MATCH (user)-[:HAS_NOTIFICATION]->(notification:Notification) " +
          "OPTIONAL MATCH (user)-[:HAS_MOTORCYCLE]->(motorcycle:Motorcycle) " +
          "OPTIONAL MATCH (user)-[:LIVES_NEAR]->(location:Location) " +
          "OPTIONAL MATCH (user)<-[:IS_CREATED_BY]-(post:Post) " +
          "OPTIONAL MATCH (post)<-[:IS_REPLY_TO]-(post_comment:Comment) " +
          "OPTIONAL MATCH (user)<-[:IS_CREATED_BY]-(user_comment:Comment) " +
          "DETACH DELETE user, avatar, notification, motorcycle, location, post, post_comment, user_comment";
        session
          .writeTransaction((txc) => txc.run(transaction, { email: email }))
          .catch((error) => {
            throw { transaction: error, status: 503 };
          })
          .then((result) => {
            if (result.summary.counters.updates().nodesDeleted == 0) {
              throw {
                delete_user: "Attempt to delete user failed.",
                status: 409,
              };
            }
          });
      }
    })
    .finally(() => {
      session.close();
    });
};

var addUserMotorcycle = function (session, email, make, model, year) {
  /* Find the user by email. Create new motorcycle node. Create relationship between user and motorcycle. */
  transaction =
    "MATCH (user:User {email: $email}) " +
    "CREATE (motorcycle:Motorcycle {make: $make, model: $model, year: $year}) ";
  ("CREATE (user)-[:HAS_MOTORCYCLE]->(motorcycle)");
  session
    .writeTransaction((txc) =>
      txc.run(transaction, {
        email: email,
        make: make,
        model: model,
        year: year,
      })
    )
    .catch((error) => {
      throw { transaction: error, status: 503 };
    })
    .then((result) => {
      if (result.summary.counters.updates().nodesCreated == 0) {
        throw {
          add_motorcycle: "Attempt to add user motorcycle failed.",
          status: 409,
        };
      }
    })
    .finally(() => {
      session.close();
    });
};

var deleteUserMotorcycle = function (session, uuid, make, model, year) {
  transaction =
    "MATCH (user:User {uuid: $uuid})-[:HAS_MOTORCYCLE]->(motorcycle:Motorcycle {make: $make, model: $model, year: $year}) " +
    "DETACH DELETE motorcycle";
  session
    .writeTransaction((txc) =>
      txc.run(transaction, { uuid: uuid, make: make, model: model, year: year })
    )
    .catch((error) => {
      throw { transaction: error, status: 503 };
    })
    .then((result) => {
      if (result.summary.counters.updates().nodesDeleted == 0) {
        throw {
          delete_motorcycle: "Attempt to delete user motorcycle failed.",
          status: 409,
        };
      } else if (result.summary.counters.updates().nodesDeleted > 1) {
        throw {
          delete_motorcycle: "Multiple motorcycles were deleted for user.",
          status: 409,
        };
      }
    })
    .finally(() => {
      session.close();
    });
};

module.exports = {
  getUser,
  updateUser,
  deleteUser,
  addUserMotorcycle,
  deleteUserMotorcycle,
};
