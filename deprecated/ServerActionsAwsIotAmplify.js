// const PubSub = require('@aws-amplify/pubsub').default;
const PubSub = require('aws-amplify').PubSub;

function defaultError(error) {
  console.error(error);
}

function defaultClose() {
  console.error('closed');
}

const ServerActions = {
  // Bind all actions to socket callback
  connect: function(address, opts, callback) {
    PubSub.subscribe('devices').subscribe({
      next: function(message) {
        this.dispatch(Constants.DEVICE_LIST_UPDATED, message);
      },
      error: defaultError,
      close: defaultClose
    })
  },

  gatewayPermitJoiningZB3: function(deviceEui, installCode, delayMs) {
    _socket.emit('action', {type:"permitjoinZB3", deviceEui: deviceEui, installCode: installCode, delayMs: delayMs});
    PubSub.publish('action', {type:"permitjoinZB3", deviceEui: deviceEui, installCode: installCode, delayMs: delayMs})
  },
};

module.exports = ServerActions;