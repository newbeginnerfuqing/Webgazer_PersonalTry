function ShowInstruction(content, btnCallback, btnContent, isDisable = false) {
    ClearCanvas();

    CreateInstructFrame();
    AddContentAndListener(content, btnCallback, btnContent, isDisable);
}

function CreateInstructFrame() {
    var canvas = GetCanvas();
    var canvasRect = canvas.getBoundingClientRect();

    var instructionFrame = document.createElement('div');
    canvas.appendChild(instructionFrame);

    instructionFrame.className = 'instrction';
    instructionFrame.style.display = 'flex';
    instructionFrame.style.flexDirection = 'column';
    instructionFrame.style.justifyContent = 'center';
    instructionFrame.style.alignItems = 'center';
    instructionFrame.style.Width = `${canvasRect.width}px`;
    instructionFrame.style.minHeight = `${canvasRect.height}px`;

    instructionFrame.style.fontFamily = "'Times New Roman', Times, serif";
    instructionFrame.style.fontSize = '35px';
    instructionFrame.style.textAlign = 'left';

    var content = document.createElement('p');
    content.className = 'content';
    instructionFrame.appendChild(content);

    var extraArea = document.createElement('div');
    extraArea.className = 'extraarea';
    instructionFrame.appendChild(extraArea);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'nextBtn';
    nextBtn.style.width = '250px';
    nextBtn.style.height = '50px';
    nextBtn.style.fontSize = '35px';
    instructionFrame.appendChild(nextBtn);

}

function AddContentAndListener(content, btnCallback, btnContent, isDisable) {
    var contentEle = document.querySelector('.content');
    if (contentEle != null) {
        contentEle.innerHTML = content;
    }

    var nextBtn = document.querySelector('.nextBtn');
    if (nextBtn != null) {
        nextBtn.innerHTML = btnContent;
        nextBtn.onclick = btnCallback;
        SetInstructionButtonDisable(isDisable);
    }

}

function SetInstructionButtonDisable(isDisable) {
    var nextBtn = document.querySelector('.nextBtn');
    if (nextBtn != null) {
        nextBtn.disabled = isDisable;
    }

}


function ExtraArea_AddElements(elementList) {
    var extraArea = document.querySelector('.extraarea')
    if (extraArea != null) {
        elementList.forEach(element => {
            extraArea.appendChild(element);
        });

    }
}

function ExtraArea_RemoveElements(elementIDList) {
    var extraArea = document.querySelector('.extraarea')
    if (extraArea != null) {
        elementIDList.forEach(elementID => {
            var element = document.querySelector(`#${elementID}`);
            if (element != null) {
                extraArea.removeChild(element);
            }
        });

    }
}