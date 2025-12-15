const TLKey = 'Q'
const BLKey = 'A'
const TRKey = 'P'
const BRKey = 'L'

KeyPicDic = {
    TLKey: 'id1',
    BLKey: 'id2',
    TRKey: 'id3',
    BRKey: 'id4'
};

PicRoleDic = {};

//
IsAudioLoaded = false;
IsAudioStart = false;
IsAudioEnd = false;

CurAudio = new Audio();
AudioTimerID = 0;

//
HasChoosed = false;
EmptyArea = "EA";
CurAllPicPos = [];

//
CurPageData = null;
CurGazeRecord = null;
PageEndTimer = 0;

//
ChoosingPictureInstruction =
    `
Welcome to the picture choosing part of this experiment<br/>
In this part, you will see several pages on the screen.<br/>
Each page will show 4 pictures on the screen, and an audio will be played<br/>
Listen carefully to the audio and select the picture that best matches the audio.<br/>
<strong>NOTICE</strong> : In this part you are supposed to use keyboard to choose the answer.<br/>
'Q' matches the top left picture,<br/>
'A' matches the bottom left picture,<br/>
'P' matches the top right picture,<br/>
'L' matches the bottom right picture.<br/>
`;


PageList = [];


//Configs
Config_Source = { "ExperimentConfig": "./Config/Json/ExperimentConfig.json", "PageConfig": "./Config/Json/ExperimentConfig.json", "PicConfig": "./Config/Json/PicConfig.json" }
AllRawConfigs = {} //ExperimentConfig,  PageConfig,  PicConfig
AllConfigs = {} //ExperimentConfig,  PageConfig,  PicConfig

/* -------------------------------- Variable / Function ------------------------------------------------------------ */

//Instruction --> OK --> StartChoosing
function ChoosePictureTrials() {
    ShowInstruction(ChoosingPictureInstruction, StartChoosePicture, 'Continue!');
}


function StartChoosePicture() {
    var experimentConfigs = AllConfigs['ExperimentConfig'];
    var index = Tool_GetRandomNumInRange(0, Object.keys(experimentConfigs).length);
    PageList = experimentConfigs[index];

    GoForNextPicture();
}

// get random number, [min, max)
function Tool_GetRandomNumInRange(min, max) {
    var range = max - min;
    var randNum = min + Math.floor(Math.random() * range);

    return randNum;
}


/* ----- Read and deal with configs start ----------------------------------------------------------------------------------------------------- */

async function ReadTheConfigs() {
    for (const [cfgName, cfgAddress] of Object.entries(Config_Source)) {
        if (Object.hasOwn(AllRawConfigs, cfgName)) {
            continue;
        }

        var cfgFile = await fetch(cfgAddress);
        var cfg = await cfgFile.json();
        
        AllRawConfigs[cfgName] = cfg;
        console.log(`${cfgName} already loaded.`);
    }

    DealingWithRawConfigs();
}

function DealingWithRawConfigs() {
    DealWithExperimentConfig();
    DealWithPageConfig();
    DealWithPicConfig();
}


// to {ExperimentId : PageList}
function DealWithExperimentConfig() {
    var rawCfg = AllRawConfigs['ExperimentConfig'];
    var ExperimentCfgs = {};
    rawCfg.forEach(cfg => {
        var key = cfg['ExperimentId'];
        var pageList = [];
        for (var i = 1; i <= cfg['PageNum']; i++) {
            pageList.push(cfg[`Page_${i}`]);
        }

        ExperimentCfgs[key] = pageList;
    });

    AllConfigs['ExperimentConfig'] = ExperimentCfgs;
}


// to {PageID : (PicA,PicB,PicC,PicD, AudioName)}
// Prefix : {official : './Source/audio/', test : './Source/test/audio/'}
function DealWithPageConfig() {
    var prefix = './Source/test/audio/';

    var rawCfg = AllRawConfigs['PageConfig'];
    var PageCfgs = {};
    rawCfg.forEach(cfg => {
        var key = cfg['PageID'];
        cfg['AudioAddress'] = prefix.concat(cfg['AudioName']);
        PageCfgs[key] = cfg;
    });

    AllConfigs['PageConfig'] = PageCfgs;
}

