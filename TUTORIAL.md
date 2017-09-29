# Tutorial
Ionic-Firebase-Push-Notification Template

Last Update: 20. September 2017

## How to create this template?

1. Open the folder where the project should be created and run the command below. If you are in folder 'c:\projects\' the folder 'c:\projects\ionic-firebase-push-notification' will be created with all necessary files of the ionic project.
  ```bash
  $ ionic start ionic-firebase-push-notification blank
  ```
2. Open the folder, which you created the step before and run the command below. If everything was installed successfully a web browser will be open and show you the Ionic blank page of the project.
  ```bash
  $ ionic serve
  ```
3. Create the folder '/src/environments':
  ```bash
  /src/environments/
  ```
4. Add the file '/src/environments/environment.ts' with your Firebase credentials to the folder '/src/environments':
  ```ts
  export const environment = {
    production: false,
    firebase: {
      apiKey:             "yourApiKey",
      authDomain:         "domain.firebaseapp.com",
      databaseURL:        "https://domain.firebaseio.com",
      messagingSenderId:  "yourMessagingSenderId",
      serverKey:          "yourServerKey",
      storageBucket:      "domain.appspot.com",
    }
  };
  ```
5. Install the Ionic Native plugin 'push' and 'device' to the file '/package.json'::
  ```bash
  $ npm install @ionic-native/push@3.12.1 --save
  $ npm install @ionic-native/device@3.12.1 --save
  ```
6. Add the Cordova plugin 'phonegap-plugin-push' to the file '/config.xml':
  ```bash
  $ ionic cordova plugin add phonegap-plugin-push@1.10.5 --variable SENDER_ID="<yourMessagingSenderId>"
  ```
7. Create the folder '/src/providers/':
  ```bash
  /src/providers/
  ```
8. Create the folder '/src/providers/firebase-push-notification':
  ```bash
  /src/providers/firebase-push-notification/
  ```
9. Add the file '/src/providers/firebase-push-notification/firebase-push-notification.service.ts':
  ```ts
  import { Injectable } from '@angular/core';
  import { Headers, Http, RequestOptions } from '@angular/http';
  import { Observable } from 'rxjs/Observable';
  import { Subscriber } from 'rxjs/Subscriber';
  
  import { AlertController } from 'ionic-angular';
  import { Push, PushObject, PushOptions } from '@ionic-native/push';
  import { environment } from '../../environments/environment';
  
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
  
          this._firebaseRegistrationId = result.registrationId
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
  ```
10. Add the provider 'FirebasePushNotificationService' to the file '/src/app/app.module.ts':
  ```ts
  import { FirebasePushNotificationService } from '../providers/firebase-push-notification/firebase-push-notification.service';
  providers: [ ... FirebasePushNotificationService ... ]
  ```
11. Add the provider 'Push' and 'Device' to the '/src/app/app.module.ts':
  ```ts
  import { Device } from '@ionic-native/device';
  import { Push } from '@ionic-native/push';
  providers: [ ... Device, Push ... ]
  ```
12. Add the following code to the page '/src/pages/home/home.ts':
  ```ts
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
  ```
13. Add the following code to the page '/src/pages/home/home.html':
  ```html
  <ion-header>
    <ion-navbar>
      <ion-title>
        Push Notification
      </ion-title>
    </ion-navbar>
  </ion-header>
  
  <ion-content padding>
    <ion-list *ngIf="deviceView" padding no-lines>
      <ion-item>
        <h2>{{deviceView.cordova}}</h2>
        <p>Cordova</p>
      </ion-item>
      <ion-item>
        <h2>{{deviceView.model}}</h2>
        <p>Model</p>
      </ion-item>
      <ion-item>
        <h2>{{deviceView.platform}}</h2>
        <p>Platform</p>
      </ion-item>
      <ion-item>
        <h2>{{deviceView.uuid}}</h2>
        <p>UUID</p>
      </ion-item>
      <ion-item>
        <h2>{{deviceView.version}}</h2>
        <p>Version</p>
      </ion-item>
      <ion-item>
        <h2>{{deviceView.manufacturer}}</h2>
        <p>Manufacturer</p>
      </ion-item>
      <ion-item>
        <h2>{{deviceView.isVirtual}}</h2>
        <p>IsVirtual</p>
      </ion-item>
      <ion-item>
        <h2>{{deviceView.serial}}</h2>
        <p>Serial</p>
      </ion-item>
      <button ion-button block (click)="sendPushNotification()">Send Push Notification</button>
    </ion-list>
  </ion-content>
  ```
14. Build the project:
  ```bash
  $ npm run build
  ```
