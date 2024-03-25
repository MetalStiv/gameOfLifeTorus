const canvas = document.getElementById("webgl-canvas");
const gl = canvas.getContext("webgl2");

if (gl === null) {
    console.error("Unable to initialize WebGL. Your browser or machine may not support it.");
}
else{
    initScene();
}

var xLen = 0;
var yLen = 0;
var iterationNumber = 1;
var gameState = 0;
var stopGame;

var field = new Field();

var xSizeInput = document.querySelector('#x-size-input');
xSizeInput.onkeydown = (event) => {
    if(isNaN(event.key) && event.key !== 'Backspace' && event.key !== 'Delete' 
        && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Tab') {
        event.preventDefault();
    }
};

var ySizeInput = document.querySelector('#y-size-input');
ySizeInput.onkeydown = (event) => {
    if(isNaN(event.key) && event.key !== 'Backspace' && event.key !== 'Delete' 
        && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Tab') {
        event.preventDefault();
    }
};

var mapPanel = document.querySelector('#scrollable-map-panel');

document.querySelector('#btn-apply-size').addEventListener('click', () => {
    while(mapPanel.firstElementChild) {
        mapPanel.firstElementChild.remove();
    }
    xLen = parseInt(document.querySelector('#x-size-input').value);
    yLen = parseInt(document.querySelector('#y-size-input').value);
    field.resize(xLen, yLen);
    iterationNumber = 1;
    document.querySelector('#log-panel').textContent = '';
    for(let i = 0; i < yLen; i++){
        var newCheckboxRow = document.createElement('div');
        newCheckboxRow.className = 'checkbox-row';
        mapPanel.appendChild(newCheckboxRow);
        for(let j = 0; j < xLen; j++){
            var newCheckbox = document.createElement('input');
            newCheckbox.type = 'checkbox';
            newCheckbox.id = 'cb_' + i + '_' +j;
            newCheckbox.className = 'gol_checkbox';
            newCheckbox.addEventListener('click', (e) => {
                field.setCellData(i, j, e.target.checked);
            })
            newCheckboxRow.appendChild(newCheckbox);
        }
    }
});

document.querySelector('#btn-generate-random').addEventListener('click', (event) => {
    var probability = document.querySelector('#random-input').value;
    for(var i = 0; i < yLen; i++){
        for(var j = 0; j < xLen; j++){
            var cellValue = Math.random()*100 < probability ? true : false;
            document.querySelector('#cb_' + i + '_' +j).checked = cellValue;
            field.setCellData(i, j, cellValue);
        }
    }
    document.querySelector('#log-panel').textContent = '';
    iterationNumber = 1;
});

var delay = 0;
var delayLabel = document.querySelector('#delay-label');
delayLabel.textContent = `Delay ${delay}ms`;

document.querySelector('#delay-input').addEventListener('change', (e) => {
    delay = e.target.value;
    delayLabel.textContent = `Delay ${delay}ms`;
});

document.querySelector('#delay-input').addEventListener('input', (e) => {
    delay = e.target.value;
    delayLabel.textContent = `Delay ${delay}ms`;
});

var addToLog = (text) => {
    document.querySelector('#log-panel').textContent += text + '\r\n';
    document.querySelector('#log-panel').scrollTop = document.querySelector('#log-panel').scrollHeight;
}

var handleIteration = (time) => {
    addToLog(`Iteration #${iterationNumber}, time: ${time}ms, alive: ${field.getAliveCounter()}`);
    iterationNumber++;
    for(let i = 0; i < yLen; i++){
        for(let j = 0; j < xLen; j++){
            document.querySelector('#cb_' + i + '_' + j).checked = field.getCellData(i, j);
        }
    }
    //rerender()
}

var handleGameEnd = () => {
    document.querySelector('#btn-start-game').innerHTML = 'Start';
    gameState = 0;
    addToLog(`Game completed in ${iterationNumber-1} iterations! Alive: ${field.getAliveCounter()}`);
}

document.querySelector('#btn-start-step').addEventListener('click', () => {
    if (!field.isModified()){
        handleGameEnd();
    }
    else{
        delayedIterate(field, delay, handleIteration);
    }
});

document.querySelector('#btn-start-game').addEventListener('click', () => {
    if (gameState === 0){
        document.querySelector('#btn-start-game').innerHTML = 'Stop';
        gameState = 1;
        stopGame = game(field, delay, handleIteration, handleGameEnd);
        return;
    }
    if (gameState === 1){
        document.querySelector('#btn-start-game').innerHTML = 'Start';
        gameState = 0;
        stopGame();
        return;
    }
});