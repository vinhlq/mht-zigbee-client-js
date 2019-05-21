const PubSub = require('@aws-amplify/pubsub').default;
const events = require('events');
const util = require('util');

function PubSubSocket(pubsub) {
  this.pubsub = pubsub;
  this.emit('connect', this.pubsub);
}
util.inherits(PubSubSocket, events.EventEmitter);

PubSubSocket.prototype = {
  subscribe: function(topic) {
    this.pubsub.subscribe(topic).subscribe({
      next: function (data) {
        that.emit('message', {topic: topic, data: data.value})
      },
      error: function (error) {
        that.emit('error', error);
      },
      close: function() {
        that.emit('close');
      }
    });
  },
  publish: function(topic, data) {
    this.pubsub.publish(topic, data);
  }
}

var ServerPubSubIO = {
  connect: function(options) {
    let clientId = `chat-user-${Math.floor((Math.random() * 1000000) + 1)}`;
    let provider = options.provider || process.env.AWS_IOT_PROVIDER
    options.gatewayEui = options.gatewayEui || clientId;

    var thingName = 'thingShadow1';
    /* if (configs.provider && configs.gatewayEui)
       thingName = `${configs.provider}-gw-${configs.gatewayEui}`;*/
    var _shadowPrefix = `$aws/things/${thingName}/shadow`;

    var client = new PubSubSocket(PubSub);

    client.on('reconnect', () => {
      console.log('reconnect');
    });

    client.on('error', (err) => {
      console.log('iot client error', err);
    });

    client.on('connect', (connack) => {
      console.log('connected', connack);
      gwEvents.forEach(function(eventName) {
        let topic = `${provider}/${options.gatewayEui}/${eventName}`;
        client.subscribe(topic);
      });
      client.subscribe(`$aws/things/${thingName}/shadow/update`);
    })

    let thingShadowTopic = `$aws/things/${thingName}/shadow/update`;
    client.on('message', message => {
      var data = message.data;
      if (typeof data === 'string') {
        data = JSON.parse(message.data);
      }
      if (message.topic.indexOf(_shadowPrefix) > -1) {
        if (data.state.desired) {
          var events = Object.keys(data.state.desired);
          events.map(eventName => {
            client.emit(eventName, data.state.desired[eventName]);
          });
        }
      } else {
        client.emit(message.topic.split('/')[2], data);
      }
    });

    client.on('action', function(data) {
      client.publish(`${provider}/${options.gatewayEui}/action`, JSON.stringify(data));
    }.bind(this));

    client.on('command', function(data) {
      client.publish(`${provider}/${options.gatewayEui}/command`, JSON.stringify(data));
    }.bind(this));

    client.on('servermessage', function(data) {
      client.publish(`${provider}/${options.gatewayEui}/command`, JSON.stringify(data));
    }.bind(this));

    // must return
    return client;
  }.bind(this),
}

const ServerActions = require('./ServerActions');
ServerActionsPubSub = ServerActions({'pubsub': ServerPubSubIO});
module.exports = {
  name: 'pubsub',
  Actions: ServerActionsPubSub.Actions,
  RegisterIO: ServerActionsPubSub.RegisterIO,
  UnregisterIO: ServerActionsPubSub.UnregisterIO
}