import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CricutImageCorrectorComponent } from './cricut-image-corrector/cricut-image-corrector.component';

const routes: Routes = [
  { path: 'cricut-image-corrector', component: CricutImageCorrectorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
