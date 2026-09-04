PointPos_Simple = [[30, 30], [70, 30], [30, 70], [70, 70], [50, 50]]
PointPos_Irregular = [[50, 50], [80, 30], [30, 50], [50, 20], [50, 75], [75, 60], [30, 30], [80, 40], [30, 70], [50, 50]]

CurValidationPoint = null;
ValidationPointList = [];

ValidationLastTimerID = 0;
SaccadeIgnoreTime = 300;
GazeRecordTime = 2500;
EndIgnoreTime = 200;

isValidationRecord = false;
Validation_PredPointRecord = [];
VALIDATION_DIST_THRESHOLD = 200
VALIDATION_ACC_THRESHOLD = 0.6

isSaccadeRecord = false;
SaccadeData_PredPointRecord = [];

ValidationInstruction =
    `This is the validation part of this experiment.<br/>
Please <strong>read this instruction carefully</strong>, this would help us with the <strong>accuracy</strong> of the experiment.<br/><br/>
There will be several dots displayed on the screen, please gaze on the dots as soon as possible.<br/>
Notice!!! You <strong>do not</strong> need to click on the dots! The dots will automatically show up and disappear! <br/>
The <strong>only thing</strong> need to do is <strong>gaze</strong> on the dot.<br/>`;

ValidationTrialData = null;

// instruction --> click 'OK' --> Start Validation( Create points -> Addgazelistener -> resume + showPoint)
function StartValidation() {
    ShowInstruction(ValidationInstruction, PrepareValidation, 'Copy that!');

    ValidationTrialData = CreateTrialData('ValidationPage');
    ValidationTrialData["Dist_Threshold"] = VALIDATION_DIST_THRESHOLD;
    ValidationTrialData["Acc_Threshold"] = VALIDATION_ACC_THRESHOLD;
}


async function PrepareValidation() {
    ResetValidation();

    AddValidationGazeListener();
    CreateAllValidationPoint();

    StartValidation_Internal();
}


function AddValidationGazeListener() {
    webgazer.setGazeListener(function (data, elapsedTime) {
        if (CurValidationPoint == null || data == null) {
            return;
        }

        if (isValidationRecord) {
            ValidationGazeListener(data, elapsedTime);
        }

        if (isSaccadeRecord) {
            SaccadeDataGazeListener(data, elapsedTime);
        }

    });
}

function ValidationGazeListener(data, elapsedTime) {
    var tarRect = CurValidationPoint.getBoundingClientRect();
    var tarX = tarRect.left;
    var tarY = tarRect.top;

    var x = data.x;
    var y = data.y;

    var dist = calculateDistance(tarX, tarY, x, y);
    var timeStamp = Date.now();

    Validation_PredPointRecord.push({ 'tarX': tarX, 'tarY': tarY, 'x': x, 'y': y, 'distance': dist, 'time': timeStamp });
}

function calculateDistance(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}


function SaccadeDataGazeListener(data, elapsedTime) {
    var tarRect = CurValidationPoint.getBoundingClientRect();
    var tarX = tarRect.left;
    var tarY = tarRect.top;

    var x = data.x;
    var y = data.y;

    var dist = calculateDistance(tarX, tarY, x, y);
    var timeStamp = Date.now();

    SaccadeData_PredPointRecord.push({ 'tarX': tarX, 'tarY': tarY, 'x': x, 'y': y, 'distance': dist, 'time': timeStamp });

}


function CreateAllValidationPoint() {
    ClearCanvas();

    var canvas = GetCanvas();
    var canvasRect = canvas.getBoundingClientRect();

    // ValidationPointPos = PointPos_Simple;
    ValidationPointPos = PointPos_Irregular;

    ValidationPointPos.forEach(pointPos => {
        var pointEle = document.createElement('div');
        canvas.appendChild(pointEle);

        pointEle.style.borderRadius = '50%'
        pointEle.style.width = '20px';
        pointEle.style.height = '20px';

        pointEle.style.position = 'absolute';
        pointEle.style.left = `${canvasRect.width * pointPos[0] / 100}px`;
        pointEle.style.top = `${canvasRect.height * pointPos[1] / 100}px`;

        pointEle.style.backgroundColor = 'black';
        pointEle.style.display = 'none';

        ValidationPointList.push(pointEle);

    });


}

async function StartValidation_Internal() {
    await ResumeWebgazer('StartValidation_Internal');

    ShowNextValidationPoint();
}

function ResetValidation() {
    CurValidationPoint = null;
    ValidationPointList = [];

    isValidationRecord = false;
    isSaccadeRecord = false;
    Validation_PredPointRecord = [];
}


async function ShowNextValidationPoint() {
    isValidationRecord = false;
    isSaccadeRecord = true;

    if (ValidationPointList.length == 0) {
        EndValidation();
        return;
    }

    CurValidationPoint = ValidationPointList.shift();
    CurValidationPoint.style.display = 'block';

    ValidationLastTimerID = setTimeout(() => {
        clearTimeout(ValidationLastTimerID);

        //after SaccadeIgnoreTime
        isValidationRecord = true;
        isSaccadeRecord = false;

        ValidationLastTimerID = setTimeout(() => {
            clearTimeout(ValidationLastTimerID);

            //after GazeRecordTime
            isValidationRecord = false;
            isSaccadeRecord = true;

            ValidationLastTimerID = setTimeout(() => {
                clearTimeout(ValidationLastTimerID);

                //after EndIgnoreTime
                CurValidationPoint.style.display = 'none';
                ShowNextValidationPoint();
            }, EndIgnoreTime);
        }, GazeRecordTime);

    }, SaccadeIgnoreTime);
}

OnlyCheckValidationResult = false;
NeedCheckAccuracy = false;
async function EndValidation() {
    isSaccadeRecord = false; //need to stop record as the validation ended

    await PauseWebgazer('ShowNextValidationPoint');
    webgazer.clearGazeListener();

    var accuracy = CalCulateValidationResult();
    console.log(`The validation accuracy is ${accuracy}`);

    ValidationTrialData['Validation_Accuracy'] = accuracy;
    ValidationTrialData['Validation_GazeData'] = Validation_PredPointRecord;

    PushTrialData(ValidationTrialData);

    if (OnlyCheckValidationResult) {
        alert(`Acc is ${accuracy}.`);

        EndExperiment("CheckValidation");
        return;
    }

    if (!NeedCheckAccuracy) {
        ChoosePictureTrials();
        return;
    }

    if (accuracy >= VALIDATION_ACC_THRESHOLD) {
        ChoosePictureTrials();
        return;
    } else {
        alert(`Acc is ${accuracy}, Need recalibration!!!`);
        StartRecalibration();
        return;
    }
}



function CalCulateValidationResult() {
    let csvContent = 'tarX,tarY,x,y,distance,threshold\n';

    if (Validation_PredPointRecord.length == 0) {
        console.log("Havn't record any validation eyetracking data.");
        alert("Havn't record any validation eyetracking data.");
        return -1;
    }

    var InThreshold = []

    Validation_PredPointRecord.forEach(record => {
        var dist = record.distance;

        let isIn = 0;
        if (dist <= VALIDATION_DIST_THRESHOLD) {
            isIn = 1;
        }

        InThreshold.push(isIn);

        csvContent += `${record.tarX},${record.tarY},${record.x},${record.y},${dist},${VALIDATION_DIST_THRESHOLD}\n`;

    });

    var inCount = InThreshold.filter(x => x === 1).length;
    var accuracy = inCount / InThreshold.length;

    return accuracy;
}