const Amplify = require('aws-amplify');
const PubSub = require('@aws-amplify/pubsub').default;
const Auth = require('@aws-amplify/auth').default;
const AWSIoTProvider = require('@aws-amplify/pubsub/lib/Providers').AWSIoTProvider;

const events = require('events');
const util = require('util');

function PubSubSocket(configs) {
  this.pubsub = PubSub;
  this.configs = configs;
}
PubSubSocket.prototype = {
  subscribe: function(topic) {
    this.pubsub.subscribe(topic).subscribe({
      next: function (data) {
        that.emit('message', [topic, data])
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
  },
  connect: function() {
    Amplify.addPluggable(new AWSIoTProvider({
      aws_pubsub_region: this.configs.awsRegion,
      aws_pubsub_endpoint: this.configs.pubSubEndpoint,
    }));
    var _this = this;
    Auth.currentCredentials()
      .then((info) => {
        let cognitoIdentityId = info._identityId;
        let url = _this.configs.principalPolicy;
        let body = {
          gateway: _this.configs.gatewayEui,
          user: _this.configs.username,
          principal: cognitoIdentityId
        }
        _this.attachGw(url, body, (info) => {
          if(info.status === "OK") {
            that.emit('connect', true);
          } else {
            that.emit('connect', false);
          }
        })
      })
      .catch(err => {
        console.log(err);
        that.emit('connect', false);
      });
  },
  attachGw: function(url, body, cb) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'charset': 'UTF-8'
    });
    fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
      .then(response => {
        if (!response.ok) {
          console.log(response);
        } else
          return response.json();
      })
      .then((responseJson) => {
        if (typeof cb === 'function')
          cb(responseJson);
      })
      .catch((err) => {
        console.log(err);
        if (typeof cb === 'function')
          cb(null);
      });
  },
}
util.inherits(PubSubSocket, events.EventEmitter);

var ServerPubSubIO = {
  connect: function(configs, callback) {
    configs.provider = configs.provider || "smarthome";
    configs.awsRegion = configs.awsRegion || "southeast";
    configs.pubSubEndpoint = configs.pubSubEndpoint || "wss://iot.amazonaws.com/mqtt";
    configs.principalPolicy = configs.principalPolicy || "https://.amazonaws.com/dev/attachPrincipalPolicy";
    configs.username = configs.username || "root";

    let thingName = 'thingShadow1';
    if (configs.provider && configs.gatewayEui)
      thingName = `${configs.provider}-gw-${configs.gatewayEui}`;

    var client = new PubSubSocket(configs);
    client.connect();

    client.on('reconnect', () => {
      console.log('reconnect');
    });

    client.on('error', (err) => {
      console.log('iot client error', err);
    });

    client.on('connect', (value) => {
      console.log('connected', value);
      this.topicPrefix = `${configs.provider}/${configs.gatewayEui}`;

      gwEvents.forEach(function(eventName) {
        let topic = `${configs.provider}/${configs.gatewayEui}/${eventName}`;
        client.subscribe(topic);
      });
      client.subscribe(`$aws/things/${thingName}/shadow/update`);
      callback(value);
    })

    let thingShadowTopic = `$aws/things/${thingName}/shadow/update`;
    client.on('message', (topic, data) => {
      if( data instanceof Buffer ||
        typeof data === 'string') {
        data = JSON.parse(data);
      }
      if(thingShadowTopic == topic) {
        for(eventName in data.state.desired) {
          if(data.state.desired.hasOwnProperty(eventName)) {
            client.emit(eventName, data.state.desired[eventName]);
          }
        }
      }
      else {
        client.emit(topic.split('/')[2], data);
      }
    });

    client.on('action', function(data) {
      client.publish(`${configs.provider}/${configs.gatewayEui}/action`, JSON.stringify(data));
    }.bind(this));

    client.on('command', function(data) {
      client.publish(`${configs.provider}/${configs.gatewayEui}/command`, JSON.stringify(data));
    }.bind(this));

    client.on('servermessage', function(data) {
      client.publish(`${configs.provider}/${configs.gatewayEui}/command`, JSON.stringify(data));
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