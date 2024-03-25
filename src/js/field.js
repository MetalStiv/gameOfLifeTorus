class Field {
    #data;
    #modified;
    #aliveCounter;
    
    constructor(){
        this.#modified = false;
        this.#aliveCounter = 0;
    };

    resize(xLen, yLen){
        this.#data = [];
        for(var i = 0; i < yLen; i++){
            var newString = new Array(xLen).fill(false);
            this.#data.push(newString);
        }
    };

    setCellData(i, j, value){
        if (this.#data[i][j] !== value){
            this.#modified = true;
            this.#aliveCounter += value === true ? 1 : -1;
        }
        this.#data[i][j] = value
    };

    getCellData(i, j) {
        return this.#data[i][j]
    };

    getXSize(){
        return this.#data[0].length;
    };

    getYSize(){
        return this.#data.length; 
    };

    getRow(i){
        return this.#data[i];
    };

    getAliveCounter(){
        return this.#aliveCounter;
    };

    isModified(){
        return this.#modified;
    };

    clearModified(){
        this.#modified = false;
    }
}