import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormControlState } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

import { Observable, of, filter, debounceTime } from 'rxjs';
/**
 * Data about an Image
 */
interface ImageMetaData {
  width: number;
  height: number;
  url: string;
  correctionFactor?: ImageCorrectionFactor;
}

/**
 * Unit of measure
 */
interface Unit {
  value: string;
  viewValue: string;
  image: ImageMetaData;
}


/**
 * Correction factor to be applied to an image
 */
interface ImageCorrectionFactor {
  width: number;
  height: number;
}

const METRIC_UNITS: number = 0;
const US_UNITS: number = 1;

const DEBOUNCE_TIME = 1000;

@Component({
  selector: 'app-cricut-image-corrector',
  templateUrl: './cricut-image-corrector.component.html',
  styleUrls: ['./cricut-image-corrector.component.scss']
})

export class CricutImageCorrectorComponent implements OnInit {


  stepNumber: number = 0;
  instructionList: string[] = [
    // 1 - Select Units
    `- Select the units used on your machine.
- Click [NEXT]`,

    // 2. - Download
    `- Click the download icon below
- Click [NEXT]`,

    // Cut the calibration piece
    `- Prepare Cricut Design Space for calibration
    - Open Design Space
    - Create a new project
    - Click on the left side 'stack' menu
    - Select 'Upload'
    - Click on 'Upload Image'
- Select the calibration image
    - Navigate to your Download folder
    - Select the downloaded image
    - Click on 'Upload'
- Add the image to the Canvas
    - Select the image from the upload list
    - Click on 'Add to Canvas'
- Confirm that the image is loaded with the correct dimensions
    - Compare with the calibration image dimensions
- Cut using the same material and settings as the target cut
- Click [NEXT]`,

    // Measure cut errors
    `- Measure the width and height of the calibration cut.
- Enter the dimensions below
- Note calibration correction factors
  - The correction factors will be multiplied by the image dimensions to produce the corrected cut
- Click [NEXT]`,
    // Correct target image
`- Open your target project in Design Space 
- Click on the image to be cut
- Enter the dimensions of the target piece as noted in the Design Space
  - The corrected iamge dimensions will be calculated
- 'Unlock the image proportions by clicking on the small lock icon above the width and height
- Enter the corrected width and height from below
- Cut the piece using the same material and settings used to calibrate`

  ];

  instructions: string = "test";

  imageSize = 1100;
  units: Unit[] = [
    { value: "si", viewValue: "Metric (mm)", image: { width: 150, height: 150, url: "assets/150x150mmCalibration.svg" } },
    { value: "us", viewValue: "US (in)", image: { width: 6, height: 6, url: "assets/6x6inCalibration.svg" } }
  ];


  defaultUnits = this.units[0];
  calibrationImage: ImageMetaData;
  calibrationCutImage: ImageMetaData;
  correctionFactor: ImageCorrectionFactor;
  originalImage: ImageMetaData;
  correctedImage: ImageMetaData;


  // Controls - defined here for ease of access
  selectedUnitsControl: FormControl<Unit | null> = new FormControl(this.units[0]);

  instructionsControl: FormControl<string | null> = new FormControl(this.instructions);

  tabControl: FormControl<number | null> = new FormControl(this.stepNumber);

  // TODO: refactor to common control
  private readonly calibrationGroup = new FormGroup({
    width: new FormControl(0, Validators.required),
    height: new FormControl(0, Validators.required),
  });

  private readonly calibrationCutGroup = new FormGroup({
    width: new FormControl(0, Validators.required),
    height: new FormControl(0, Validators.required),
  });

  private readonly correctionFactorGroup = new FormGroup({
    width: new FormControl(1.00),
    height: new FormControl(1.00)
  });

  private readonly originalImageGroup = new FormGroup({
    width: new FormControl(1.00),
    height: new FormControl(1.00)
  });

  private readonly correctedImageGroup = new FormGroup({
    width: new FormControl(1.00),
    height: new FormControl(1.00)
  });



  // Entry form
  calibrationForm = new FormGroup({
    selectedUnits: new FormControl(0, Validators.required),
    calibrationGroup: this.calibrationGroup,
    calibrationCutGroup: this.calibrationCutGroup,
    correctionFactorGroup: this.correctionFactorGroup,
    originalImageGroup: this.originalImageGroup,
    correctedImageGroup: this.correctedImageGroup
  });


