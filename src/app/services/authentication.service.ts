import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;
const TOKEN_KEY = 'my-token';
 
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { nextTick } from 'process';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  token='';
  //url="https://reyya-planner-node-app.herokuapp.com";
  url="http://localhost:3000"
  constructor(private http: HttpClient) 
  { 
    this.loadToken();
  }

  async loadToken(){
    const token = await Storage.get({key: TOKEN_KEY});
    if(token && token.value){
      console.log('set token:', token.value)
      this.token = token.value
      this.isAuthenticated.next(true)
    }else{
      this.isAuthenticated.next(false)
    }
  }

  login(credentials: {email, password}):Observable<any> { 
    return this.http.post(`${this.url}/users/login`, credentials).pipe(
      map((data:any) => data.token),
      switchMap(token => {
        return from(Storage.set({key: TOKEN_KEY, value: token}))
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })
    )
  }

  signup(credentials: {email, password}):Observable<any> { 
    credentials['name'] = credentials.email.split("@")[0]
    return this.http.post(`${this.url}/users`, credentials).pipe(
      map((data:any) => data.token),
      switchMap(token => {
        return from(Storage.set({key: TOKEN_KEY, value: token}))
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })
    )
  }

  saveSchedule(scheduleGroup : {name, fromDate, fromTime, duration, till, alarmOn, isRepeat, repeat, description}):Observable<any> { 
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${this.token}`);
    return this.http.post(`${this.url}/schedule`, scheduleGroup, {headers})
  }
  
  logout(): Promise<void> {
    this.isAuthenticated.next(false);
    return Storage.remove({key: TOKEN_KEY});
  }
 
  getSchedule():Observable<any> { 
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${this.token}`);
    return this.http.get(`${this.url}/schedule`, {headers})
  }

}
