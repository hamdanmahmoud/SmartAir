import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter, Output, Input, OnChanges } from "@angular/core";
import * as Chartist from "chartist";
import { DatabaseService } from "../../services/database.service";
import { DashboardService } from "../../services/dashboard.service";
import { DeviceModel } from "../../models/DeviceModel";
import { ReadingModel } from "../../models/ReadingModel";
import { AuthService } from "../../services/auth.service";
import { SenseDeviceModel } from "../../models/SenseDeviceModel";
import { ControlDeviceModel } from "../../models/ControlDeviceModel";
import { bindNodeCallback, throwError, Subscription } from "rxjs";
import { getMatAutocompleteMissingPanelError, MatDialog } from "@angular/material";
import { ChartType, ChartDataSets, ChartOptions } from "chart.js";
import {
  Label,
  SingleDataSet,
  monkeyPatchChartJsTooltip,
  monkeyPatchChartJsLegend,
} from "ng2-charts";
import { single } from "rxjs/operators";
import { LiveService } from "app/services/live.service";
import { IMqttMessage } from "ngx-mqtt";
import { ValuesModel } from "app/models/ValuesModel";
import { UtilsService } from "app/services/utils.service";
import * as _ from 'lodash';
import { DialogService } from "app/services/dialog.service";
import { LanguageService } from "app/services/language.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  styles: [
    `
      .chart {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  public liveData = [];
  public liveTime = [];

  private liveLeftChartSubscription: Subscription;
  private liveBarChartSubscription: Subscription;
  private liveRightChartSubscription: Subscription;

  private liveBarChart = false;
  public isLive = false;
  private liveLeftChart = false;
  private liveRightChart = false;
  private liveChartLabels: Array<any> = [];

  private devices: DeviceModel[];
  public senseDevices: SenseDeviceModel[];
  public controlDevices: ControlDeviceModel[];
  private defaultSenseDevice: SenseDeviceModel;
  public defaultBarDeviceUsername;
  public defaultLeftDeviceUsername;
  public defaultRightDeviceUsername;
  private defaultControlDevice: ControlDeviceModel;
  private leftSenseDevice: SenseDeviceModel = new SenseDeviceModel();
  private rightSenseDevice: SenseDeviceModel = new SenseDeviceModel();
  private barSenseDevice: SenseDeviceModel = new SenseDeviceModel();
  private pieSenseDevice: SenseDeviceModel = new SenseDeviceModel();
  private bubbleSenseDevice: SenseDeviceModel = new SenseDeviceModel();

  private dayLabels: string[] = _.initial(Array.from({ length: 24 }, (x, i) => i).map(n => n.toString() + "h ago").reverse()).concat(["now"]);
  private monthLabels: string[] = _.initial(Array.from({ length: 31 }, (x, i) => i).map(n => n.toString() + " days ago").reverse());

  public numberOfUserDevices: number;

  private leftChartTemperatureData: number[] = [];
  private leftChartHumidityData: number[] = [];

  private rightChartCarbonMonoxideData: number[] = [];
  private rightChartMetaneData: number[] = [];
  private rightChartSmokeData: number[] = [];

  private barChartPressureData: number[] = [];

  public oneWeekLeftChartLabels: Array<any>;

  public leftChartType: string;
  public leftChartOptions: any;
  public leftChartDatasets: Array<any>;
  public leftChartLabels: Array<any>;
  public leftChartColors: Array<any>;

  public rightChartType: string;
  public rightChartOptions: any;
  public rightChartDatasets: Array<any>;
  public rightChartLabels: Array<any>;
  public rightChartColors: Array<any>;

  public barChartDatasets: Array<any>;
  public barChartLabels: Array<any>;
  public barChartColors: Array<any>;
  public barChartOptions: any;
  public barChartType: string;

  public pieChartDatasets: Array<any>;
  public pieChartLabels: Array<any>;
  public pieChartColors: Array<any>;
  public pieChartOptions: any;
  public pieChartType: string;

  constructor(
    private ds: DatabaseService,
    private authService: AuthService,
    private dashService: DashboardService,
    private utilsService: UtilsService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    public ls: LanguageService,
    private liveService: LiveService
  ) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  async ngOnInit() {
    if (this.liveBarChartSubscription || this.liveLeftChartSubscription || this.liveRightChartSubscription) {
      this.liveBarChartSubscription.unsubscribe();
      this.liveLeftChartSubscription.unsubscribe();
      this.liveRightChartSubscription.unsubscribe();
    }

    this.liveBarChartSubscription = undefined;
    this.liveLeftChartSubscription = undefined;
    this.liveRightChartSubscription = undefined;
    this.handleLeftChartStatics();
    this.handleRightChartStatics();
    this.handleBarChartStatics();
    this.handlePieChartStatics();
    //this.handleBubbleChartStatics();
    this.numberOfUserDevices = (await this.dashService.getDevices()).length;
    console.log("The user has " + this.numberOfUserDevices + " devices");
  }

  async ngAfterViewInit() {
    this.devices = await this.dashService.getDevices();
    this.categorizeDevices();
    this.senseDevices.sort();
    this.defaultSenseDevice = this.senseDevices[0];
    this.defaultControlDevice = this.controlDevices[0]
    console.log("Default device is set to", this.defaultSenseDevice);
    this.staticChartsView();
  }

  categorizeDevices(): void {
    this.senseDevices = [];
    this.controlDevices = [];
    this.devices.forEach((device) => {
      if (device instanceof SenseDeviceModel) {
        this.senseDevices.push(device);
      } else if (device instanceof ControlDeviceModel) {
        this.controlDevices.push(device);
      }
    });
  }

  setLeftChartPeriod(period: string) {
    this.emptyLiveLeftChartValues();
    switch (period) {
      case "1y":
        if (!this.liveLeftChart)
          this.liveLeftChart = false;
        this.setLeftChartToYear();
        break;
      case "1m":
        if (!this.liveLeftChart)
          this.liveLeftChart = false;
        this.setLeftChartToMonth();
        break;
      case "7d":
        if (!this.liveLeftChart)
          this.liveLeftChart = false;
        this.setLeftChartToWeek();
        break;
      case "1d":
        if (!this.liveLeftChart)
          this.liveLeftChart = false;
        this.setLeftChartToDay();
        break;
    }
  }

  setLeftChartToDay(): void {

    this.dashService
      .getLastDayReadings(this.leftSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastDayReadings = [];
        for (let i = 0; i < 24; i++) {
          lastDayReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 60 * 60 * 1000
            )
          );
        }
        this.leftChartHumidityData = lastDayReadings
          .map((singleHourReading) =>
            Math.max.apply(
              Math,
              singleHourReading.map((reading) => reading.getHumidity())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.leftChartTemperatureData = lastDayReadings
          .map((singleHourReading) =>
            Math.max.apply(
              Math,
              singleHourReading.map((reading) => reading.getTemperature())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.leftChartLabels = this.dayLabels;
        this.leftChartDatasets = [
          { data: this.leftChartHumidityData, label: "Humidity" },
          { data: this.leftChartTemperatureData, label: "Temperature" },
        ];
      });
  }

  setLeftChartToWeek(): void {
    this.dashService
      .getOneWeekReadings(this.leftSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastSevenDaysReadings = [];
        for (let i = 0; i < 7; i++) {
          lastSevenDaysReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 24 * 60 * 60 * 1000
            )
          );
        }
        this.leftChartHumidityData = lastSevenDaysReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getHumidity())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.leftChartTemperatureData = lastSevenDaysReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getTemperature())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        let lastDayIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 24 * 60 * 60 * 1000).getDay()
        );
        let lastTwoDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 48 * 60 * 60 * 1000).getDay()
        );
        let lastThreeDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 72 * 60 * 60 * 1000).getDay()
        );
        let lastFourDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 96 * 60 * 60 * 1000).getDay()
        );
        let lastFiveDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 120 * 60 * 60 * 1000).getDay()
        );
        let lastSixDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 144 * 60 * 60 * 1000).getDay()
        );
        let lastSevenDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 168 * 60 * 60 * 1000).getDay()
        );

        let dayIndexes = [
          lastSevenDaysIndex,
          lastSixDaysIndex,
          lastFiveDaysIndex,
          lastFourDaysIndex,
          lastThreeDaysIndex,
          lastTwoDaysIndex,
          lastDayIndex,
        ];

        this.leftChartLabels = dayIndexes.map((dayIndex) =>
          this.getDayNameFromIndex(dayIndex)
        );
        this.leftChartDatasets = [
          { data: this.leftChartHumidityData, label: "Humidity" },
          { data: this.leftChartTemperatureData, label: "Temperature" },
        ];
      });
  }

  getDayNameFromIndex(dayIndex: number) {
    switch (dayIndex) {
      case 0:
        return "MONDAY";
      case 1:
        return "TUESDAY";
      case 2:
        return "WEDNESDAY";
      case 3:
        return "THURSDAY";
      case 4:
        return "FRIDAY";
      case 5:
        return "SATURDAY";
      case 6:
        return "SUNDAY";
    }
  }

  setLeftChartToMonth(): void {
    this.dashService
      .getOneMonthReadings(this.leftSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastMonthReadings = [];
        for (let i = 0; i < 30; i++) {
          lastMonthReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 24 * 60 * 60 * 1000
            )
          );
        }

        this.leftChartHumidityData = lastMonthReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getHumidity())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.leftChartTemperatureData = lastMonthReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getTemperature())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.leftChartLabels = this.monthLabels;
        this.leftChartDatasets = [
          { data: this.leftChartHumidityData, label: "Humidity" },
          { data: this.leftChartTemperatureData, label: "Temperature" },
        ];
      });
  }

  setLeftChartToYear(): void {
    this.dashService
      .getOneYearReadings(this.leftSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastYearReadings = [];
        for (let i = 0; i < 12; i++) {
          lastYearReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 30 * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() <
                now.getTime() - i * 30 * 24 * 60 * 60 * 1000
            )
          );
        }

        this.leftChartHumidityData = lastYearReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getHumidity())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.leftChartTemperatureData = lastYearReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getTemperature())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        let oneMonthAgoIndex = this.utilsService.getMonthIndex(now.getMonth());
        let twoMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 1);
        let threeMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 2);
        let fourMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 3);
        let fiveMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 4);
        let sixMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 5);
        let sevenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 6);
        let eightMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 7);
        let nineMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 8);
        let tenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 9);
        let elevenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 10);
        let twelveMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 11);

        let monthIndexes = [
          oneMonthAgoIndex,
          twoMonthsAgoIndex,
          threeMonthsAgoIndex,
          fourMonthsAgoIndex,
          fiveMonthsAgoIndex,
          sixMonthsAgoIndex,
          sevenMonthsAgoIndex,
          eightMonthsAgoIndex,
          nineMonthsAgoIndex,
          tenMonthsAgoIndex,
          elevenMonthsAgoIndex,
          twelveMonthsAgoIndex,
        ].reverse();

        this.leftChartLabels = monthIndexes.map((monthIndex) =>
          this.utilsService.getMonthNameFromIndex(monthIndex)
        );
        this.leftChartDatasets = [
          { data: this.leftChartHumidityData, label: "Humidity" },
          { data: this.leftChartTemperatureData, label: "Temperature" },
        ];
      });
  }

  emptyLeftChartValues() {
    this.leftChartHumidityData = [];
    this.leftChartTemperatureData = [];
  }
  emptyLiveLeftChartValues() {
    this.leftChartHumidityData = [];
    this.leftChartTemperatureData = [];
    this.leftChartLabels = [];
  }
  handleLiveLeftChartStatics() {
    this.leftChartType = "line";
    this.leftChartColors = [
      {
        backgroundColor: "rgba(198,250,255, 0.7)",
        borderColor: "rgba(135,206,235, .7)",
        borderWidth: 2,
      },
      {
        backgroundColor: "rgba(255,69,0, 0.7)",
        borderColor: "rgb(218,165,32, .7)",
        borderWidth: 2,
      },
    ];
    this.leftChartOptions = {
      responsive: true,
    };
    this.leftChartDatasets = [
      { data: this.leftChartHumidityData, label: "Humidity" },
      { data: this.leftChartTemperatureData, label: "Temperature" },
    ];
  }
  handleLeftChartStatics() {
    this.leftChartType = "line";
    this.leftChartColors = [
      {
        backgroundColor: "rgba(198,250,255, 0.7)",
        borderColor: "rgba(135,206,235, .7)",
        borderWidth: 2,
      },
      {
        backgroundColor: "rgba(255,69,0, 0.7)",
        borderColor: "rgb(218,165,32, .7)",
        borderWidth: 2,
      },
    ];
    this.leftChartOptions = {
      responsive: true,
    };

    this.leftChartLabels = Array.from({ length: 24 }, (x, i) => i).map(n => (n == 23) || (n == 12) ? n.toString() + "h ago" : "").reverse();
    this.leftChartDatasets = [
      { data: this.leftChartHumidityData, label: "Humidity" },
      { data: this.leftChartTemperatureData, label: "Temperature" },
    ];
  }

  emptyRightChartValues() {
    this.rightChartMetaneData = [];
    this.rightChartCarbonMonoxideData = [];
    this.rightChartSmokeData = [];
  }
  emptyLiveRightChartValues() {
    this.rightChartMetaneData = [];
    this.rightChartCarbonMonoxideData = [];
    this.rightChartSmokeData = [];
    this.rightChartLabels = [];
  }

  handleLiveRightChartStatics() {
    this.rightChartType = "line";
    this.rightChartColors = [
      {
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(176, 224, 230, .7)",
        borderWidth: 2,
      },
      {
        backgroundColor: "rgba(211, 211, 211, 0.7)",
        borderColor: "rgba(112, 128, 144, .7)",
        borderWidth: 2,
      },
      {
        backgroundColor: "rgba(0, 100, 100, 0.7)",
        borderColor: "rgba(0, 128, 128, .7)",
        borderWidth: 2,
      },
    ];
    this.rightChartOptions = {
      responsive: true,
    };

    this.rightChartDatasets = [
      { data: this.rightChartCarbonMonoxideData, label: "Carbon Monoxide" },
      { data: this.rightChartSmokeData, label: "Smoke" },
      { data: this.rightChartMetaneData, label: "Metane" },
    ];
  }

  handleRightChartStatics() {
    this.rightChartType = "line";
    this.rightChartColors = [
      {
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(176, 224, 230, .7)",
        borderWidth: 2,
      },
      {
        backgroundColor: "rgba(211, 211, 211, 0.7)",
        borderColor: "rgba(112, 128, 144, .7)",
        borderWidth: 2,
      },
      {
        backgroundColor: "rgba(0, 100, 100, 0.7)",
        borderColor: "rgba(0, 128, 128, .7)",
        borderWidth: 2,
      },
    ];
    this.rightChartOptions = {
      responsive: true,
    };
    this.rightChartLabels = this.dayLabels;
    this.rightChartDatasets = [
      { data: this.rightChartCarbonMonoxideData, label: "Carbon Monoxide" },
      { data: this.rightChartSmokeData, label: "Smoke" },
      { data: this.rightChartMetaneData, label: "Metane" },
    ];
  }

  emptyBarChartValues() {
    this.barChartPressureData = [];
  }
  emptyLiveBarChartValues() {
    this.barChartPressureData = [];
    this.barChartLabels = [];
  }

  setBarChartPeriod(value: string) {
    this.emptyBarChartValues();
    switch (value) {
      case "1y":
        if (!this.liveBarChart)
          this.liveBarChart = false;
        this.setBarChartToYear();
        break;
      case "1m":
        if (!this.liveBarChart)
          this.liveBarChart = false;
        this.setBarChartToMonth();
        break;
      case "7d":
        if (!this.liveBarChart)
          this.liveBarChart = false;
        this.setBarChartToWeek();
        break;
      case "1d":
        if (!this.liveBarChart)
          this.liveBarChart = false;
        this.setBarChartToDay();
        break;
    }
  }

  setBarChartToYear() {
    this.dashService
      .getOneYearReadings(this.barSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastYearReadings = [];
        for (let i = 0; i < 12; i++) {
          lastYearReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 30 * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() <
                now.getTime() - i * 30 * 24 * 60 * 60 * 1000
            )
          );
        }

        this.barChartPressureData = lastYearReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getCO())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        let oneMonthAgoIndex = this.utilsService.getMonthIndex(now.getMonth());
        let twoMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 1);
        let threeMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 2);
        let fourMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 3);
        let fiveMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 4);
        let sixMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 5);
        let sevenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 6);
        let eightMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 7);
        let nineMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 8);
        let tenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 9);
        let elevenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 10);
        let twelveMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 11);

        let monthIndexes = [
          oneMonthAgoIndex,
          twoMonthsAgoIndex,
          threeMonthsAgoIndex,
          fourMonthsAgoIndex,
          fiveMonthsAgoIndex,
          sixMonthsAgoIndex,
          sevenMonthsAgoIndex,
          eightMonthsAgoIndex,
          nineMonthsAgoIndex,
          tenMonthsAgoIndex,
          elevenMonthsAgoIndex,
          twelveMonthsAgoIndex,
        ].reverse();

        this.barChartLabels = monthIndexes.map((monthIndex) =>
          this.utilsService.getMonthNameFromIndex(monthIndex)
        );
        this.barChartDatasets = [
          {
            data: this.barChartPressureData,
            label: "Pressure",
          }
        ];
      });
  }

  setBarChartToMonth() {
    this.dashService
      .getOneMonthReadings(this.barSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastMonthReadings = [];
        for (let i = 0; i < 30; i++) {
          lastMonthReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 24 * 60 * 60 * 1000
            )
          );
        }

        this.barChartPressureData = lastMonthReadings
          .map((oneMonthReading) =>
            Math.max.apply(
              Math,
              oneMonthReading.map((reading) => reading.getCO())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.barChartLabels = this.monthLabels;
        this.barChartDatasets = [
          {
            data: this.barChartPressureData,
            label: "Pressure",
          }
        ];
      });
  }

  setBarChartToWeek() {
    this.dashService
      .getOneWeekReadings(this.barSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastSevenDaysReadings = [];
        for (let i = 0; i < 7; i++) {
          lastSevenDaysReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 24 * 60 * 60 * 1000
            )
          );
        }

        this.barChartPressureData = lastSevenDaysReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getCO())
            )
          )
          .reverse()
          .map((value) => (isFinite(value) ? value : 0));

        let lastDayIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 24 * 60 * 60 * 1000).getDay()
        );
        let lastTwoDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 48 * 60 * 60 * 1000).getDay()
        );
        let lastThreeDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 72 * 60 * 60 * 1000).getDay()
        );
        let lastFourDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 96 * 60 * 60 * 1000).getDay()
        );
        let lastFiveDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 120 * 60 * 60 * 1000).getDay()
        );
        let lastSixDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 144 * 60 * 60 * 1000).getDay()
        );
        let lastSevenDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 168 * 60 * 60 * 1000).getDay()
        );

        let dayIndexes = [
          lastSevenDaysIndex,
          lastSixDaysIndex,
          lastFiveDaysIndex,
          lastFourDaysIndex,
          lastThreeDaysIndex,
          lastTwoDaysIndex,
          lastDayIndex,
        ];

        this.barChartLabels = dayIndexes.map((dayIndex) =>
          this.getDayNameFromIndex(dayIndex)
        );
        this.barChartDatasets = [
          {
            data: this.barChartPressureData,
            label: "Pressure",
          }
        ];
      });
  }

  setBarChartToDay() {
    this.dashService
      .getLastDayReadings(this.barSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastDayReadings = [];
        for (let i = 0; i < 24; i++) {
          lastDayReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 60 * 60 * 1000
            )
          );
        }
        this.barChartPressureData = lastDayReadings
          .map((singleHourReading) =>
            Math.max.apply(
              Math,
              singleHourReading.map((reading) => reading.getCO())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();
        this.barChartLabels = this.dayLabels;
        this.barChartDatasets = [
          {
            data: this.barChartPressureData,
            label: "Pressure",
          }
        ];
      });
  }

  setRightChartPeriod(value: string) {
    switch (value) {
      case "1y":
        if (!this.liveRightChart)
          this.liveRightChart = false;
        this.setRightChartToYear();
        break;
      case "1m":
        if (!this.liveRightChart)
          this.liveRightChart = false;
        this.setRightChartToMonth();
        break;
      case "7d":
        if (!this.liveRightChart)
          this.liveRightChart = false;
        this.setRightChartToWeek();
        break;
      case "1d":
        if (!this.liveRightChart)
          this.liveRightChart = false;
        this.setRightChartToDay();
        break;
    }
  }

  setRightChartToDay(): void {
    this.dashService
      .getLastDayReadings(this.rightSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastDayReadings = [];
        for (let i = 0; i < 24; i++) {
          lastDayReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 60 * 60 * 1000
            )
          );
        }

        this.rightChartCarbonMonoxideData = lastDayReadings
          .map((singleHourReading) =>
            Math.max.apply(
              Math,
              singleHourReading.map((reading) => reading.getCO())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.rightChartMetaneData = lastDayReadings
          .map((singleHourReading) =>
            Math.max.apply(
              Math,
              singleHourReading.map((reading) => reading.getCH4())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.rightChartSmokeData = lastDayReadings
          .map((singleHourReading) =>
            Math.max.apply(
              Math,
              singleHourReading.map((reading) => reading.getSmoke())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.rightChartLabels = this.dayLabels;
        this.rightChartDatasets = [
          { data: this.rightChartCarbonMonoxideData, label: "Carbon monoxide" },
          { data: this.rightChartSmokeData, label: "Smoke" },
          { data: this.rightChartMetaneData, label: "Gas" },
        ];
      });
  }

  setRightChartToWeek(): void {
    this.dashService
      .getOneWeekReadings(this.rightSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastSevenDaysReadings = [];
        for (let i = 0; i < 7; i++) {
          lastSevenDaysReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 24 * 60 * 60 * 1000
            )
          );
        }

        this.rightChartCarbonMonoxideData = lastSevenDaysReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getCO())
            )
          )
          .reverse()
          .map((value) => (isFinite(value) ? value : 0));

        this.rightChartMetaneData = lastSevenDaysReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getCH4())
            )
          )
          .reverse()
          .map((value) => (isFinite(value) ? value : 0));

        this.rightChartSmokeData = lastSevenDaysReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getSmoke())
            )
          )
          .reverse()
          .map((value) => (isFinite(value) ? value : 0));

        let lastDayIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 24 * 60 * 60 * 1000).getDay()
        );
        let lastTwoDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 48 * 60 * 60 * 1000).getDay()
        );
        let lastThreeDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 72 * 60 * 60 * 1000).getDay()
        );
        let lastFourDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 96 * 60 * 60 * 1000).getDay()
        );
        let lastFiveDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 120 * 60 * 60 * 1000).getDay()
        );
        let lastSixDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 144 * 60 * 60 * 1000).getDay()
        );
        let lastSevenDaysIndex = this.utilsService.getEuropeanDayIndex(
          new Date(now.getTime() - 168 * 60 * 60 * 1000).getDay()
        );

        let dayIndexes = [
          lastSevenDaysIndex,
          lastSixDaysIndex,
          lastFiveDaysIndex,
          lastFourDaysIndex,
          lastThreeDaysIndex,
          lastTwoDaysIndex,
          lastDayIndex,
        ];

        this.rightChartLabels = dayIndexes.map((dayIndex) =>
          this.getDayNameFromIndex(dayIndex)
        );
        this.rightChartDatasets = [
          { data: this.rightChartCarbonMonoxideData, label: "Carbon Monoxide" },
          { data: this.rightChartSmokeData, label: "Smoke" },
          { data: this.rightChartMetaneData, label: "Gas" },
        ];
      });
  }

  setRightChartToMonth(): void {
    this.dashService
      .getOneMonthReadings(this.rightSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastMonthReadings = [];
        for (let i = 0; i < 30; i++) {
          lastMonthReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() < now.getTime() - i * 24 * 60 * 60 * 1000
            )
          );
        }

        this.rightChartCarbonMonoxideData = lastMonthReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getCO())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.rightChartMetaneData = lastMonthReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getCH4())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.rightChartSmokeData = lastMonthReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getSmoke())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.rightChartLabels = this.monthLabels;
        this.rightChartDatasets = [
          { data: this.rightChartCarbonMonoxideData, label: "Carbon monoxide" },
          { data: this.rightChartSmokeData, label: "Smoke" },
          { data: this.rightChartMetaneData, label: "Gas" },
        ];
      });
  }

  setRightChartToYear(): void {
    this.dashService
      .getOneYearReadings(this.rightSenseDevice.getUsername())
      .then((readings) => {
        let now = new Date();
        let lastYearReadings = [];
        for (let i = 0; i < 12; i++) {
          lastYearReadings.push(
            readings.filter(
              (reading) =>
                reading.date.getTime() >=
                now.getTime() - (i + 1) * 30 * 24 * 60 * 60 * 1000 &&
                reading.date.getTime() <
                now.getTime() - i * 30 * 24 * 60 * 60 * 1000
            )
          );
        }

        this.rightChartCarbonMonoxideData = lastYearReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getCO())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.rightChartMetaneData = lastYearReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getCH4())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        this.rightChartSmokeData = lastYearReadings
          .map((singleDayReadings) =>
            Math.max.apply(
              Math,
              singleDayReadings.map((reading) => reading.getSmoke())
            )
          )
          .map((value) => (isFinite(value) ? value : 0))
          .reverse();

        let oneMonthAgoIndex = this.utilsService.getMonthIndex(now.getMonth());
        let twoMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 1);
        let threeMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 2);
        let fourMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 3);
        let fiveMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 4);
        let sixMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 5);
        let sevenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 6);
        let eightMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 7);
        let nineMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 8);
        let tenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 9);
        let elevenMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 10);
        let twelveMonthsAgoIndex = this.utilsService.getMonthIndex(now.getMonth() - 11);

        let monthIndexes = [
          oneMonthAgoIndex,
          twoMonthsAgoIndex,
          threeMonthsAgoIndex,
          fourMonthsAgoIndex,
          fiveMonthsAgoIndex,
          sixMonthsAgoIndex,
          sevenMonthsAgoIndex,
          eightMonthsAgoIndex,
          nineMonthsAgoIndex,
          tenMonthsAgoIndex,
          elevenMonthsAgoIndex,
          twelveMonthsAgoIndex,
        ].reverse();

        this.rightChartLabels = monthIndexes.map((monthIndex) =>
          this.utilsService.getMonthNameFromIndex(monthIndex)
        );
        this.rightChartDatasets = [
          { data: this.rightChartCarbonMonoxideData, label: "Carbon monoxide" },
          { data: this.rightChartSmokeData, label: "Smoke" },
          { data: this.rightChartMetaneData, label: "Gas" },
        ];
      });
  }
  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }
  public bubbleChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [
        {
          ticks: {
            min: 0,
            max: 50,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            min: 0,
            max: 50,
          },
        },
      ],
    },
  };
  public bubbleChartColors: Array<any> = [
    {
      backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"],
      hoverBackgroundColor: [
        "#FF5A5E",
        "#5AD3D1",
        "#FFC870",
        "#A8B3C5",
        "#616774",
      ],
      borderWidth: 2,
    },
  ];
  public bubbleChartType: ChartType = "bubble";
  public bubbleChartLegend = true;

  public bubbleChartData: ChartDataSets[] = [
    {
      data: [
        { x: 15, y: 15, r: 15 },
        { x: 25, y: 15, r: 25 },
        { x: 36, y: 12, r: 33 },
        { x: 10, y: 18, r: 18 },
      ],
      label: "Investment Equities",
    },
  ];

  handlePieChartStatics() {
    this.pieChartType = "pie";
    this.pieChartColors = [
      {
        backgroundColor: [
          "#F7464A",
          "#46BFBD",
          "#FDB45C",
          "#949FB1",
          "#4D5360",
        ],
        hoverBackgroundColor: [
          "#FF5A5E",
          "#5AD3D1",
          "#FFC870",
          "#A8B3C5",
          "#616774",
        ],
        borderWidth: 2,
      },
    ];

    this.pieChartOptions = {
      responsive: true,
    };
  }

  handlePieChartDynamics() {
    this.pieChartDatasets = [
      { data: [300, 50, 100, 40, 120], label: "My First dataset" },
    ];

    this.pieChartLabels = ["Red", "Green", "Yellow", "Grey", "Dark Grey"];
  }

  handleLiveBarChartStatics() {
    this.barChartType = "bar";
    this.barChartColors = [
      {
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255,99,132,1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      }
    ];
    this.barChartDatasets = [
      {
        data: this.barChartPressureData,
        label: "Pressure",
      }
    ];
    this.barChartOptions = {
      responsive: true,
      scales: {
        xAxes: [
          {
            stacked: true,
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    };
  }
  handleBarChartStatics() {
    this.barChartType = "bar";
    this.barChartColors = [
      {
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255,99,132,1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      }
    ];

    this.barChartOptions = {
      responsive: true,
      scales: {
        xAxes: [
          {
            stacked: true,
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    };
  }

  changeBarChartDevice(device: SenseDeviceModel) {
    this.emptyLiveBarChartValues();
    this.barSenseDevice = device;
    if (this.liveBarChartSubscription)
      this.liveBarChartSubscription.unsubscribe();
    this.liveBarChartSubscription = undefined;
    if (this.isLive) {
      this.subscribeToBarSenseDevice(this.barSenseDevice)
    }else{
      this.setBarChartPeriod("1d");
    }
    this.defaultBarDeviceUsername = this.barSenseDevice.getUsername();
  }
  changeLeftChartDevice(device: SenseDeviceModel) {
    this.emptyLiveLeftChartValues();
    this.leftSenseDevice = device;
    if (this.liveLeftChartSubscription)
      this.liveLeftChartSubscription.unsubscribe();
    this.liveLeftChartSubscription = undefined;
    if (this.isLive) {
      this.subscribeToLeftSenseDevice(this.leftSenseDevice)
    }else{
      this.setLeftChartPeriod('1d')
    }
    this.defaultLeftDeviceUsername = this.leftSenseDevice.getUsername();
  }
  changeRightChartDevice(device: SenseDeviceModel) {
    this.emptyLiveRightChartValues();
    this.rightSenseDevice = device;
    if (this.liveRightChartSubscription)
      this.liveRightChartSubscription.unsubscribe();
    this.liveRightChartSubscription = undefined;
    if (this.isLive) {
      this.subscribeToRightSenseDevice(this.rightSenseDevice)
    }else{
      this.setRightChartPeriod('1d')
    }
    this.defaultRightDeviceUsername = this.rightSenseDevice.getUsername();
  }

  subscribeToLeftSenseDevice(device: SenseDeviceModel) {
    const topic = device.getUsername();
    const observable = this.liveService.getObservable(topic);
    this.liveLeftChartSubscription = observable.subscribe((message: IMqttMessage) => {
      let liveValues: ValuesModel = new ValuesModel().parse(
        JSON.parse(message.payload.toString())
      );
      let tempLabels = _.clone(this.leftChartLabels);
      let tempTemperatureData = _.clone(this.leftChartTemperatureData);
      let tempHumidityData = _.clone(this.leftChartHumidityData);

      if (tempLabels.length > 5) {
        console.log("Length is bigger than 5");
        tempLabels = tempLabels.slice(-5);
        tempTemperatureData = tempTemperatureData.slice(-5);
        tempHumidityData = tempHumidityData.slice(-5);
        console.log(tempTemperatureData)
      }
      tempLabels.push(new Date().toLocaleTimeString());
      tempTemperatureData.push(liveValues.general.getTemperature());
      tempHumidityData.push(liveValues.general.getHumidity());
      this.leftChartLabels = tempLabels;
      this.leftChartTemperatureData = tempTemperatureData;
      this.leftChartHumidityData = tempHumidityData;
      this.handleLiveLeftChartStatics();

    });
  }
  subscribeToRightSenseDevice(device: SenseDeviceModel) {
    const topic = device.getUsername();
    const observable = this.liveService.getObservable(topic);
    this.liveRightChartSubscription = observable.subscribe((message: IMqttMessage) => {
      let liveValues: ValuesModel = new ValuesModel().parse(
        JSON.parse(message.payload.toString())
      );
      let tempLabels = _.clone(this.rightChartLabels);
      let tempCarbonMonoxideData = _.clone(this.rightChartCarbonMonoxideData);
      let tempMetaneData = _.clone(this.rightChartMetaneData);
      let tempSmokeData = _.clone(this.rightChartSmokeData);
      if (tempLabels.length > 5) {
        console.log("Length is bigger than 5");
        tempLabels = tempLabels.slice(-5);
        tempCarbonMonoxideData = tempCarbonMonoxideData.slice(-5);
        tempMetaneData = tempMetaneData.slice(-5);
        tempSmokeData = tempSmokeData.slice(-5);
      }
      tempLabels.push(new Date().toLocaleTimeString());
      tempCarbonMonoxideData.push(liveValues.poisonous.getCO());
      tempMetaneData.push(liveValues.poisonous.getCH4());
      tempSmokeData.push(liveValues.poisonous.getSmoke());
      this.rightChartLabels = tempLabels;
      this.rightChartCarbonMonoxideData = tempCarbonMonoxideData;
      this.rightChartMetaneData = tempMetaneData;
      this.rightChartSmokeData = tempSmokeData;
      this.handleLiveRightChartStatics();

    });

  }
  subscribeToBarSenseDevice(device: SenseDeviceModel) {
    const topic = device.getUsername();
    const observable = this.liveService.getObservable(topic);
    this.liveBarChartSubscription = observable.subscribe((message: IMqttMessage) => {
      let liveValues: ValuesModel = new ValuesModel().parse(
        JSON.parse(message.payload.toString())
      );
      let tempLabels = _.clone(this.barChartLabels);
      let tempPressureData = _.clone(this.barChartPressureData);
      if (tempLabels.length > 5) {
        console.log("Length is bigger than 5");
        tempLabels = tempLabels.slice(-5);
        tempPressureData = tempPressureData.slice(-5);
      }
      tempLabels.push(new Date().toLocaleTimeString());
      tempPressureData.push(liveValues.general.getPressure())
      this.barChartLabels = tempLabels;
      this.barChartPressureData = tempPressureData;
      this.handleLiveBarChartStatics();
    });
  }
  staticChartsView() {
    this.leftSenseDevice = this.defaultSenseDevice;
    this.rightSenseDevice = this.defaultSenseDevice;
    this.barSenseDevice = this.defaultSenseDevice;
    this.pieSenseDevice = this.defaultSenseDevice;
    this.bubbleSenseDevice = this.defaultSenseDevice;
    this.defaultLeftDeviceUsername = this.defaultSenseDevice.getUsername();
    this.defaultRightDeviceUsername = this.defaultSenseDevice.getUsername();
    this.defaultBarDeviceUsername = this.defaultSenseDevice.getUsername();
    this.setLeftChartPeriod("1d");
    this.setRightChartPeriod("1d");
    this.setBarChartPeriod("1d");
  }

  changeToLive() {
    if (!this.isLive) {
      this.emptyLiveLeftChartValues();
      this.emptyLiveBarChartValues();
      this.emptyLiveRightChartValues();
      this.isLive = true;
      this.liveRightChart = true;
      this.liveBarChart = true;
      this.liveLeftChart = true;
      console.log(this.leftSenseDevice);
      console.log(this.rightSenseDevice)
      this.subscribeToLeftSenseDevice(this.leftSenseDevice);
      this.subscribeToBarSenseDevice(this.barSenseDevice);
      this.subscribeToRightSenseDevice(this.rightSenseDevice);
    } else {
      this.isLive = false;
      this.liveRightChart = false;
      this.liveBarChart = false;
      this.liveLeftChart = false;
      this.liveLeftChartSubscription.unsubscribe();
      this.liveRightChartSubscription.unsubscribe();
      this.liveBarChartSubscription.unsubscribe();
      this.staticChartsView();
    }

  }
}
