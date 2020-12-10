var _ = require("lodash");

var NeoPost = (module.exports = function (_node) {
  var message = _node.properties['message'];
  var timestamp = _node.properties['timestamp'];

  _.extend(this, {
    id: _node.properties["id"],
    message: message,
    timestamp: timestamp,
  });
});