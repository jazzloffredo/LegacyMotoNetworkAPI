var _ = require("lodash");

var Group = (module.exports = function (_node) {
  var name = _node.properties['name'];
  var creationDate = _node.properties['creationDate'];

  _.extend(this, {
    id: _node.properties["id"],
    name: name,
    creationDate: creationDate,
  });
});