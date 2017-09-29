import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { FirebasePushNotificationService } from '../../providers/firebase-push-notification/firebase-push-notification.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public deviceView: any;

  private _titleText: string;
  private _titleBody: string;

  constructor(
    private _firebasePushNotificationService: FirebasePushNotificationService,
    public device: Device,
    public navCtrl: NavController
  ) {
    this.deviceView = device;

    this._titleText = 'New Push Notification';
    this._titleBody = 'Hello World!';
  }

  public sendPushNotification(): void {
    this._firebasePushNotificationService.sendPushNotification(this._titleText, this._titleBody).subscribe(
      (result: any) => {
        console.log(result);

      },
      (error: any) => {
        console.error(error);

      }
    );
  }
}
