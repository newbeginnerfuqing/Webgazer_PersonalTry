const TLKey = 'q'
const TRKey = 'p'
const BLKey = 'a'
const BRKey = 'l'

KeyPicDic = {};

PicRoleDic = {};

//
IsAudioLoaded = false;
IsAudioStart = false;
IsAudioEnd = false;

CurAudio = new Audio();
AudioTimerID = 0;

AUDIO_WAIT_TIME = 1000

//
HasChoosed = false;
EmptyArea = "EA";
CurAllPicPos = [];

//
CurPageData = null;
CurGazeRecord = null;
PageEndTimerID = 0;

PAGE_END_WAIT_TIME = 1500

//
ChoosingPictureInstruction =
    `
Welcome to the picture choosing part of this experiment<br/>
In this part, you will see several pages on the screen.<br/>
Each page will show 4 pictures on the screen, and an audio will be played<br/>
Listen carefully to the audio and select the picture that best matches the audio.<br/>
<strong>NOTICE</strong> : In this part you are supposed to use keyboard to choose the answer.<br/><br/>
'Q' matches the <strong>top left</strong> picture,<br/>
'A' matches the <strong>bottom left</strong> picture,<br/>
'P' matches the <strong>top right</strong> picture,<br/>
'L' matches the <strong>bottom right</strong> picture.<br/>
`;


PageList = [];


/* -------------------------------- Variable / Function ------------------------------------------------------------ */

//Instruction --> OK --> StartChoosing
function ChoosePictureTrials() {
    ShowInstruction(ChoosingPictureInstruction, StartChoosePicture, 'Continue!');
}


function StartChoosePicture() {
    var experimentConfigs = AllConfigs['ExperimentConfig'];

    if (Experiment_Number == 0) {
        var index = Tool_GetRandomNumInRange(1, Object.keys(experimentConfigs).length + 1);
        PageList = experimentConfigs[String(index)];
        Experiment_Number = index;
    }
    else {
        PageList = experimentConfigs[String(Experiment_Number)];
        console.log(`You have chosen list_${Experiment_Number}.`);
    }

    console.log(deepCloneStructured(PageList));

    GoForNextPicture();
}

// get random number, [min, max)
function Tool_GetRandomNumInRange(min, max) {
    var range = max - min;
    var randNum = min + Math.floor(Math.random() * range);
    console.log(`Tool_GetRandomNumInRange(${min},${max}) : Get random number is ${randNum}`);
    return randNum;
}


function ResetVariablesAndListeners() {
    PicRoleDic = {};

    IsAudioLoaded = false;
    IsAudioStart = false;
    IsAudioEnd = false;
    CurAudio.src = '';
    CurAudio.currentTime = 0;

    HasChoosed = false;
    CurAllPicPos = [];
    CurPageData = null;
    CurGazeRecord = null;

    document.onkeyup = null;
    webgazer.clearGazeListener();
}

//Create pictures
function GoForNextPicture() {
    ResetVariablesAndListeners();

    if (PageList.length == 0) {
        console.log('Pic Experiment End.')
        EndExperiment();
        return;
    }

    CurPageData = CreateTrialData('ChoosePicture');

    var curPageID = PageList.shift();
    var curPageCfg = AllConfigs['PageConfig'][curPageID];

    LoadAudio(curPageCfg);
    CreatePagePictures(curPageCfg);
    AddWebgazerAndKeyListener();
}


HasAddAudioEvent = false;

function LoadAudio(curPageCfg) {
    var audioAddress = curPageCfg['AudioAddress']
    var audioName = curPageCfg['AudioName'];

    SetCurPageData('AudioName', audioName, 'LoadAudio()');

    CurAudio.src = audioAddress;
    CurAudio.load();

    if (HasAddAudioEvent) {
        return;
    }

    CurAudio.addEventListener('canplaythrough', () => {
        IsAudioLoaded = true;

        CheckCanStartCurPage();
    });

    CurAudio.addEventListener('ended', () => {
        IsAudioEnd = true;
        SetCurPageData('AudioEnd', Date.now(), 'LoadAudio()');
        CheckCanEndCurPage();
    });

    HasAddAudioEvent = true;
}


