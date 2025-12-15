Canvas = null;

AllTrialData = [];

// TrialDataTemplate = {
//     'trialID' : 1,
//     'trialType' : 'default',
//     'trialData' : TRIALDATA,
// }

function CreateTrialData(trialType) {
    var trialData = {};
    trialData['trialID'] = AllTrialData.length + 1;
    trialData['trialType'] = trialType;

    return trialData;
}

function PushTrialData(trialData) {
    AllTrialData.push(trialData);
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
    //await webgazer.resume();
    console.log(`Webgazer resumed. Called by "${caller}"`);
}

async function PauseWebgazer(caller = 'function') {
    //await webgazer.pause();
    console.log(`Webgazer paused. Called by "${caller}"`);
}



/* ----------------------------------------------------------------------------------------------- */

WelcomePageInstruction =
    `Position your head so that the webcam has a good view of your eyes.<br/>
Center your face in the box and look directly towards the camera.<br/>
It is important that you try and keep your head reasonably still throughout the experiment, so please take a moment to adjust your setup to be comfortable.<br/>
When your face is centered in the box and the box is green, you can click to continue.<br/>
`

function ShowWelcomePage() {
    ShowInstruction(WelcomePageInstruction, AfterWelcomPage, 'Continue', true);
}

async function AfterWelcomPage() {
    await ReadTheConfigs(); //Get prepared for the experiment.

    // var videoContainer = document.querySelector('#webgazerVideoContainer');
    // videoContainer.style.display = 'none';
    await PauseWebgazer('AfterWelcomPage');
    StartCalibration();
}


window.onload = async function () {
    await webgazer.setTracker("TFFacemesh");// ‘clmtrackr’ ‘js_objectdetect’ ‘trackingjs’
    await webgazer.setRegression("ridge"); //‘ridge’ ‘weightedRidge' 'threadedRidge'
    webgazer.applyKalmanFilter(true);

    webgazer.clearData(); //need clear all data collected

    GetCanvas();
    ShowWelcomePage();

    await webgazer.setGazeListener(function(data, elapsedTime){
        
    }).saveDataAcrossSessions(true).begin();

    webgazer.showVideo(true);  // id = "webgazerVideoFeed". webgazerVideoContainer
    webgazer.showPredictionPoints(true);

    SetInstructionButtonDisable(false);

}


window.onbeforeunload = function () {
    webgazer.clearData();
    webgazer.end();
}
