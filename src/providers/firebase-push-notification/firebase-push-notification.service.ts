import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { AlertController } from 'ionic-angular';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { environment } from '../../environments/environment-dev';

@Injectable()
export class FirebasePushNotificationService {

  private _firebaseMessagingSenderId: string;
  private _firebaseServerKey: string;
  private _firebaseRegistrationId: string;

  constructor(
    private _http: Http,
    public alertCtrl: AlertController,
    public push: Push
  ) {
    this._firebaseMessagingSenderId = environment.firebase.messagingSenderId;
    this._firebaseServerKey         = environment.firebase.serverKey;
  }

  public initPushNotification(): any {

    const options: PushOptions = {
      android: {
        senderID: this._firebaseMessagingSenderId
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },
      windows: {}
    };

    const pushObject: PushObject = this.push.init(options);

    pushObject.on('registration').subscribe(
      (result: any) => {
        console.log(result);

        this._firebaseRegistrationId = result.registrationId;
      },
      (error: any) => {
        console.error(error);

      }
    );

    pushObject.on('notification').subscribe(
      (notification: any) => {
        console.log(notification);

        if(notification.additionalData.foreground) {

          let tmpAlert = this.alertCtrl.create({
            title: notification.title,
            message: notification.message
          });
          tmpAlert.present();
        }
      },
      (error: any) => {
        console.error(error);

      }
    );

    pushObject.on('error').subscribe(error => alert('Error with Push plugin' + error));
  }

  public sendPushNotification(titleText: string, bodyText: string): Observable<any> {

    if(this._firebaseRegistrationId){

      return Observable.create((observer: Subscriber<any>) => {

        let url: string = 'https://fcm.googleapis.com/fcm/send';
        let body = JSON.stringify({
          'to': this._firebaseRegistrationId,
          'priority': 10,
          'notification': {
            'title': titleText,
            'body': bodyText
          }
        });

        // Setzen des AJAX-Headers:
        let headers = new Headers({ 'Content-Type': 'application/json' });
        // Hinzufügen des Tokens zum Header:
        headers.append('Authorization', 'key=' + this._firebaseServerKey);

        // Setzen der AJAX-Options:
        let options = new RequestOptions({ headers: headers });

        // AJAX-Request:
        this._http.post(url, body, options).subscribe(
          (result: any) => {
            console.log(result);

            observer.next(result);
            observer.complete();
          },
          (error: any) => {
            console.error(error);

            observer.error(error);
            observer.complete();
          }
        );
      });
    }
  }
}