function CreatePagePictures(curPageCfg) {
    ClearCanvas();
    var canvas = GetCanvas();

    var PictureGrid = document.createElement('div');
    canvas.appendChild(PictureGrid);

    PictureGrid.className = 'Picture';
    PictureGrid.style.display = 'grid';
    PictureGrid.style.gridTemplateColumns = 'repeat(2,1fr)';
    PictureGrid.style.gap = '50px';
    PictureGrid.style.justifyItems = 'center';
    PictureGrid.style.alignItems = 'center';

    var picCfgs = AllConfigs['PicConfig'];

    //Set the empty area role
    PicRoleDic[EmptyArea] = EmptyArea;

    //Top Left
    var picA_Info = picCfgs[curPageCfg['PicID_A']];
    var picA_Role = curPageCfg['PicRole_A'];
    CreatePicEle(picA_Info, picA_Role, PictureGrid, TLKey);

    //Bottom Left
    var picB_Info = picCfgs[curPageCfg['PicID_B']];
    var picB_Role = curPageCfg['PicRole_B'];
    CreatePicEle(picB_Info, picB_Role, PictureGrid, TRKey);

    //Top Right
    var picC_Info = picCfgs[curPageCfg['PicID_C']];
    var picC_Role = curPageCfg['PicRole_C'];
    CreatePicEle(picC_Info, picC_Role, PictureGrid, BLKey);

    //Bottom Right
    var picD_Info = picCfgs[curPageCfg['PicID_D']];
    var picD_Role = curPageCfg['PicRole_D'];
    CreatePicEle(picD_Info, picD_Role, PictureGrid, BRKey);

    SetPictureGridVisible(false);
}


// Create Picture Elements
function CreatePicEle(picInfo, picRole, picFather, key) {
    if (picFather == null) {
        console.log('Cannot find picture Father');
        alert('Cannot find picture Father');
        return;
    }

    var picAddress = picInfo['PicAddress'];
    var picName = picInfo['PicName'];

    KeyPicDic[key] = picName;

    var picEle = document.createElement('img');
    picEle.src = picAddress;
    picEle.id = picName;
    picEle.dataset.picRole = picRole;
    //Set PicId : Role
    PicRoleDic[picName] = picRole;

    picEle.style.objectFit = 'cover';
    picEle.style.cursor = 'pointer';
    picEle.style.maxHeight = '100%';

    picFather.appendChild(picEle);

    //Need to record picture infomation after the picture is loaded
    picEle.onload = function () {
        var picRect = picEle.getBoundingClientRect();
        var picPos = {};
        picPos['picName'] = picEle.id;
        picPos['picRole'] = picEle.dataset.picRole;
        picPos['left'] = picRect.left;
        picPos['top'] = picRect.top;
        picPos['right'] = picRect.right;
        picPos['bottom'] = picRect.bottom;

        CurAllPicPos.push(picPos);

        CheckCanStartCurPage();
    }

}

function RecordAllPosition() {
    var windowInfo = { 'width': window.innerWidth, 'height': window.innerHeight };
    SetCurPageData('WindowInfomation', windowInfo, 'RecordAllPosition()');
    SetCurPageData('AllPicturePosition', CurAllPicPos, 'RecordAllPosition()');
}


function SetPictureGridVisible(visible) {
    var PictureGrid = document.querySelector('.Picture');
    if (PictureGrid == null) {
        console.log('SetPictureGridVisible() : PictureGrid == null')
        return;
    }

    PictureGrid.style.visibility = visible ? 'visible' : 'hidden';

}


function AddWebgazerAndKeyListener() {
    AddGazerListener();
    AddKeylistener();
}


async function AddGazerListener() {
    CurGazeRecord = [];

    webgazer.setGazeListener(function (data, elapsedTime) {
        if (data == null) {
            return;
        }

        var x = data.x;
        var y = data.y;
        var region = EmptyArea;
        var role = EmptyArea;

        for (var imgPos of CurAllPicPos) {
            if (PosInRegion(x, y, imgPos.left, imgPos.top, imgPos.right, imgPos.bottom)) {
                region = imgPos["picName"];
                role = imgPos["picRole"];
                break;
            }
        }

        var gazeData = {};
        gazeData['x'] = x;
        gazeData['y'] = y;
        gazeData['region'] = region;
        gazeData['role'] = role;
        gazeData['time'] = Date.now();

        CurGazeRecord.push(gazeData);
    });
}


function AddGazerListener_New(){
    CurGazeRecord = [];
    webgazer.setGazeListener(CustomCallback);
}


