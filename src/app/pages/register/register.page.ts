import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  credentials: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  async signup() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.signup(this.credentials.value).subscribe(
      async (res) =>{
        await loading.dismiss();
        this.router.navigateByUrl('/home', { replaceUrl: true});
      },
      async (res) =>{
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'signup failed',
          message: res.console.error.error,
          buttons: ['OK'],
          
        });

        await alert.present();
      }
    )
  }

}
