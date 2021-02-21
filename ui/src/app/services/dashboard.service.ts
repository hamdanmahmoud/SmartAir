import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { DeviceModel } from '../models/DeviceModel';
import { throwError } from 'rxjs';
import { SenseDeviceModel } from '../models/SenseDeviceModel';
import { ControlDeviceModel } from '../models/ControlDeviceModel';
import { AuthService } from './auth.service';
import { ReadingModel } from '../models/ReadingModel';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private databaseService: DatabaseService, private authService: AuthService) { }

  getDevices(): Promise<DeviceModel[]> {
    return new Promise(async (resolve, reject) => {
      let devices: string[] = this.authService.getAuthData().getUser().getDevices();
      console.log(this.authService.getAuthData().getUser())
      console.log(devices);
      let deviceObjects: Promise<DeviceModel>[] = devices.map(async username => await this.getDevice(username));
      Promise.all(deviceObjects).then(
        devices => {
          resolve(devices);
        }
      );
    });
  }

  getDevice(username: string): Promise<DeviceModel> {
    return new Promise(async (resolve, reject) => {
      this.databaseService.getDevice(username).then(device => {
        let deviceObject: DeviceModel = deviceFactory(device);
        resolve(deviceObject);
      });
    });
  }

  getAllReadings(device: string): Promise<ReadingModel[]> {
    return new Promise((resolve, reject) => {
      this.databaseService.getAllReadings(device).then(readings => {
        let readingsObject: ReadingModel[] = readings.map(function (reading) {
          return new ReadingModel().parse(reading);
        }).sort((a, b) => a.date - b.date);
        resolve(readingsObject);
      })
    })

  }

  getCustomReadings(device: string, obj: Object): Promise<ReadingModel[]> {
    obj = {
      from: new Date().toISOString(),
      to: new Date().toISOString()
    }
    return new Promise((resolve, reject) => {
      this.databaseService.getCustomReadings(device, obj).then(readings => {
        let readingsObject: ReadingModel[] = readings.map(function (reading) {
          return new ReadingModel().parse(reading);
        }).sort((a, b) => a.date - b.date);
        resolve(readingsObject);
      })
    })
  }

  getLastDayReadings(device: string): Promise<ReadingModel[]>{
    let from = new Date();
    let to = new Date();
    from.setDate(to.getDate() - 1)
    let obj = {
      'from': from.toISOString(),
      'to': to.toISOString()
    }
    return new Promise((resolve, reject) => {
      this.databaseService.getLastDayReadings(device, obj).then(readings => {
        let readingsObject: ReadingModel[] = readings.map(function (reading) {
          return new ReadingModel().parse(reading);
        }).sort((a, b) => a.date - b.date);
        resolve(readingsObject);
      })
    })
  }

  getOneWeekReadings(device: string): Promise<ReadingModel[]> {
    let from = new Date();
    let to = new Date();
    from.setDate(to.getDate() - 7)
    let obj = {
      'from': from.toISOString(),
      'to': to.toISOString()
    }
    return new Promise((resolve, reject) => {
      this.databaseService.getOneWeekReadings(device, obj).then(readings => {
        let readingsObject: ReadingModel[] = readings.map(function (reading) {
          return new ReadingModel().parse(reading);
        }).sort((a, b) => a.date - b.date);
        resolve(readingsObject);
      })
    })
  }

  getOneMonthReadings(device: string): Promise<ReadingModel[]> {
    let from = new Date();
    let to = new Date();
    from.setDate(to.getDate() - 30)
    let obj = {
      'from': from.toISOString(),
      'to': to.toISOString()
    }
    return new Promise((resolve, reject) => {
      this.databaseService.getOneMonthReadings(device, obj).then(readings => {
        let readingsObject: ReadingModel[] = readings.map(function (reading) {
          return new ReadingModel().parse(reading);
        }).sort((a, b) => a.date - b.date);
        resolve(readingsObject);
      })
    })
  }

  getOneYearReadings(device: string): Promise<ReadingModel[]> {
    let from = new Date();
    let to = new Date();
    from.setDate(to.getDate() - 365)
    let obj = {
      'from': from.toISOString(),
      'to': to.toISOString()
    }
    return new Promise((resolve, reject) => {
      this.databaseService.getOneYearReadings(device, obj).then(readings => {
        let readingsObject: ReadingModel[] = readings.map(function (reading) {
          return new ReadingModel().parse(reading);
        }).sort((a, b) => a.date - b.date);
        resolve(readingsObject);
      })
    })
  }

}


function deviceFactory(device: any): SenseDeviceModel | ControlDeviceModel {
  let type: string = device.type;
  switch (type) {
    case "sense": return new SenseDeviceModel().parse(device);
    case "control": return new ControlDeviceModel().parse(device);
    default: throwError("Device type is not valid");
  }
}