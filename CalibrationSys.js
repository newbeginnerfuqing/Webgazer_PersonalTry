
CalibrationPointPos = [[30, 10], [50, 10], [90, 10],
[10, 50], [50, 50], [90, 50],
[10, 90], [50, 90], [90, 90]];

CurCalibratinoPoint = []

MAX_CLICK_TIME = 5;
ClickColor = { 0: 'black', 1: 'blue', 2: 'green', 3: 'orange', 4: 'red', 5: 'white' };

CalibrationInstruction =
    `This is the calibration part of this experiment.<br/>
Please read this instruction carefully, this would help us with the accuracy of the experiment.<br/>
There will be several dots displayed on the screen, please gaze and click on the dots.<br/>
Every dot should be clicked ${MAX_CLICK_TIME} times.<br/>`;

RecalibrationInstruction =
    `This is the re-calibration part of this experiment.<br/>
Please read this instruction carefully, this would help us with the accuracy of the experiment.<br/>
There will be several dots displayed on the screen, please gaze and click on the dots.<br/>
Every dot should be clicked ${MAX_CLICK_TIME} times.<br/>`;


// instruction --> click 'OK' --> Start Calibration
function StartCalibration() {
    ShowInstruction(CalibrationInstruction, CreateAllCalibrationPoint, 'Got it!');
}

function StartRecalibration(){
    ShowInstruction(RecalibrationInstruction, CreateAllCalibrationPoint, 'Got it!');
}


//Create and start calibration trial!
async function CreateAllCalibrationPoint() {
    ClearCanvas();

    var canvas = GetCanvas();
    var canvasRect = canvas.getBoundingClientRect();
    CalibrationPointPos.forEach(pointPos => {
        var pointEle = document.createElement('div');
        canvas.appendChild(pointEle);

        pointEle.style.borderRadius = '50%'
        pointEle.style.width = '20px';
        pointEle.style.height = '20px';

        pointEle.style.position = 'absolute';
        pointEle.style.left = `${canvasRect.width * pointPos[0] / 100}px`;
        pointEle.style.top = `${canvasRect.height * pointPos[1] / 100}px`;

        pointEle.dataset.clickNum = 0;
        pointEle.style.backgroundColor = ClickColor[pointEle.dataset.clickNum];
        pointEle.style.cursor = 'pointer';

        pointEle.style.display = 'none';

        CurCalibratinoPoint.push(pointEle);
    });

    await ResumeWebgazer('CreateAllCalibrationPoint');
    ShowNextCalibrationPoint();

}

async function ShowNextCalibrationPoint() {
    if (CurCalibratinoPoint.length == 0) {
        /* Notice !
        Here call page with button to notice participants we are going to validate!
        */
        await PauseWebgazer('ShowNextCalibrationPoint')
        StartValidation();
        return;
    }

    var CurButton = CurCalibratinoPoint.shift();

    CurButton.style.display = 'block';
    CurButton.addEventListener('click', function () {
        OnClickCalibrationPoint(CurButton);
    });
}


function OnClickCalibrationPoint(button) {
    var clickTime = button.dataset.clickNum
    clickTime++;

    button.dataset.clickNum = clickTime;
    button.style.backgroundColor = ClickColor[clickTime];

    if (clickTime == MAX_CLICK_TIME) {
        button.style.display = 'none';
        ShowNextCalibrationPoint();
    }
}