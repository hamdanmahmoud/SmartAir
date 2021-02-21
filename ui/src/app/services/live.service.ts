import { Injectable } from "@angular/core";
import { IMqttMessage, MqttService, MqttConnectionState } from "ngx-mqtt";
import { Subscription, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LiveService {
  constructor(private _mqttService: MqttService) {
    this._mqttService.state.subscribe((s: MqttConnectionState) => {
      const status =
        s === MqttConnectionState.CONNECTED ? "CONNECTED" : "DISCONNECTED";
      console.log(`Mqtt client connection status: ${status}`);
    });
  }

  getObservable(topic: string): Observable<IMqttMessage> {
    console.log("Subcribing to new topic: " + topic);

    let newObservable = this._mqttService.observe("devices/" + topic);

    return newObservable;
  }

  // We'll use this function to publish real-time settings on our pi through the broker

    unsafePublishAction(topic:string,msg:Object): void {
      // use unsafe publish for non-ssl websockets
     this._mqttService.unsafePublish("devices/"+ topic, JSON.stringify(msg), { qos: 1, retain: true })
  //     this.msg = ''
     }
}
