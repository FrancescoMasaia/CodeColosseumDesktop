import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadService } from 'src/app/services/upload.service';
@Component({
  selector: 'cc-upload',
  templateUrl: './cc-upload.component.html',
  styleUrls: ['./cc-upload.component.scss']
})
export class CcUploadComponent implements OnInit {

  gameId : string = "";
  hasPassword:boolean = true;
  uploadedFiles:any[]=[];
  submitted:boolean = false;

  uploadData:any={};

  constructor(private router: Router,private uploadService:UploadService ) { }

  ngOnInit(): void {
    this.uploadService.redirectIfGameNotSet()   
    this.hasPassword = this.uploadService.getGame()?.password ?? false
  }

  navigateToNext() {
    if (this.hasPassword&&this.uploadData.password || !this.hasPassword){
      //todo add check that file was uploaded
      //todo check file is an executable
      this.router.navigate(['game/results']);
      return
    }




    if (this.uploadData.password) {
      this.router.navigate(['game/results'])
      return;
  }
  this.submitted = true;
  
  }

}