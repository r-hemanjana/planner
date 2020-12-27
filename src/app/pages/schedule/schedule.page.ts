import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import * as moment from 'moment';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {

  scheduleGroup = {
    name: '',
    fromDate: '',
    fromTime: '',
    duration: '30',
    till: 'Forever',
    alarmOn: false,
    isRepeat: false,
    repeat: '',
    description: []
  }
  //min = moment().format('YYYY-MM-DD')
  //max = moment().add(10, 'y').format('YYYY-MM-DD')
  tillOptions = [
    {name:'Forever', value:'Forever'},
    {name:'Until a date', value:'until'},
  ]
  days = [{day:'Sun', isActive:false}, 
  {day:'Mon', isActive:false}, 
  {day:'Tue', isActive:false}, 
  {day:'Wed', isActive:false}, 
  {day:'Thr', isActive:false}, 
  {day:'Fri', isActive:false}, 
  {day:'Sat', isActive:false}, 
  ]

  tillmediatortext='Forever'
  tillmediatorDate = moment().format('YYYY-MM-DD')
  repeatOptions = ['daily', 'weekly']
  repeatSelected='daily'
  wantRepeat = false;
  line="inset";
  detail = "";
  enableAddDesc = false;
  constructor(
    private navCtrl: NavController,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController
  ) { }
  ngOnInit() {
    this.scheduleGroup.fromDate = moment().format('YYYY-MM-DD')
    this.scheduleGroup.fromTime = moment().format('HH:mm')
  }

  close(){
    this.navCtrl.back()
  }

  createSchedule(){
    
  }

  modifyTill(){
    console.log(this.tillmediatortext)
    if (this.tillmediatortext == 'Forever'){
      this.scheduleGroup.till = this.tillmediatortext
    }else{
      this.scheduleGroup.till = this.tillmediatorDate
    }
  }

  changeline(){
    this.repeatSelected == 'weekly' ? this.line='none' : this.line='inset'
  }

  addDesc(){
    this.scheduleGroup.description.push({ detail:this.detail })
    this.detail = ''
    this.enableAddDesc = false
  }

  async Save() {
    if(this.scheduleGroup.isRepeat && this.repeatSelected == 'daily'){
      this.scheduleGroup.repeat = 'daily'
    }else{
      this.scheduleGroup.repeat = 'weekly:'
      this.days.forEach(day => {
        if(day.isActive){
          this.scheduleGroup.repeat += day.day +","
        }
      })
      this.scheduleGroup.repeat = this.scheduleGroup.repeat.substr(0, this.scheduleGroup.repeat.length-1)
    }
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.saveSchedule(this.scheduleGroup).subscribe(
      async (res) =>{
        await loading.dismiss();
        this.navCtrl.back();
        const alert = await this.alertController.create({
          header: 'Schedule Created!',
          buttons: ['OK'],
        });
       
      },
      async (res) =>{
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Creation Failed',
          message: res.console.error.error,
          buttons: ['OK'],
          
        });

        await alert.present();
      }
    )
  }

}
