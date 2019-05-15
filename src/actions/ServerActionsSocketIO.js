const ServerActions = require('./ServerActions');
let name = "socket-io";
module.exports = {
  name: name,
  Actions: ServerActions.Actions({name: require('socket.io-client')}),
  RegisterIO: ServerActions.RegisterIO,
  UnregisterIO: ServerActions.UnregisterIO
}