  /**
  * Form constructor - initialize instance fields
  * @param fb 
  */
  constructor(private fb: FormBuilder) {

    this.calibrationImage = this.defaultUnits.image;
    this.calibrationCutImage = { width: this.calibrationImage.width, height: this.calibrationImage.height, url: "" };
    this.correctionFactor = { width: 1.0, height: 1.0 };
    this.originalImage = this.calibrationCutImage;
    this.correctedImage = this.calibrationCutImage;

    this.defaultUnits = this.units[METRIC_UNITS];
    this.calibrationGroup.patchValue(this.calibrationImage);
    this.calibrationCutGroup.patchValue(this.calibrationImage);

    this.updateInstructions(0);
  }
  /**
 * Initialize variables and stream observers when 
 */
  ngOnInit(): void {

    this.calibrationGroup.valueChanges.pipe().subscribe(value => {
      console.debug(value);
    });


    // Listen for entries in the Calibration cut tab
    this.calibrationCutGroup.valueChanges.pipe(
      filter(() => this.calibrationCutGroup.valid),
      debounceTime(DEBOUNCE_TIME),
    ).subscribe(values => {
      this.updateCorrectionFactor(values as ImageMetaData);
    });
       // Listen for entries in the image correction tab
       this.originalImageGroup.valueChanges.pipe(
        filter(() => this.originalImageGroup.valid),
        debounceTime(DEBOUNCE_TIME),
      ).subscribe(values => {
        this.correctedImageGroup.patchValue(this.correctImage(values as ImageMetaData));
      });
  }

  /**
   * Correct the image meta data using the correctFactor values
   * @param originalImage the original image to correct
   * @returns a corrected image 
   */
  correctImage(originalImage: ImageMetaData): ImageMetaData {
    var correctedImage:ImageMetaData = {width: 0, height: 0, url:""};
    correctedImage.width = originalImage.width * this.correctionFactor.width; 
    correctedImage.height = originalImage.height * this.correctionFactor.height; 
    return correctedImage; 
  }


/**
 * Update the instructions card with the text defined in instructionList
 * @param stepNumber the current step in the workflow
 */
  private updateInstructions(stepNumber: number) {
    this.instructions = this.instructionList[stepNumber];
    this.instructionsControl.setValue(this.instructions);
  }

/**
 * Increment the workflow step
 */
  nextStep(): void {

    this.stepNumber++;
    this.updateInstructions(this.stepNumber);

  }
/**
 * Decrement the workflow step
 */
  previousStep(): void {

    this.stepNumber--;
    this.updateInstructions(this.stepNumber);

  }

/**
 * Calculate the correction factors using the cut image compared with the calibration image
 * @param cutImage the dimensions of the cut image
 */
  private updateCorrectionFactor(cutImage: ImageMetaData) {
    this.correctionFactor = this.calculateCorrectionFactor(this.calibrationImage, cutImage);
    this.correctionFactorGroup.patchValue(this.correctionFactor);
  }
  /**
   * Calculate the correction factor based on the expected image measurements ( width, height) and the expected image measurements
   * @param expected the calibrarion ImageMetaData
   * @param actual the actual ImageMetaData 
   * @returns the correctionFactor
   */
  calculateCorrectionFactor(expected: ImageMetaData, actual: ImageMetaData): ImageCorrectionFactor {
    var correctionFactor: ImageCorrectionFactor = { width: 1.0, height: 1.0 };
    correctionFactor.width = expected.width / actual.width;
    correctionFactor.height = expected.width / actual.height;
    return correctionFactor;
  }


  /**
   * Set the expected size of the calibration square as contained in the Unit
   */
  unitsChanged(unitChange: MatSelectChange) {
    const units: Unit | null = this.selectedUnitsControl.value;
    if (units) {
      this.setUnits(units);
    }
  }

  /**
   * Set the units variables in the various groups and controls 
   * @param units to use - Metric or US
   */
  private setUnits(units: Unit) {
    this.defaultUnits = units;
    this.calibrationImage = this.defaultUnits.image;
    this.calibrationGroup.patchValue(this.defaultUnits.image);
    this.calibrationCutGroup.patchValue(this.defaultUnits.image);
  }
}
