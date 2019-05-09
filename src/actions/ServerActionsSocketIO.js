const ServerActions = require('./ServerActions');
Object.assign(ServerActions.Config, {io: require('socket.io-client')});
module.exports = ServerActions.Actions;