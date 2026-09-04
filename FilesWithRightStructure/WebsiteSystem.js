Canvas = null;

Participants_Name = "";
Participants_ID = "";
Experiment_Number = 0;

AllTrialData = [];

// TrialDataTemplate = {
//     'trialID' : 1,
//     'trialType' : 'default',
//     'trialData' : TRIALDATA,
// }

function CreateTrialData(trialType) {
    var trialData = {};
    var trialID = AllTrialData.length + 1;
    trialData['trialID'] = trialID;
    trialData['trialType'] = trialType;

    console.log(`CreateTrialData() : trailID is ${trialID}, trialType is ${trialType}.`);
    return trialData;
}

function PushTrialData(trialData) {
    var Data = deepCloneStructured(trialData);
    AllTrialData.push(Data);
}

function deepCloneStructured(obj) {
    // Check browser available
    if (typeof structuredClone !== 'undefined') {
        try {
            return structuredClone(obj);
        } catch (error) {
            console.warn('structuredClone 失败，降级到递归方法');
            return deepClone(obj);
        }
    } else {
        console.warn('浏览器不支持 structuredClone，使用递归方法');
        return deepClone(obj);
    }
}

function GetCanvas() {
    if (Canvas == null) {
        Canvas = this.document.querySelector('.ExperimentCanvas');
    }
    return Canvas;
}

function ClearCanvas() {
    if (Canvas == null) {
        Canvas = this.document.querySelector('.ExperimentCanvas');
    }

    Canvas.innerHTML = '';
    /*
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    */
}

async function ResumeWebgazer(caller = 'function') {
    await webgazer.resume();
    console.log(`Webgazer resumed. Called by "${caller}"`);
}

async function PauseWebgazer(caller = 'function') {
    await webgazer.pause();
    console.log(`Webgazer paused. Called by "${caller}"`);
}

function SetBasicInfomation(name, id, experimentNumber) {
    Participants_Name = name;
    Participants_ID = id;
    Experiment_Number = experimentNumber;
}

/* ----------------------------------------------------------------------------------------------- */


window.onload = async function () {
    webgazer.setTracker("TFFacemesh");// TFFacemesh
    webgazer.setRegression("ridge"); //‘ridge’ ‘weightedRidge' 'threadedRidge'
    webgazer.applyKalmanFilter(true);

    webgazer.clearData(); //need clear all data collected

    GetCanvas();
    ShowWelcomePage();

    await webgazer.setGazeListener(function (data, elapsedTime) { }).begin();
    webgazer.showPredictionPoints(false);

    SetInstructionButtonDisable(false);

}


window.onbeforeunload = function () {
    webgazer.clearData();
    webgazer.end();
}


async function EndExperiment(prefix = "All") {
    if (AllTrialData.length == 0) {
        alert('Failed to record the experiment.');
        return;
    }

    var jsonStr = JSON.stringify(AllTrialData);

    await DownloadJSON(jsonStr, `${Participants_Name}_${Participants_ID}_${Experiment_Number}_${prefix}_ExperimentData.json`);

    console.log("Experiment data saved.");
    alert("You have finished the Experiment.");

}

function DownloadJSON(data, filename = 'data.json') {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
}
