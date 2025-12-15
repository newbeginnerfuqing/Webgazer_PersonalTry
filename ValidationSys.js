ValidationPointPos = [[30, 30], [70, 30], [30, 70], [70, 70]]

CurValidationPoint = null;
ValidationPointList = [];

ValidationLastTimerID = 0;

isValidationRecord = false;
Validation_PredPointRecord = [];
VALIDATION_DIST_THRESHOLD = 200
VALIDATION_ACC_THRESHOLD = 0.6

ValidationInstruction =
    `This is the validation part of this experiment.<br/>
Please read this instruction carefully, this would help us with the accuracy of the experiment.<br/><br/>
There will be several dots displayed on the screen, please gaze on the dots as soon as possible.<br/>
Notice!!! You <strong>do not</strong> need to click on the dots! The dots will automatically show up and disappear! <br/>
The <strong>only thing</strong> need to do is <strong>gaze</strong> on the dot.<br/>`;


// instruction --> click 'OK' --> Start Validation( Create points -> Addgazelistener -> resume + showPoint)
function StartValidation() {
    ShowInstruction(ValidationInstruction, PrepareValidation, 'Copy that!');
}


async function PrepareValidation() {
    AddValidationGazeListener();
    CreateAllValidationPoint();

    StartValidation_Internal();
}


function AddValidationGazeListener() {
    webgazer.setGazeListener(function (data, elapsedTime) {
        if (!isValidationRecord) {
            return;
        }

        if (CurValidationPoint == null || data == null) {
            return;
        }

        tarRect = CurValidationPoint.getBoundingClientRect();
        tarX = tarRect.left;
        tarY = tarRect.top;

        x = data.x;
        y = data.y;

        Validation_PredPointRecord.push({ 'tarX': tarX, 'tarY': tarY, 'x': x, 'y': y });

    });
}


function CreateAllValidationPoint() {
    ClearCanvas();

    var canvas = GetCanvas();
    var canvasRect = canvas.getBoundingClientRect();

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


async function ShowNextValidationPoint() {
    isValidationRecord = false;

    if (ValidationPointList.length == 0) {
        await PauseWebgazer('ShowNextValidationPoint');
        webgazer.clearGazeListener();

        var accuracy = CalCulateValidationResult();

        if (accuracy >= VALIDATION_ACC_THRESHOLD) {
            ChoosePictureTrials();
        } else {
            alert(`Acc is ${accuracy}, Need recalibration!!!`);
            StartRecalibration();
        }

        return;
    }

    CurValidationPoint = ValidationPointList.shift();
    CurValidationPoint.style.display = 'block';

    ValidationLastTimerID = setTimeout(() => {
        clearTimeout(ValidationLastTimerID);
        //webgazer.resume();

        isValidationRecord = true;

        ValidationLastTimerID = setTimeout(() => {
            clearTimeout(ValidationLastTimerID);
            CurValidationPoint.style.display = 'none';
            ShowNextValidationPoint();
        }, 4000);

    }, 1000);
}


needDownloadValidation = true;

function CalCulateValidationResult() {
    let csvContent = 'tarX,tarY,x,y,distance,threshold\n';

    if (Validation_PredPointRecord.length == 0) {
        console.log('Do not record any validation eyetracking data.');
        alert('Do not record any validation eyetracking data.');
        return -1;
    }

    var InThreshold = []

    Validation_PredPointRecord.forEach(record => {
        var dist = calculateDistance(record.tarX, record.tarY, record.x, record.y);

        let isIn = 0;
        if (dist <= VALIDATION_DIST_THRESHOLD) {
            isIn = 1;
        }

        InThreshold.push(isIn);

        csvContent += `${record.tarX},${record.tarY},${record.x},${record.y},${dist},${VALIDATION_DIST_THRESHOLD}\n`;

    });

    var inCount = InThreshold.filter(x => x === 1).length;
    var accuracy = inCount / InThreshold.length;

    if (needDownloadValidation) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `coordinates_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';

        // 添加到DOM并触发点击
        document.body.appendChild(link);
        link.click();
    }

    return accuracy;
}

function calculateDistance(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}


