import { Component } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { EventSettingsModel, View } from '@syncfusion/ej2-angular-schedule';
import {L10n, loadCldr} from '@syncfusion/ej2-base';

@Component({
  selector: 'app-calendar',
  template: '<ejs-schedule [eventSettings]="eventObject" [timeFormat]="timeFormat"  [dayNames]="dayNames"></ejs-schedule>',
 // templateUrl: './calendar.component.html'
})
export class CalendarComponent {

  viewDate: Date = new Date();
  public timeFormat: string = 'HH:mm';
  eventObject: EventSettingsModel = {
    dataSource: [{
      EndTime: new Date(2024, 6, 7, 6, 30),
      StartTime: new Date(2024, 6, 7, 4, 0),
      Subject: 'Meeting',
      IsAllDay: false,
      IsReadOnly: true,
    }],
    fields: {
      subject: { name: 'Subject', title: 'Naziv posla'},
      startTime: { name: 'StartTime', title: 'Vreme početka'},
      endTime: { name: 'EndTime', title: 'Procenjeno vreme završetka'},
      isAllDay: { name: 'IsAllDay' },
      location: { name: 'Location' },
      description: { name: 'Description' },
    },
  };


  
}
