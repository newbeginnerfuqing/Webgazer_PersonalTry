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

    var nextBtn = document.createElement('button');
    nextBtn.className = 'nextBtn';
    nextBtn.style.width = '200px';
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