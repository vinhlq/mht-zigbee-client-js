const ServerActions = require('./ServerActions');
ServerActionsSocketIO = ServerActions({'socket-io': require('socket.io-client')});
module.exports = {
  name: 'socket-io',
  Actions: ServerActionsSocketIO.Actions,
  RegisterIO: ServerActionsSocketIO.RegisterIO,
  UnregisterIO: ServerActionsSocketIO.UnregisterIO
}