import * as mosca from 'mosca';
import { DeviceModel as Device } from './models/Device';
import crypto from 'crypto';
import { createReading } from './utils/elasticUtils';

const _db = require('./db');
const PORT = Number(process.env.PORT) || 9001;
const settings = {
  http: {
    port: PORT,
    bundle: true,
    static: './',
  },
};

const broker = new mosca.Server(settings);

broker.on('ready', () => {
  console.log('MQTT broker is up and running on port ' + PORT);
  broker.authenticate = authenticate;
  broker.authorizePublish = authorizePublish;
  broker.authorizeSubscribe = authorizeSubscribe;
});

broker.on('clientConnected', function (client: any) {
  // console.log("Client connected: ", client);
  console.log('Client connected.');
});

broker.on('published', function (packet, client: any) {
  let topic = packet.topic;
  if (packet.topic.split('/')[0] === '$SYS') {
    return;
  }
  console.log('Published');
  let payload = JSON.parse(packet.payload.toString());
  createReading(client.username, payload);
  //console.log(payload)
});

// Accepts the connection if the username and password are valid
var authenticate = function (client: any, username: any, password: any, callback: any) {
  console.log('Authenticated', username);
  // check auth for username and pass
  if (!username || !password) {
    callback('Credentials not valid', null);
    return;
  }
  let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  Device.findOne({ username: username, password: passwordHash }, { devices: 1, type: 1, _id: 0 })
    .then((document) => {
      if (!document) {
        throw 401;
      }
      client.username = username;
      client.devices = document.devices;
      client.type = document.type;
      callback(null, document.devices);
      console.log('Device authenticated.');
    })
    .catch((err) => {
      console.log('??????', err);
      callback('Credentials not valid', null);
      console.log('Not authorized.');
    });
};

// In this case the client authorized as alice can publish to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizePublish = function (client: any, topic: any, payload: any, callback: any) {
  console.log('Authorization for publish', client.username);
  if (client.username === topic.split('/')[1]) {
    callback(null, true);
  } else {
    callback('Not allowed to publish', null);
  }
};

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizeSubscribe = function (client: any, topic: any, callback: any) {
  console.log('Authorization for subscribe', client.username);

  let topicList = topic.split('/');
  let collection = topicList[0];
  let observer = topicList[1];

  switch (collection) {
    case 'users':
      // TODO: implement security
      console.log('Allowed to subscribe', client.devices, observer);
      callback(null, true);
      break;

    case 'devices':
      if (client.username === topicList[1] || client.devices.indexOf(observer) !== -1) {
        console.log('Allowed to subscribe', client.devices, observer);
        callback(null, true);
      } else {
        console.log('NOT allowed to subscribe', client.devices, observer);
        callback('Not allowed to subscribe', null);
      }
      break;

    case 'default':
      console.log('Not implemented');
      callback('Not allowed to subscribe', null);
  }
};