function CustomCallback(data, elapsedTime) {
    if (data == null) {
        return;
    }

    var x = data.x;
    var y = data.y;
    var region = EmptyArea;
    var role = EmptyArea;

    for (var imgPos of CurAllPicPos) {
        if (PosInRegion(x, y, imgPos.left, imgPos.top, imgPos.right, imgPos.bottom)) {
            region = imgPos["picName"];
            role = imgPos["picRole"];
            break;
        }
    }

    var gazeData = {};
    gazeData['x'] = x;
    gazeData['y'] = y;
    gazeData['region'] = region;
    gazeData['role'] = role;
    gazeData['time'] = Date.now();

    CurGazeRecord.push(gazeData);
}

function PosInRegion(dotX, dotY, left, top, right, bottom) {
    if (left <= dotX && dotX <= right &&
        top <= dotY && dotY <= bottom) {
        return true;
    }

    return false;
}

function AddKeylistener() {
    document.onkeyup = function (event) {
        //Can only choose once
        if (HasChoosed) {
            return;
        }

        if (event.key in KeyPicDic) {
            var picName = KeyPicDic[event.key];

            var picEle = document.getElementById(picName);
            if (picEle == null) {
                console.log(`Can't find : ${picName}`);
                return;
            }

            picEle.style.border = '5px solid blue';

            var picRole = picEle.dataset.picRole;
            var isAnsRight = picRole == "target";
            var chooseTime = Date.now();

            SetCurPageData('Choice', picRole, 'AddKeylistener()');
            SetCurPageData('IsRight', isAnsRight, 'AddKeylistener()');
            SetCurPageData('ChooseTime', chooseTime, 'AddKeylistener()');

            HasChoosed = true;

            CheckCanEndCurPage();
        }
    }

}


function HandlePageGazeData() {
    var AllGazeRecord = {};
    AllGazeRecord['GazeRecord'] = CurGazeRecord;

    var AreaDurationSum = {};
    AreaDurationSum[EmptyArea] = 0;
    for (let area of CurAllPicPos) {
        AreaDurationSum[area.picName] = 0;
    }

    var AreaDurationRecord = [];
    var lastRegion = EmptyArea;
    var lastStartTime = 0;

    var gazeLength = CurGazeRecord.length;
    for (var i = 0; i < gazeLength; i++) {
        var gazeData = CurGazeRecord[i];

        if (i == 0) {
            lastRegion = gazeData['region'];
            lastStartTime = gazeData['time'];
        }

        if (gazeData['region'] != lastRegion || i == gazeLength - 1) {
            var regionDuration = {};
            regionDuration['region'] = lastRegion;
            regionDuration['role'] = PicRoleDic[lastRegion];
            regionDuration['duration'] = gazeData['time'] - lastStartTime;
            AreaDurationRecord.push(regionDuration);

            AreaDurationSum[gazeData['region']] += regionDuration['duration'];

            lastRegion = gazeData['region'];
            lastStartTime = gazeData['time'];
        }

    };

    AllGazeRecord['AreaRecord'] = AreaDurationRecord;
    AllGazeRecord['DurationSum'] = AreaDurationSum;

    SetCurPageData('AllGazeRecord', AllGazeRecord, 'HandlePageGazeData()');
}


function SetCurPageData(keyStr, data, caller = "none") {
    console.log(`${caller} call SetCurPageData(), keyStr is '${keyStr}'.`);

    if (CurPageData == null) {
        console.log("CurPageData is null.");
        return;
    }

    CurPageData[keyStr] = data;

}


/* --------------------------------------Start/End Page------------------------------------------------------------- */

function CheckCanStartCurPage() {
    if (CurAllPicPos.length != 4) {
        return;
    }

    if (!IsAudioLoaded) {
        return;
    }

    StartThisPage();
}

async function StartThisPage() {
    RecordAllPosition();

    await ResumeWebgazer('StartThisPage');

    SetPictureGridVisible(true);
    AudioTimerID = setTimeout(() => {
        clearTimeout(AudioTimerID);

        CurAudio.play();
        IsAudioStart = true;

        SetCurPageData('AudioStart', Date.now(), 'StartThisPage()');
    }, AUDIO_WAIT_TIME);
}



function CheckCanEndCurPage() {
    if (!HasChoosed) {
        return;
    }

    if (!IsAudioEnd) {
        return;
    }

    PageEndTimerID = setTimeout(() => {
        clearTimeout(PageEndTimerID);

        EndThisPage();
    }, PAGE_END_WAIT_TIME);

}


async function EndThisPage() {
    await PauseWebgazer('EndThisPage');
    HandlePageGazeData();
    PushTrialData(CurPageData);

    GoForNextPicture();
}

