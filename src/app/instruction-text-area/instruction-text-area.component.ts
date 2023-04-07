import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-instruction-text-area',
  templateUrl: './instruction-text-area.component.html',
  styleUrls: ['./instruction-text-area.component.scss']
})
export class InstructionTextAreaComponent{
 
  @Input() public label: string = ""; 
  @Input() public control?: FormControl;

}
