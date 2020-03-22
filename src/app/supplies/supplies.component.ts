import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { SuppliesService } from '../services/supplies.service';
import { _ } from 'underscore';
import {Router} from "@angular/router"

@Component({
  selector: 'app-supplies',
  templateUrl: './supplies.component.html',
  styleUrls: ['./supplies.component.scss']
})
export class SuppliesComponent implements OnInit {
  supplyList: FormGroup;
  pickupList: FormGroup;
  pickupLoading: boolean = false;
  submitLoading: boolean = false;
  supplyArray: any;
  singleSupplyItem: any;
  isEditing: boolean;
  item: string;
  newValue: string;
  items = [];
  payments: any = ['Cash', 'Check', 'Donation'];
  constructor(private supplyService: SuppliesService, private router: Router) { }

  ngOnInit() {
    this.supplyList = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required]),
      address1: new FormControl('', [Validators.required]),
      address2: new FormControl(''),
      zipCode: new FormControl('', [Validators.required]),
      paymentType: new FormControl('', [Validators.required]),
      supplyDescription: new FormControl('', [Validators.required]),
      item: new FormControl(''),
      newValue: new FormControl('')
    });
    this.pickupList = new FormGroup({
      pickupName: new FormControl('', [Validators.required]),
      pickupEmail: new FormControl('', [Validators.required]),
      pickupPhoneNumber: new FormControl('', [Validators.required])
    });
    this.supplyService.onGetSupplyLists().subscribe((data: any) => {
      this.supplyArray = data.data;
    })
    
  }

  get f() { return this.supplyList.controls; }
  get d() { return this.pickupList.controls; }

  onSupplySubmit(){
    if (this.supplyList.invalid) {
      return;
  }
    this.submitLoading = true;
    const supplyList = {
      personalInfo: this.supplyList.value,
      supplyList: this.items
    }
    return this.supplyService.onSubmitSupplies(supplyList).subscribe(data => {
      this.submitLoading = false;
      location.reload()
    })
    
  }

  onChangeItem(value){
    this.items[value].name = this.newValue;
  }


  onAddItem(){
    if(this.item === ''){
      return;
    }
    let count = this.randomKey();
    this.items.forEach(data => {
      while(data.id === count){
        count = this.randomKey()
      }
    });

    this.items.push({name: this.item, pickedUp: false, id: count});
    this.item = '';
  }

  randomKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  onEditItem(item){
    item.isEditing = true;
  }

  onDeleteItem(x) {
    this.items.splice(x, 1)
  }

  onSupplyClick(value){
     const itemNeeded = _.where(this.supplyArray, {_id: value});
     this.singleSupplyItem = itemNeeded[0];
  }

  checkCheckBoxvalue(event, i){
    this.singleSupplyItem.supplyList[i].pickedUp = event.target.checked;
  }

  onPickupSubmit(value) {
    if (this.pickupList.invalid) {
      return;
    }
    this.pickupLoading = true;
    const pickupData = {
      id: value,
      pickupList: this.pickupList.value,
      pickupInfo: this.singleSupplyItem
    }
    console.log(pickupData);
    return this.supplyService.onPickupSupplies(pickupData).subscribe(data => {
      this.pickupLoading
      location.reload()
    })
  }
}
