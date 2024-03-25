var delayedIterate = async (field, delay, onCalculate) => {
    var start = Date.now();
    await new Promise((resolve, _) => setTimeout(() => resolve(iterate(field)), delay));
    var end = Date.now();
    onCalculate(end - start);
}

var iterate = (field) => {
    field.clearModified();
    var firstRow = [...field.getRow(0)];
    var currentRow = [...field.getRow(0)];
    var prevRow = [...field.getRow(field.getYSize()-1)];
    var curIndex = 0;

    while(curIndex < field.getYSize()){
        for(var i = 0; i < field.getXSize(); i++){
            var nextRow = curIndex === field.getYSize() - 1 ? firstRow : [...field.getRow(curIndex+1)];
            var neightbors = 0;
            var prevX = i === 0 ? field.getXSize() - 1 : i - 1;
            var nextX = i === field.getXSize() - 1 ? 0 : i + 1;
            neightbors += prevRow[prevX] ? 1 : 0;
            neightbors += prevRow[i] ? 1 : 0;
            neightbors += prevRow[nextX] ? 1 : 0;
            neightbors += currentRow[prevX] ? 1 : 0;
            neightbors += currentRow[nextX] ? 1 : 0;
            neightbors += nextRow[prevX] ? 1 : 0;
            neightbors += nextRow[i] ? 1 : 0;
            neightbors += nextRow[nextX] ? 1 : 0;

            if (currentRow[i]){
                field.setCellData(curIndex, i, neightbors === 3 || neightbors === 2 ? true : false);
            }
            else{
                field.setCellData(curIndex, i, neightbors === 3 ? true : false);
            }
        }

        curIndex++;
        prevRow = currentRow;
        if (curIndex < field.getYSize()){
            currentRow = [...field.getRow(curIndex)];
        }
    }
}

var game = (field, delay, onCalculate, onGameEnd) => {
    var doNext = true;
    var doGame = () => {
        if (!field.isModified()){
            onGameEnd();
        }
        if (doNext && field.isModified()){
            delayedIterate(field, delay, onCalculate).then(doGame);
        }
    }
    doGame();
    return () => doNext = false;
}