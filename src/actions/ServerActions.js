var Constants = require('../Constants');
// const io = require('socket.io-client');

var ios = {

};

var sockets = {

}

function emit(iokey, event, data) {
  if (sockets.hasOwnProperty(iokey)) {
    var _socket = sockets[iokey];
    _socket.emit(event, data);
  }
}

function emitEvent(iokey, event, data) {
  if(iokey) {
    emit(iokey, event, data)
  }
  else {
    for (var iokey in sockets) {
      emit(iokey, event, data)
    }
  }
}

var ServerActions = {
  // Bind all actions to socket callback
  connect: function(iokey, options, callback) {
    if (ios.hasOwnProperty(iokey)) {
      var _socket = ios[iokey].connect(options);
      sockets[iokey] = _socket;

      _socket.on('devices', function(message) {
        message.io = iokey;
        this.dispatch(Constants.DEVICE_LIST_UPDATED, message);
      }.bind(this));

      _socket.on('rules', function(message) {
        message.io = iokey;
        this.dispatch(Constants.RULES_LIST_UPDATED, message);
      }.bind(this));

      _socket.on('devicejoined', function(message) {
        message.io = iokey;
        this.dispatch(Constants.DEVICE_JOINED, message);
      }.bind(this));

      _socket.on('deviceleft', function(message) {
        message.io = iokey;
        this.dispatch(Constants.DEVICE_LEFT, message);
      }.bind(this));

      _socket.on('deviceupdate', function(message) {
        message.io = iokey;
        this.dispatch(Constants.DEVICE_UPDATE, message);
      }.bind(this));

      _socket.on('otaevents', function(message) {
        message.io = iokey;
        this.dispatch(Constants.OTA_EVENTS, message);
      }.bind(this));

      _socket.on('serversettings', function(message) {
        message.io = iokey;
        this.dispatch(Constants.SERVER_SETTINGS, message);
      }.bind(this));

      _socket.on('gatewaysettings', function(message) {
        message.io = iokey;
        this.dispatch(Constants.GATEWAY_SETTINGS, message);
      }.bind(this));

      _socket.on('otaavailablefiles', function(message) {
        message.io = iokey;
        this.dispatch(Constants.OTA_AVAILABLE_FILES, message);
      }.bind(this));

      _socket.on('serverlog', function(message) {
        message.io = iokey;
        this.dispatch(Constants.SERVER_LOG, message);
      }.bind(this));

      _socket.on('gatewaylog', function(message) {
        message.io = iokey;
        this.dispatch(Constants.GATEWAY_LOG, message);
      }.bind(this));

      _socket.on('traffictestlog', function(message) {
        message.io = iokey;
        this.dispatch(Constants.TRAFFIC_TEST_LOG, message);
      }.bind(this));

      _socket.on('traffictestresults', function(message) {
        message.io = iokey;
        this.dispatch(Constants.TRAFFIC_TEST_RESULTS, message);
      }.bind(this));

      _socket.on('heartbeat', function(message) {
        message.io = iokey;
        this.dispatch(Constants.HEARTBEAT, message);
      }.bind(this));

      _socket.on('networkSecurityLevel', function(message) {
        message.io = iokey;
        this.dispatch(Constants.NETWORK_SECURITY_LEVEL, message)
      }.bind(this));

      _socket.on('serverlogstream', function(message) {
        message.io = iokey;
        this.dispatch(Constants.SERVER_LOG_STUnregisterIOREAM, message);
      }.bind(this));

      _socket.on('gatewaylogstream', function(message) {
        message.io = iokey;
        this.dispatch(Constants.GATEWAY_LOG_STREAM, message);
      }.bind(this));

      _socket.on('installcodecollection', function(message) {
        message.io = iokey;
        this.dispatch(Constants.INSTALL_COLLECTION, message);
      }.bind(this));

      _socket.on('connect', function(data) {
        callback(data);
      }.bind(this));

      if(Constants.CONSOLE_LOG_ENABLED) {
        _socket.on('executed', function(executed) {
          console.log('Gateway Executed: ' + JSON.stringify(executed));
        }.bind(this));

        _socket.on('connect_error', function() {
          console.log('connect_error');
        }.bind(this));

        _socket.on('connect_timeout', function() {
          console.log('connect_timeout');
        }.bind(this));

        _socket.on('reconnect_attempt', function() {
          console.log('reconnect_attempt');
        }.bind(this));

        _socket.on('reconnect_failed', function() {
          console.log('Reconnection failed');
        }.bind(this));
      }
    }
  },

  gatewayPermitJoiningZB3: function(iokey, deviceEui, installCode, delayMs) {
    emitEvent(iokey, 'action', {type:"permitjoinZB3", deviceEui: deviceEui, installCode: installCode, delayMs: delayMs});
  },

  gatewayPermitJoiningZB3OpenNetworkOnly: function(iokey, delayMs) {
    emitEvent(iokey, 'action', {type:"permitjoinZB3OpenNetworkOnly", delayMs: delayMs});
  },

  gatewayPermitJoiningZB3InstallCodeOnly: function(iokey, deviceEui, installCode, delayMs) {
    emitEvent(iokey, 'action', {type:"permitjoinZB3InstallCodeOnly", deviceEui: deviceEui, installCode: installCode, delayMs: delayMs});
  },

  gatewayPermitJoiningOffZB3: function(iokey) {
    emitEvent(iokey, 'action', {type:"permitjoinoffZB3"});
  },

  createRule: function(iokey, inDeviceInfo, outDeviceInfo) {
    emitEvent(iokey, 'action', {type:"addrelay", inDeviceInfo: inDeviceInfo, outDeviceInfo: outDeviceInfo});
  },

  createCloudRule: function(iokey, inDeviceInfo, outDeviceInfo) {
    emitEvent(iokey, 'action', {type:"addcloudrule", inDeviceInfo: inDeviceInfo,
                                                  outDeviceInfo: outDeviceInfo});
  },

  deleteRule: function(iokey, inDeviceInfo, outDeviceInfo) {
    emitEvent(iokey, 'action', {type:"deleterelay", inDeviceInfo: inDeviceInfo,
                                                  outDeviceInfo: outDeviceInfo});
  },

  deleteCloudRule: function(iokey, inDeviceInfo, outDeviceInfo) {
    emitEvent(iokey, 'action', {type:"deletecloudrule", inDeviceInfo: inDeviceInfo,
                                                      outDeviceInfo: outDeviceInfo});
  },

  clearCloudRules: function(iokey) {
    emitEvent(iokey, 'action', {type:"clearcloudrules"});
  },

  clearRules: function(iokey) {
    emitEvent(iokey, 'action', {type:"clearrelays"});
  },

  requestInstallCodeFromServer: function(eui64) {
    emitEvent(iokey, 'action', {type:"installcoderequest", eui64: eui64});
  },

  syncNodesOnRuleCreation: function(iokey, inputNodeWithAttribute, outputNode) {
    emitEvent(iokey, 'action', {type:"syncnodesonrulecreation", inputNodeWithAttribute: inputNodeWithAttribute,
                                                              outputNode: outputNode});
  },

  createGroup: function(iokey, groupMessage) {
    var itemList = [];
    var group = {};
    Object.keys(groupMessage).forEach(function(key) {
      if (groupMessage[key] === true) {
        itemList.push(key);
      }
    });

    group.devices = itemList;
    emitEvent(iokey, 'servermessage', {type:"addgroup", group: group});
  },

  removeGroup: function(groupName) {
    emitEvent('servermessage', {type:"removegroup", groupName: groupName});
  },

  removeGroups: function(groupName) {
    emitEvent('servermessage', {type:"removegroups"});
  },

  createGroupRule: function(iokey, from, toList) {
    toList.forEach(function(toIndex) {
      ServerActions.createRule(iokey, from, toIndex)
    });
  },

  simpleReformZB3Network: function(iokey) {
    emitEvent(iokey, 'action', {type:"simpleReformZB3Network"});
  },

  reformZB3Network: function(radioChannel, networkPanId, radioTxPower) {
    emitEvent(iokey, 'action', {type:"reformZB3network", radioChannel: radioChannel, networkPanId: networkPanId, radioTxPower: radioTxPower});
  },

  removeNode: function(iokey, node) {
    var nodeId = node.data.nodeId;
    var deviceEui = node.data.deviceEndpoint.eui64;
    var endpoint = node.data.deviceEndpoint.endpoint;

    emitEvent(iokey, 'action', {type:"removedevice", nodeId: nodeId, deviceEui: deviceEui, endpoint: endpoint});
  },

  setDeviceToggle: function(iokey, node) {
    if (node.data.deviceType === 'group') {
      var deviceTableIndex = node.data.itemList;
      emitEvent(iokey, 'action', {type:"lighttoggle", deviceTableIndex: deviceTableIndex});
    } else {
      var deviceEndpoint = node.data.deviceEndpoint;
      emitEvent(iokey, 'action', {type:"lighttoggle", deviceEndpoint: deviceEndpoint});
    }
  },

  setDeviceOff: function(iokey, node) {
    if (node.data.deviceType === 'group') {
      var deviceTableIndex = node.data.itemList;
      emitEvent(iokey, 'action', {type:"lightoff", deviceTableIndex: deviceTableIndex});
    } else {
      var deviceEndpoint = node.data.deviceEndpoint;
      emitEvent(iokey, 'action', {type:"lightoff", deviceEndpoint: deviceEndpoint});
    }
  },

  setDeviceOn: function(iokey, node) {
    if (node.data.deviceType === 'group') {
      var deviceTableIndex = node.data.itemList;
      emitEvent(iokey, 'action', {type:"lighton", deviceTableIndex: deviceTableIndex});
    } else {
      var deviceEndpoint = node.data.deviceEndpoint;
      emitEvent(iokey, 'action', {type:"lighton", deviceEndpoint: deviceEndpoint});
    }
  },

  enterIdentify: function(iokey, node) {
    var deviceEndpoint = node.data.deviceEndpoint;
    emitEvent(iokey, 'action', {type:"enterIdentify", deviceEndpoint: deviceEndpoint});
  },

  exitIdentify: function(iokey, node) {
    var deviceEndpoint = node.data.deviceEndpoint;
    emitEvent(iokey, 'action', {type:"exitIdentify", deviceEndpoint: deviceEndpoint});
  },

  setLightLevel: function(iokey, level, node) {
    var hex = parseInt(level, 10).toString(16).toUpperCase();

    if (node.data.deviceType === 'group') {
      var deviceTableIndex = node.data.itemList;
      emitEvent(iokey, 'action', {type:"setlightlevel", deviceTableIndex: deviceTableIndex, level: level});
    } else {
      var deviceEndpoint = node.data.deviceEndpoint;
      emitEvent(iokey, 'action', {type:"setlightlevel", deviceEndpoint: deviceEndpoint, level: level});
    }
  },

  setLightTemp: function(iokey, colorTemp, node) {
    if (node.data.deviceType === 'group') {
      var deviceTableIndex = node.data.itemList;
      emitEvent(iokey, 'action', {type:"setlightcolortemp", deviceTableIndex: deviceTableIndex, colorTemp: colorTemp});
    } else {
      var deviceEndpoint = node.data.deviceEndpoint;
      emitEvent(iokey, 'action', {type:"setlightcolortemp", deviceEndpoint: deviceEndpoint, colorTemp: colorTemp});
    }
  },

  setLightColor: function(iokey, hue, sat, node) {
    if (node.data.deviceType === 'group') {
      var deviceTableIndex = node.data.itemList;
      emitEvent(iokey, 'action', {type:"setlighthuesat", deviceTableIndex: deviceTableIndex, hue: hue, sat: sat});
    } else {
      var deviceEndpoint = node.data.deviceEndpoint;
      emitEvent(iokey, 'action', {type:"setlighthuesat", deviceEndpoint: deviceEndpoint, hue: hue, sat: sat});
    }
  },

  enableCliTerminal: function(iokey) {
    emitEvent(iokey, 'action', {type:"enableCliTerminal"});
  },

  disableCliTerminal: function(iokey) {
    emitEvent(iokey, 'action', {type:"disableCliTerminal"});
  },

  requestNodeAttribute: function(iokey, deviceEndpoint, attributeString) {
    emitEvent(iokey, 'action', {type:"requestattribute", deviceEndpoint: deviceEndpoint, attributeString: attributeString});
  },

  testNetwork: function(iokey, deviceTableIndex, periodMs, iterations, nodeId, deviceType) {
    emitEvent(iokey, 'action', {type:"starttraffictest", deviceTableIndex: deviceTableIndex, periodMs: periodMs, iterations: iterations, nodeId: nodeId, deviceType: deviceType});
  },

  gatewayUpgradePolicy: function(upgrade) {
    emitEvent(iokey, 'action', {type:"otasetupgrade", upgrade: upgrade});
  },

  gatewayNotify: function(iokey, otaitem, item) {
    var nodeId = item.data.nodeId;
    var manufacturerId = otaitem.manufacturerId;
    var imageTypeId = otaitem.imageTypeId;
    var firmwareVersion = otaitem.firmwareVersion;

    emitEvent(iokey, 'action', {type:"otaupgradenotify", nodeId: nodeId, manufacturerId: manufacturerId, imageTypeId: imageTypeId, firmwareVersion: firmwareVersion});
  },

  getGatewayState: function(iokey) {
    emitEvent(iokey, 'action', {type:"requestgatewaystate"});
  },

  setGatewayAttribute: function(iokey, attribute, value) {
    emitEvent(iokey, 'action', {type:"setgatewayattribute", attribute: attribute, value: value});
  },

  sendCommandsScriptName: function(iokey, fileName) {
    emitEvent(iokey, 'action', {type:"sendCommandsScriptName", fileName: fileName});
  },

  getOtaFiles: function(iokey) {
    emitEvent(iokey, 'servermessage', {type:"getotafiles"});
  },

  otaClearDirectory: function(iokey) {
    emitEvent(iokey, 'servermessage', {type:"otaclear"});
  },

  otaCopyFile: function(iokey, otaitem) {
    var otaFilename = otaitem.filename;
    emitEvent(iokey, 'servermessage', {type:"otacopyimagetostage", otaFilename: otaFilename});
  },

  getWebserverState: function(iokey) {
    emitEvent(iokey, 'servermessage', {type:"getwebserverinfo"});
  },

  setWebserverAttribute: function(attribute, value) {
    emitEvent(iokey, 'servermessage', {type:"seiokeytwebserverattribute", attribute: attribute, value: value});
  },

  requestTestLog: function(iokey) {
    emitEvent(iokey, 'servermessage', {type:"loadtraffictestlog"});
  },

  requestServerLog: function(iokey) {
    emitEvent(iokey, 'servermessage', {type:"loadserverlog"});
  },

  requestGatewayLog: function(iokey) {
    emitEvent(iokey, 'servermessage', {type:"loadgatewaylog"});
  },

  sendCommands: function(iokey, commands) {
    emitEvent(iokey, 'command', commands);
  },
};

module.exports = {
  Actions: function(s) {
    ios = s;
    return ServerActions;
  },
  RegisterIO: function(iokey, io) {
    if (!ios.hasOwnProperty(iokey)) {
      ios[iokey] = io;
    }
  },
  UnregisterIO: function(iokey, io) {
    if (ios.hasOwnProperty(iokey)) {
      delete ios[iokey];
      delete sockets[iokey];
    }
  }
};