// to {PicID : PicName}
// Prefix : {official : './Source/img/', test : './Source/test/img/'}
function DealWithPicConfig() {
    var prefix = './Source/test/img/';

    var rawCfg = AllRawConfigs['PicConfig'];
    var PicCfgs = {};
    rawCfg.forEach(cfg => {
        var key = cfg['PicID'];
        var picValue = {};
        picValue = {};
        picValue['PicName'] = cfg['PicName'];
        picValue['PicAddress'] = prefix.concat(cfg['PicName']);
        PicCfgs[key] = picValue;
    });

    AllConfigs['PicConfig'] = PicCfgs;
}

/* ----- Read and deal with configs end ----------------------------------------------------------------------------------------------------- */

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

    webgazer.clearGazeListener();
    document.onkeyup = null;
}

//Create pictures
function GoForNextPicture() {
    ResetVariablesAndListeners();

    if (PageList.length == 0) {
        console.log('Pic Experiment End.')
        alert('End Experiment');
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

    CurPageData['AudioName'] = audioName;

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
        CurPageData['AudioEnd'] = Date.now();
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

    //Top Left
    var picA_Info = picCfgs[curPageCfg['PicID_A']];
    var picA_Role = curPageCfg['PicRole_A'];
    CreatePicEle(picA_Info, picA_Role, PictureGrid, TLKey);

    //Bottom Left
    var picB_Info = picCfgs[curPageCfg['PicID_B']];
    var picB_Role = curPageCfg['PicRole_B'];
    CreatePicEle(picB_Info, picB_Role, PictureGrid, BLKey);

    //Top Right
    var picC_Info = picCfgs[curPageCfg['PicID_C']];
    var picC_Role = curPageCfg['PicRole_C'];
    CreatePicEle(picC_Info, picC_Role, PictureGrid, TRKey);

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

    picEle.onload = function () {
        var picRect = picEle.getBoundingClientRect();
        var picPos = {};
        picPos['picName'] = picEle.id;
        picPos['left'] = picRect.left;
        picPos['top'] = picRect.top;
        picPos['right'] = picRect.right;
        picPos['bottom'] = picRect.bottom;

        CurAllPicPos.push(picPos);

        CheckCanStartCurPage();
    }

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
    AddgazerListener();
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

        for (var imgPos of CurAllPicPos) {
            if (PosInRegion(x, y, imgPos.left, imgPos.top, imgPos.right, imgPos.bottom)) {
                region = imgPos.picID;
                break;
            }
        }

        var gazeData = {};
        gazeData['x'] = x;
        gazeData['y'] = y;
        gazeData['region'] = region;
        gazeData['time'] = Date.now();

        CurGazeRecord.push(gazeData);
    });
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

            var picEle = document.querySelector(`#${picName}`);
            if (picEle == null) {
                return;
            }

            picEle.style.border = '5px solid blue';

            var picRole = picEle.dataset.picRole;
            var isAnsRight = picRole == "target";
            var chooseTime = Date.now();


            CurPageData['Choice'] = picRole;
            CurPageData['IsRight'] = isAnsRight;
            CurPageData['ChooseTime'] = chooseTime;

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
        AreaDurationSum[area.picID] = 0;
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

    CurPageData['AllGazeRecord'] = AllGazeRecord;
}


/* --------------------------------------Process function------------------------------------------------------------- */

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
    await ResumeWebgazer('StartThisPage');

    SetPictureGridVisible(true);
    AudioTimerID = setTimeout(() => {
        clearTimeout(AudioTimerID);

        CurAudio.play();
        IsAudioStart = true;

        CurPageData['AudioStart'] = Date.now();
    }, 1000);
}



function CheckCanEndCurPage() {
    if (!HasChoosed) {
        return;
    }

    if (!IsAudioEnd) {
        return;
    }

    PageEndTimer = setTimeout(() => {
        clearTimeout(PageEndTimer);

        EndThisPage();
    }, 1500);

}


async function EndThisPage() {
    await PauseWebgazer('EndThisPage');
    HandlePageGazeData();

    GoForNextPicture();
}

