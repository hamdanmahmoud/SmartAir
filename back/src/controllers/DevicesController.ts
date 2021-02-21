import { DeviceModel as Device } from '../models/Device';
import {
  createReading as createElasticReading,
  retrieveReadings as retrieveElasticReadings,
} from '../utils/elasticUtils';
import { trimEndSlashes } from '../utils/reqUtils';
import { errHandler } from '../utils/errHandlingUtils';
import { redisClient } from '../redis';

let cachedDevices: any[] = [];

export function retrieveDevice(req: any, res: any) {
  // TODO: return a device that the user having this token has access to
  // TODO: handle parameters, also handle FIELDS!!!
  const query = { username: req.params.username };

  Device.findOne(query, { _id: 0, __v: 0, password: 0 })
    .then((document) => {
      if (!document) {
        throw 404;
      }
      let device = JSON.parse(JSON.stringify(document));
      var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
      device.href = fullUrl;

      redisClient.set(fullUrl, JSON.stringify(device), 'EX', 10, 'NX');

      res.status(200);
      res.send(device);
    })
    .catch((err) => errHandler(err, res));
}

export function retrieveDevices(req: any, res: any) {
  // TODO: handle parameters, first filter the params
  const query = req.query;

  // TODO: return all devices that the user having this token has access to
  Device.find(query, { _id: 0, __v: 0, password: 0 })
    .then((documents) => {
      let devices = JSON.parse(JSON.stringify(documents));
      var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
      devices.map((device: any) => (device.href = fullUrl + '/' + device.username));

      let response = {
        devices: devices,
        count: devices.length,
      };

      redisClient.set(fullUrl, JSON.stringify(response), 'EX', 30, 'NX');

      res.status(200);
      res.send(response);
    })
    .catch((err) => errHandler(err, res));
}

export function createDevice(req: any, res: any) {
  const device = new Device(req.body);
  device
    .save()
    .then((document) => {
      if (!document) {
        throw 404;
      }
      let device = JSON.parse(JSON.stringify(document));
      delete device._id;
      delete device.__v;
      delete device.password;
      var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl) + '/' + device.username;
      device.href = fullUrl;

      res.status(200);
      res.send(device);
    })
    .catch((err) => errHandler(err, res));
}

export function updateDevice(req: any, res: any) {
  const query = { username: req.params['username'] };
  const update = req.body;
  Device.findOneAndUpdate(query, update, { new: true })
    .then((document: any) => {
      if (!document) {
        throw 404;
      }
      let device = JSON.parse(JSON.stringify(document));
      delete device._id;
      delete device.__v;
      delete device.password;
      var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
      device.href = fullUrl;
      res.status(200);
      res.send(device);
    })
    .catch((err) => errHandler(err, res));
}

export function deleteDevice(req: any, res: any) {
  const query = { username: req.params['username'] };
  Device.findOneAndDelete(query)
    .then((document) => {
      if (!document) {
        throw 404;
      }
      let device = JSON.parse(JSON.stringify(document));
      delete device._id;
      delete device.__v;
      delete device.password;
      res.status(200);
      res.send(device);
    })
    .catch((err) => errHandler(err, res));
}

// ex: GET /devices/4134151/readings
export function retrieveReadings(req: any, res: any) {
  const device = req.params.username;
  const from = req.query['from'];
  const to = req.query['to'];

  console.log('Retrieving readings of device ' + device + '...');
  retrieveElasticReadings(device, from, to)
    .then((resolved: any) => {
      let hits = resolved.body.hits;
      if (!hits) {
        let response = {
          readings: [],
          count: 0,
        };
        res.status(200);
        res.send(response);
        return;
      }
      hits = hits.hits.map((element: any) => element._source);
      let response = {
        readings: hits,
        count: hits.length,
      };

      if (to !== null && from !== null) {
        console.log('Not from cache with dates specified');
        var fullUrl = trimEndSlashes(req.protocol + '://' + process.env.HOST + req.originalUrl);
        redisClient.set(fullUrl, JSON.stringify(response), 'EX', 10, 'NX');
      } else {
        console.log('Not from cache with dates not specified');
      }

      res.status(200);
      res.send(response);
    })
    .catch((err: any) => {
      console.log(err);
      errHandler(err, res);
    });
}
