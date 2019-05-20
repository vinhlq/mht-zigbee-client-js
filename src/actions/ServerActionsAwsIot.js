var DeviceSdk = require('aws-iot-device-sdk');

var gwEvents = [
  'heartbeat',
  'devices',
  'rules',
  'deviceleft',
  'devicejoined',
  'deviceupdate',
  'otaevents',
  'serversettings',
  'gatewaysettings',
  'otaavailablefiles',
  'executed',
  'serverlog',
  'gatewaylog',
  'traffictestlog',
  'traffictestresults',
  'networkSecurityLevel',
  'serverlogstream',
  'installcodecollection'
];

var ServerAwsIotIO = {
  connect: function(options, callback) {
    let clientId = `chat-user-${Math.floor((Math.random() * 1000000) + 1)}`;
    let provider = options.provider || process.env.AWS_IOT_PROVIDER
    let thingName = 'thingShadow1';
    options.gatewayEui = options.gatewayEui || clientId;

    var client = DeviceSdk.device({
      region: options.region || process.env.AWS_REGION,

      // AWS IoT Host endpoint
      host: options.host || process.env.AWS_IOT_HOST,

      // clientId created earlier
      clientId: options.clientId || clientId,

      // Connect via secure WebSocket
      // protocol: 'wss',
      protocol: 'wss',

      // Set the maximum reconnect time to 500ms; this is a browser application
      // so we don't want to leave the user waiting too long for reconnection after
      // re-connecting to the network/re-opening their laptop/etc...
      baseReconnectTimeMs: 250,
      maximumReconnectTimeMs: 5000,

      // Enable console debugging information
      debug: options.debug || true,

      // AWS access key ID, secret key and session token must be
      // initialized with empty strings
      accessKeyId: options.accessKeyId,
      secretKey: options.secretAccessKey,
      sessionToken: options.sessionToken,

      // keyPath: path.join(__dirname, Constants.AWS_IOT_PRIVKEY_FILELOCATION),
      // certPath: path.join(__dirname, Constants.AWS_IOT_CERT_FILELOCATION),
      // caPath: path.join(__dirname, Constants.AWS_IOT_ROOT_CA_FILELOCATION),

      // Let redux handle subscriptions
      autoResubscribe: false,
    });

    client.on('reconnect', () => {
      console.log('reconnect');
    });

    client.on('offline', () => {
      console.log('offline');
    });
    

    client.on('error', (err) => {
      console.log('iot client error', err);
    });

    client.on('connect', (connack) => {
      console.log('connected', connack);
      this.topicPrefix = `${provider}/${options.gatewayEui}`;

      gwEvents.forEach(function(eventName) {
        let topic = `${provider}/${options.gatewayEui}/${eventName}`;
        client.subscribe(topic);
      });
      client.subscribe(`$aws/things/${thingName}/shadow/update`);

      // setInterval(function(){
      //   client.publish(`${this.topicPrefix}/action`, JSON.stringify({action: 'no action'}));
      // }.bind(this), 1000);

      // client.on('publish', function(topic) {
      //   console.log('publish', topic);
      // });
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
ServerActionsAwsIot = ServerActions({'awsiot': ServerAwsIotIO});
module.exports = {
  name: 'awsiot',
  Actions: ServerActionsAwsIot.Actions,
  RegisterIO: ServerActionsAwsIot.RegisterIO,
  UnregisterIO: ServerActionsAwsIot.UnregisterIO
}