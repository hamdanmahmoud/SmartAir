import { Component, OnInit, AfterViewInit, Inject, ViewEncapsulation } from '@angular/core';
import { Options } from 'ng5-slider';

import * as _ from 'lodash';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ControlDeviceModel } from 'app/models/ControlDeviceModel';
import { SenseDeviceModel } from 'app/models/SenseDeviceModel';
import { DeviceModel } from 'app/models/DeviceModel';
import { LiveService } from 'app/services/live.service';
import { LanguageService } from 'app/services/language.service';

@Component({
  selector: 'app-kitchen-popup',
  templateUrl: './kitchen-popup.component.html',
  styleUrls: ['./kitchen-popup.component.scss'],

})
export class KitchenPopupComponent implements OnInit, AfterViewInit {
  public controlDevices: ControlDeviceModel[];
  public controlDevice: ControlDeviceModel = new ControlDeviceModel();
  public senseDevices: SenseDeviceModel[];
  public temperatureOptions: Options;
  public humidityOptions: Options;
  public coOptions: Options;
  public ch4Options: Options;
  public smokeOptions: Options;
  public mobileTemperatureOptions: Options;
  public mobileHumidityOptions: Options;
  public mobileCoOptions: Options;
  public mobileCh4Options: Options;
  public mobileSmokeOptions: Options;
  public defaultControlDevice: ControlDeviceModel;
  public temperatureValue: any;
  public humidityValue: number = 0;
  public limit_temperature: any;
  public limit_humidity: any;
  public limit_smoke :any;
  public limit_co: any; 
  public limit_ch4: any;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private liveService: LiveService, public ls:LanguageService
  ) { }

  ngOnInit() {
    this.controlDevices = this.data.controlDevices;
    this.defaultControlDevice = this.controlDevices[0];
    console.log("aici", this.controlDevices)

    this.changeControlDevice(this.defaultControlDevice)
  }
  changeControlDevice(device: ControlDeviceModel) {
    this.controlDevice = device;
    this.limit_temperature = parseInt(localStorage.getItem('temperature_limit'))
    this.limit_humidity = parseInt(localStorage.getItem('humidity_limit'))
    this.limit_ch4= parseInt(localStorage.getItem('ch4_limit'))
    this.limit_smoke = parseInt(localStorage.getItem('smoke_limit'))
    this.limit_co = parseInt(localStorage.getItem('co_limit'))
    console.log(this.limit_temperature,this.limit_humidity)

    this.temperatureOptions = {
      floor: -30,
      ceil: 50,
      vertical: true
    };
    this.humidityOptions = {
      floor: 0,
      ceil: 100,
      vertical: true
    };
    this.ch4Options = {
      floor: 0,
      ceil: 1000,
      vertical: true
    };
    this.coOptions = {
      floor: 0,
      ceil: 1000,
      vertical: true
    };
    this.smokeOptions = {
      floor: 0,
      ceil: 1000,
      vertical: true
    };

    //mobile options for slider
    this.mobileTemperatureOptions = {
      floor: -30,
      ceil: 50,
      vertical: false
    };
    this.mobileHumidityOptions = {
      floor: 0,
      ceil: 100,
      vertical: false
    };
    this.mobileCh4Options = {
      floor: 0,
      ceil: 1000,
      vertical: false
    };
    this.mobileCoOptions = {
      floor: 0,
      ceil: 1000,
      vertical: false
    };
    this.mobileSmokeOptions = {
      floor: 0,
      ceil: 1000,
      vertical: false
    };

  }
  ngAfterViewInit() {

  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }else{ 
      
    }
    return true;
  };
  changeTemperatureLimit() {
    localStorage.setItem("temperature_limit",this.limit_temperature.toString())
    this.liveService.unsafePublishAction(this.controlDevice.getUsername(),{
      message_type:"command",
      command: {
        type:"change_variable",
        variable:"temperature_limit",
        value:this.limit_temperature
      }
    })
  }
  changeSmokeLimit() {
    localStorage.setItem("smoke_limit",this.limit_smoke.toString())
    this.liveService.unsafePublishAction(this.controlDevice.getUsername(),{
      message_type:"command",
      command: {
        type:"change_variable",
        variable:"smoke_limit",
        value:this.limit_smoke
      }
    })
  }
  changeCoLimit() {
    localStorage.setItem("co_limit",this.limit_co.toString())
    this.liveService.unsafePublishAction(this.controlDevice.getUsername(),{
      message_type:"command",
      command: {
        type:"change_variable",
        variable:"co_limit",
        value:this.limit_co
      }
    })
  }
  changeCh4Limit() {
    localStorage.setItem("ch4_limit",this.limit_ch4.toString())
    this.liveService.unsafePublishAction(this.controlDevice.getUsername(),{
      message_type:"command",
      command: {
        type:"change_variable",
        variable:"ch4_limit",
        value:this.limit_ch4
      }
    })
  }
  changeHumidityLimit() {
    localStorage.setItem("humidity_limit",this.limit_humidity.toString())
    this.liveService.unsafePublishAction(this.controlDevice.getUsername(),{
      message_type:"command",
      command: {
        type:"change_variable",
        variable:"humidity_limit",
        value:this.limit_humidity
      }
    })
  }
  closeWindow(){
    this.liveService.unsafePublishAction(this.controlDevice.getUsername(),{
      message_type:"command",
      command:{
        type:"take_action",
        action:"close_window"
      }
    })
  }
  openWindow(){
    this.liveService.unsafePublishAction(this.controlDevice.getUsername(),{
      message_type:"command",
      command:{
        type:"take_action",
        action:"open_window"
      }
    })
  }
}
