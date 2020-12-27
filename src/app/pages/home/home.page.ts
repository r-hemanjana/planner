import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

   public folder: string;
  sevenDaysAvailability = [];
  showCalender: boolean;
  date: string;
  month_year:string;
  schedule_list = []
  constructor(
    private navCtrl: NavController,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController
  ) { 
    var d = moment().format("DD MMM YYYY")
    this.month_year = moment().format('MMMM YYYY')
    this.date = moment().format('D-MMM-YYYY')
    this.calculateweek(d, this.date)
  }

  ngOnInit() {
   
  }

  calculateweek(firstdayofweek, date) {
    this.showCalender = false
    this.sevenDaysAvailability = [];
    this.sevenDaysAvailability.push({
      day: moment(firstdayofweek).format('ddd')[0],
      month: moment(firstdayofweek).format('MMM'),
      date: moment(firstdayofweek).format('DD'),
      currentDate: moment(firstdayofweek).format('D-MMM-YYYY'),
      isSelect: false
    })
    for (let i = 1; i < 7; i++) {
      let Temp_Date = moment(firstdayofweek).add('days', i).format('DD-MMM-YYYY');
      this.sevenDaysAvailability.push({
        day: moment(Temp_Date).format('ddd')[0],
        month: moment(Temp_Date).format('MMM'),
        date: moment(Temp_Date).format('DD'),
        currentDate: moment(Temp_Date).format('D-MMM-YYYY'),
        isSelect: false
      })
    }
    this.sevenDaysAvailability.forEach(day => {
      if (day.currentDate == date)
        this.changeday(day)
    });
    //  this.showCalender = false
  }
  
  async changeday(day) {
    this.sevenDaysAvailability.forEach(dayofweek => {
      if (dayofweek.isSelect) {
        dayofweek.isSelect = false
      }
    });
    day.isSelect = true
    await this.getPlan()
   // this.noOfSlootBook = 0
  }

  async getPlan() {
    const loading = await this.loadingController.create();
    await loading.present();
    let date = moment().format('YYYY-MM-DD')
    let time = moment().format("HH:mm")
    this.authService.getSchedule().subscribe(
      async (data) =>{
        await loading.dismiss();
        data.forEach(schedule => {
          let scheObj = {
            name: schedule.name,
            startTime: schedule.fromTime,
            duration: schedule.duration <= 60 ? +schedule.duration : +schedule.duration/60,
            description: schedule.description,
            duration_type: +schedule.duration <= 60 ? 'mins' : 'hrs'
          }
          if(schedule.till != 'Forever' && moment(date, 'YYYY-MM-DD').isBetween(moment(schedule.fromDate, 'YYYY-MM-DD'), moment(schedule.till, 'YYYY-MM-DD'), null, '[]')){
            
            if(schedule.isRepeat && schedule.repeat != 'daily'){
              let weekStr = schedule.repeat.split(":")[1]
              let weekArr = weekStr.split(",")
              if(weekArr.includes(moment().format('ddd'))){
                this.schedule_list.push(scheObj)
              }
            }else{
              this.schedule_list.push(scheObj)
            }
          }else if(schedule.till == 'Forever' && (moment(date, 'YYYY-MM-DD').isAfter(moment(schedule.fromDate, ), 'day') || moment(date).isSame(schedule.fromDate), 'day')){
            if(schedule.isRepeat && schedule.repeat != 'daily'){
              let weekStr = schedule.repeat.split(":")[1]
              let weekArr = weekStr.split(",")
              if(weekArr.includes(moment().format('ddd'))){
                this.schedule_list.push(scheObj)
              }
            }else{
              this.schedule_list.push(scheObj)
            }
          }
          console.log(this.schedule_list)
        });
      },
      async (res) =>{
        await loading.dismiss();
      }
    )
  }
  
}
