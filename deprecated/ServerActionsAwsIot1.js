var DeviceSdk = require('aws-iot-device-sdk');

const ServerActions = {
  client: null,
  // Bind all actions to socket callback
  connect: function(options, callback) {
    let clientId = `chat-user-${Math.floor((Math.random() * 1000000) + 1)}`;
    let provider = options.provider || process.env.AWS_IOT_PROVIDER
    options.gatewayEui = options.gatewayEui || clientId;

    client = DeviceSdk.device({
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
      debug: true,

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

      let topic = `${provider}/${options.gatewayEui}/action`;
      client.subscribe(topic);

      setInterval(function(){
        client.publish(`${this.topicPrefix}/action`, JSON.stringify({action: 'no action'}));
      }.bind(this), 1000);

      client.on('publish', function(topic) {
        console.log('publish', topic);
      });

      client.on('message', (topic, data) => {
        console.log('message', topic, data);
      });
    })

    this.client = client;
  }.bind(this),

  gatewayPermitJoiningZB3: function(deviceEui, installCode, delayMs) {
    this.client.publish('action', {type:"permitjoinZB3", deviceEui: deviceEui, installCode: installCode, delayMs: delayMs});
  }.bind(this),
}

module.exports = ServerActions;