var createShader = (gl, type, source) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
};

var createBuffer = (gl, data, dataType, bufferType) => {
    let buffer = gl.createBuffer();
    let bufType = bufferType === "ARRAY_BUFFER" ? gl.ARRAY_BUFFER
        : gl.ELEMENT_ARRAY_BUFFER
    gl.bindBuffer(bufType, buffer);
    let dataArray = dataType === "Float32" ? new Float32Array(data)
        : new Uint16Array(data);
    gl.bufferData(bufType, dataArray, gl.STATIC_DRAW);
    return buffer;
};

var initScene = async (field) =>{
    var vertexShaderSource = await fetch('shaders/vertex.glsl')
        .then(response => response.text())
    var fragmentShaderSource = await fetch('shaders/fragment.glsl')
        .then(response => response.text())

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }

    return () => drawScene(gl, shaderProgram, field)
}

var drawScene = (gl, shaderProgram, field) => {
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(shaderProgram);

    projectionMatrix = [
        2.4142136573791504, 0, 0, 0,
        0, 2.4142136573791504, 0, 0,
        0, 0, -1.0020020008087158, -1,
        0, 0, -0.20020020008087158, 0
    ];

    var modelViewMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];

    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
        false,
        projectionMatrix
      );
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        false,
        modelViewMatrix
    );

    var {vertexes, vertexesOrder, vertexesColor} = getTorusVertexes(2.0, 1.0, field);
    var vertexesBuffer = createBuffer(gl, vertexes, "Float32", "ARRAY_BUFFER");  
    var vertexesOrderBuffer = createBuffer(gl, vertexesOrder, "Uint16", "ELEMENT_ARRAY_BUFFER");
    var vertexesColorBuffer = createBuffer(gl, vertexesColor, "Float32", "ARRAY_BUFFER");

    const numComponentsVertex = 3;
    const typeVertex = gl.FLOAT;
    const normalizeVertex = false;
    const strideVertex = 0;
    const offsetVertex = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexesBuffer);
    gl.vertexAttribPointer(
        gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        numComponentsVertex,
        typeVertex,
        normalizeVertex,
        strideVertex,
        offsetVertex
    );
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexesOrderBuffer);

    const numComponentsColor = 4;
    const typeColor = gl.FLOAT;
    const normalizeColor = false;
    const strideColor = 0;
    const offsetColor = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexesColorBuffer);
    gl.vertexAttribPointer(
        gl.getAttribLocation(shaderProgram, "aVertexColor"),
        numComponentsColor,
        typeColor,
        normalizeColor,
        strideColor,
        offsetColor
    );
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));

    {
        const vertexCount = vertexes.length / 2;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

var getTorusVertexes = (majorRadius, minorRadius, field) => {
    var vertexes = [];
    var vertexesOrder = [];
    var vertexesColor = [];
    if (!field){
        return {vertexes, vertexesOrder, vertexesColor};
    }

    var counter = 0;
    
    var alphaStep = 2.0 * 3.14159265358979323846 / field.getYSize();
    var betaStep = 2.0 * 3.14159265358979323846 / field.getXSize();
    var tubeRadius = (majorRadius - minorRadius) / 2;

    var alpha = 0;
    var beta = 0;
    for(var i = 0; i < field.getYSize(); i++){
        var baseZ = -6.0;
        for(var j = 0; j < field.getXSize(); j++){
            var a = [(minorRadius + (tubeRadius * (1 - Math.cos(beta))))*Math.cos(alpha), 
                (minorRadius + (tubeRadius * (1 - Math.cos(beta))))*Math.sin(alpha), 
                baseZ + tubeRadius * Math.sin(beta)];
            alpha += alphaStep;
            var b = [(minorRadius + (tubeRadius * (1 - Math.cos(beta))))*Math.cos(alpha), 
                (minorRadius + (tubeRadius * (1 - Math.cos(beta))))*Math.sin(alpha), 
                baseZ + tubeRadius * Math.sin(beta)];
            beta += betaStep;
            var c = [(minorRadius + (tubeRadius * (1 - Math.cos(beta))))*Math.cos(alpha), 
                (minorRadius + (tubeRadius * (1 - Math.cos(beta))))*Math.sin(alpha), 
                baseZ + tubeRadius * Math.sin(beta)];
            alpha -= alphaStep;
            var d = [(minorRadius + (tubeRadius * (1 - Math.cos(beta))))*Math.cos(alpha), 
                (minorRadius + (tubeRadius * (1 - Math.cos(beta))))*Math.sin(alpha), 
                baseZ + tubeRadius * Math.sin(beta)];
            
            vertexes = [...vertexes, ...a];
            vertexes = [...vertexes, ...b];
            vertexes = [...vertexes, ...c];
            vertexes = [...vertexes, ...d];

            var color = field.getCellData(i, j) === true ? [0.0, 0.0, 1.0, 1.0] : [1.0, 1.0, 1.0, 1.0]
            vertexesColor = [...vertexesColor, ...color];
            vertexesColor = [...vertexesColor, ...color];
            vertexesColor = [...vertexesColor, ...color];
            vertexesColor = [...vertexesColor, ...color];

            vertexesOrder = [...vertexesOrder, ...[counter, counter+1, counter+3, counter+1, counter+2, counter+3]];
            counter += 4;
        }
        alpha += alphaStep;
    }

    return {vertexes, vertexesOrder, vertexesColor};
}