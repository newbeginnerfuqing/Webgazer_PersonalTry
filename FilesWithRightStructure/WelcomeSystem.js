WelcomePageInstruction =
    `First, please input your name and ID(studentID, if doesn't have one, just input '00000'), and ask the director your experiment number.<br/><br/>
Position your head so that the webcam has a good view of your eyes.<br/>
Center your face in the box and look directly towards the camera.<br/>
It is important that you <strong>try and keep your head reasonably still</strong> throughout the experiment, so please take a moment to <strong>adjust your setup</strong> to be comfortable.<br/>
When your face is <strong>centered in the box</strong> and the box is <strong>green</strong>, you can click to continue.<br/>
`

WelcomeTrialData = null;

async function ShowWelcomePage() {
    await ReadTheConfigs(); //Get prepared for the experiment.

    WelcomeTrialData = CreateTrialData('WelcomePage');
    ShowInstruction(WelcomePageInstruction, AfterWelcomPage, 'Continue', true);
    AddWelcomeExtraElement();
}

async function AfterWelcomPage() {
    var nameInput = document.querySelector("#name_input");
    var idInput = document.querySelector("#id_input");
    var expNumInput = document.querySelector("#expNum_input");

    if(nameInput == null || idInput == null || expNumInput == null){
        console.error("Can't find Welcome Extra Element.");
        alert("Can't find Welcome Extra Element.");
        return;
    }

    if(nameInput.value == "" || idInput.value == ""){
        alert("Please enter your name and your Id.");
        return;
    }

    var participantsName = nameInput.value;
    var participantsID = idInput.value;
    var experimentNumber = expNumInput.value;

    WelcomeTrialData["Participant_Name"] = participantsName;
    WelcomeTrialData["Participant_ID"] = participantsID;
    WelcomeTrialData["Experiment_Number"] = experimentNumber;

    SetBasicInfomation(participantsName, participantsID, experimentNumber);

    // var videoContainer = document.querySelector('#webgazerVideoContainer');
    // videoContainer.style.display = 'none';
    await PauseWebgazer('AfterWelcomPage');
    PushTrialData(WelcomeTrialData);

    StartCalibration();
}


function AddWelcomeExtraElement(){
    var eleList = [];

    //Enter your name
    var namediv = document.createElement('div');
    namediv.id = "name_div";

    var nameLbl = document.createElement('label');
    nameLbl.textContent = 'Name : ';
    namediv.appendChild(nameLbl);

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = "name_input";
    nameInput.value = '';
    nameInput.width = "100px";
    namediv.appendChild(nameInput);

    eleList.push(namediv);

    //Enter your id
    var iddiv = document.createElement('div');
    iddiv.id = "id_div";

    var idLbl = document.createElement('label');
    idLbl.textContent = "ID : ";
    iddiv.appendChild(idLbl);

    var idInput = document.createElement('input');
    idInput.type = "text";
    idInput.id = "id_input";
    idInput.value = "";
    idInput.width = "100px";
    iddiv.appendChild(idInput);

    eleList.push(iddiv);

    //Choose your experiment number
    var expNumdiv = document.createElement('div');
    expNumdiv.id = "expNum_div";

    var expNumLbl = document.createElement('label');
    expNumLbl.textContent = "Experiment Number : ";
    expNumdiv.appendChild(expNumLbl);

    var expNumInput = document.createElement('input');
    expNumInput.type = "text";
    expNumInput.id = "expNum_input";
    expNumInput.value = "0";
    expNumInput.width = "100px";
    expNumdiv.appendChild(expNumInput);
    
    eleList.push(expNumdiv);



    ExtraArea_AddElements(eleList);
}