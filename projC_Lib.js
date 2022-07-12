var lampOn = 1;
var mat_index = 9;
var floatsPerVertex = 10; 
var blinn = 0;


function VBObox0() {
    this.VERT_SRC =
    'precision highp float;\n' +

    'uniform mat4 u_ModelMat0;\n' +
    'attribute vec4 a_Pos0;\n' +
    'attribute vec3 a_Colr0;\n'+
    'varying vec3 v_Colr0;\n' +

    'void main() {\n' +
    '  gl_Position = u_ModelMat0 * a_Pos0;\n' +
    '	 v_Colr0 = a_Colr0;\n' +
    ' }\n';
  
    this.FRAG_SRC = 
    'precision mediump float;\n' +
    'varying vec3 v_Colr0;\n' +
    'void main() {\n' +
    '  gl_FragColor = vec4(v_Colr0, 1.0);\n' + 
    '}\n';

    makeGroundGrid();
    makeAxes();
    var totalSize = gndVerts.length + axisVerts.length;
    var n = totalSize / 7;
    var vertices = new Float32Array(totalSize);

    gndStart = 0;
    for (i = 0, j = 0; j < gndVerts.length; i++, j++){
        vertices[i] = gndVerts[j];
    }
    axisStart = i;
    for(j = 0; j< axisVerts.length; i++, j++) {
		vertices[i] = axisVerts[j];
    }

    this.vboContents = vertices;

    this.vboVerts = n;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
    this.vboBytes = this.vboContents.length * this.FSIZE;
	this.vboStride = this.vboBytes / this.vboVerts; 

    this.vboFcount_a_Pos0 =  4;
    this.vboFcount_a_Colr0 = 3;
    console.assert((this.vboFcount_a_Pos0 + 
                    this.vboFcount_a_Colr0) * 
                    this.FSIZE == this.vboStride, 
                    "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");
    
    this.vboOffset_a_Pos0 = 0;
    this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;

    this.vboLoc;
    this.shaderLoc;	
    this.a_PosLoc;	
	this.a_ColrLoc;	
	
    this.ModelMat = new Matrix4();
    this.u_ModelMatLoc;	
}

VBObox0.prototype.init = function() {
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
        console.log(this.constructor.name + 
                    '.init() failed to create executable Shaders on the GPU. Bye!');
        return;
    }
    gl.program = this.shaderLoc;
    
    this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
        console.log(this.constructor.name + 
    				'.init() failed to create VBO in GPU. Bye!'); 
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
    gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);  

    this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
    if(this.a_PosLoc < 0) {
        console.log(this.constructor.name + 
                    '.init() Failed to get GPU location of attribute a_Pos0');
        return -1;
    }
    this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
    if(this.a_ColrLoc < 0) {
        console.log(this.constructor.name + 
                    '.init() failed to get the GPU location of attribute a_Colr0');
        return -1;
    }

    this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
    if (!this.u_ModelMatLoc) { 
        console.log(this.constructor.name + 
                    '.init() failed to get GPU location for u_ModelMat1 uniform');
        return;
    }
}

VBObox0.prototype.switchToMe = function() {
    gl.useProgram(this.shaderLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
    gl.vertexAttribPointer( 
        this.a_PosLoc,
        this.vboFcount_a_Pos0,
        gl.FLOAT,
        false,
        this.vboStride,
        this.vboOffset_a_Pos0 );	
    gl.vertexAttribPointer( 
        this.a_ColrLoc, 
        this.vboFcount_a_Colr0, 
        gl.FLOAT, 
        false, 
        this.vboStride, 
        this.vboOffset_a_Colr0 );  
    gl.enableVertexAttribArray(this.a_PosLoc);
    gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
    var isOK = true;

    if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
        console.log(this.constructor.name + 
                    '.isReady() false: shader program at this.shaderLoc not in use!');
        isOK = false;
    }
    if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + 
                    '.isReady() false: vbo at this.vboLoc not in use!');
        isOK = false;
    }
    return isOK;
}

VBObox0.prototype.adjust = function() {
    if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }
    this.ModelMat.setIdentity();
    this.ModelMat.set(projMatrix).multiply(viewMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMat.elements);
}

VBObox0.prototype.draw = function() {
    if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
                '.draw() call you needed to call this.switchToMe()!!');
    }
    gl.drawArrays(gl.LINES, 0, this.vboVerts); 
}

VBObox0.prototype.reload = function() {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vboContents);
}


// Gouroud Shading, Blinn Phong & Phong Lighting
function VBObox1() {
    this.VERT_SRC =
    'precision highp float;\n' +
    'precision highp int;\n' +

    'struct LampT {\n' +
    '   vec3 pos;\n' +	
    ' 	vec3 Ia;\n' +	
    ' 	vec3 Id;\n' +	
    '	vec3 Is;\n' +	
    '}; \n' +

    'struct MatlT {\n' +
	'	vec3 Ke;\n' +
	'	vec3 Ka;\n' +
	'	vec3 Kd;\n' +
	'	vec3 Ks;\n' +
	'	float shiny;\n' +
    '};\n' +
    
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'attribute vec3 a_Color;\n'+ 

    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    
    'uniform LampT u_Lamp;\n' +
    'uniform MatlT u_Material;\n' +
    'uniform vec3 u_eyePosWorld;\n' +
    'uniform int u_Blinn;\n' +

    'varying vec4 v_Position;\n' +
    'varying vec3 v_Kd;\n' +
    'varying vec4 v_Color;\n' +

    'void main() {\n' +
    '   gl_Position = u_MvpMatrix * a_Position;\n' +
    '   v_Position = u_ModelMatrix * a_Position;\n' +
    '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '   v_Kd = u_Material.Kd * a_Color;\n' +

    '   vec3 lightDirection = normalize(u_Lamp.pos - v_Position.xyz);\n' +
    '   vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' + 

    '   float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    '   float e64;\n' +
    '   if (u_Blinn == 1){\n' + 
    '       vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '       float nDotH = max(dot(H, normal), 0.0); \n' +
    '       e64 = pow(nDotH, u_Material.shiny);\n' +
    '   }\n' +
    '   else {\n' +
    '       vec3 R = reflect(-lightDirection, normal);\n' +
    '       float rDotV = max(dot(R, eyeDirection), 0.0);\n' +
    '       e64 = pow(rDotV, u_Material.shiny);\n' +
    '   }\n' +

    '   vec3 ambient = u_Lamp.Ia * u_Material.Ka;\n' +
    '   vec3 diffuse = u_Lamp.Id * v_Kd * nDotL;\n' +
    '	vec3 specular = u_Lamp.Is * u_Material.Ks * e64;\n' +
    '   vec3 emissive = u_Material.Ke;\n' +
    '   v_Color = vec4(ambient + diffuse + specular + emissive, 1.0);\n' + 
    '}\n';
  
    this.FRAG_SRC = 
    'precision highp float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' + 
    '}\n';
  
    makeSphere();
    makeCylinder();
    makeCube();
    makeHexPrism();
    var totalSize = sphVerts.length + cylVerts.length + cubeVerts.length + hexVerts.length;
    var n = totalSize / floatsPerVertex;
    var vertices = new Float32Array(totalSize);

    sphStart = 0;
    for (i = 0, j = 0; j < sphVerts.length; i++, j++){
        vertices[i] = sphVerts[j];
    }

    cylStart = i;
    for (j = 0; j < cylVerts.length; i++, j++){
        vertices[i] = cylVerts[j];
    }

    cubeStart = i;
    for (j = 0; j < cubeVerts.length; i++, j++){
        vertices[i] = cubeVerts[j];
    }

    hexStart = i;
    for (j = 0; j < hexVerts.length; i++, j++){
        vertices[i] = hexVerts[j];
    }

    this.vboContents = vertices;
    this.vboVerts = n;
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
    this.vboBytes = this.vboContents.length * this.FSIZE;
    this.vboStride = this.vboBytes / this.vboVerts;

    this.vboFcount_a_Pos0 =  4;
    this.vboFcount_a_Colr0 = 3;
    this.vboFcount_a_Norm0 = 3;
    console.assert((this.vboFcount_a_Pos0 + this.vboFcount_a_Colr0 + this.vboFcount_a_Norm0) * this.FSIZE == this.vboStride, 
        "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");
    
    this.vboOffset_a_Pos0 = 0;
    this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;
    this.vboOffset_a_Norm0 = (this.vboFcount_a_Pos0 + this.vboFcount_a_Colr0) * this.FSIZE;

    this.vboLoc;
    this.shaderLoc;	
    this.a_PosLoc;	
    this.a_ColrLoc;	
    this.a_NormLoc;

    this.ModelMat = new Matrix4();
    this.u_ModelMatLoc;
    this.u_MvpMatLoc;	
    this.u_NormalMatLoc;

    this.u_eyePosWorldLoc;
    this.u_BlinnLoc;
    
    this.material = new Material();
    this.material.K_ambi;
    this.material.K_diff;
    this.material.K_spec;
    this.material.K_emit;
    this.material.K_shiny;

    this.lamp = new LightsT();
    this.lamp.u_pos;
    this.lamp.u_ambi;
    this.lamp.u_diff;
    this.lamp.u_spec;
}

VBObox1.prototype.init = function() {
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
        console.log(this.constructor.name + 
                '.init() failed to create executable Shaders on the GPU. Bye!');
        return;
    }
    gl.program = this.shaderLoc;
    
    this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
        console.log(this.constructor.name + 
    			'.init() failed to create VBO in GPU. Bye!'); 
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
    gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);  

    this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
    if(this.a_PosLoc < 0) {
        console.log(this.constructor.name + 
                '.init() Failed to get GPU location of attribute a_Position');
        return -1;
    }

    this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Color');
    if(this.a_ColrLoc < 0) {
        console.log(this.constructor.name + 
                '.init() failed to get the GPU location of attribute a_Color');
        return -1;
    }

    this.a_NormLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
    if(this.a_NormLoc < 0) {
        console.log(this.constructor.name + 
                '.init() Failed to get GPU location of attribute a_Normal');
        return -1;
    }

    this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
    this.u_MvpMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
    this.u_NormalMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
    if (!this.u_ModelMatLoc || !this.u_MvpMatLoc || !this.u_NormalMatLoc) { 
        console.log(this.constructor.name + 
                '.init() failed to get GPU location of uniform Matrices');
        return;
    }

    this.u_eyePosWorldLoc = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
    this.u_BlinnLoc = gl.getUniformLocation(this.shaderLoc, 'u_Blinn');
    if(!this.u_eyePosWorldLoc || !this.u_BlinnLoc) {
        console.log(this.constructor.name + 
                '.init() Failed to get GPU location of uniform u_eyePosWorld or u_Blinn');
        return;
    }

    this.lamp.u_pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp.pos');
    this.lamp.u_ambi = gl.getUniformLocation(this.shaderLoc, 'u_Lamp.Ia');
    this.lamp.u_diff = gl.getUniformLocation(this.shaderLoc, 'u_Lamp.Id');
    this.lamp.u_spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp.Is');
    if(!this.lamp.u_pos || !this.lamp.u_ambi || !this.lamp.u_diff || !this.lamp.u_spec ) {
        console.log(this.constructor.name + 
                '.init() failed to get GPU location for lamp.');
        return;
    }

    this.material.K_ambi = gl.getUniformLocation(this.shaderLoc, 'u_Material.Ka');
    this.material.K_diff = gl.getUniformLocation(this.shaderLoc, 'u_Material.Kd');
    this.material.K_spec = gl.getUniformLocation(this.shaderLoc, 'u_Material.Ks');
    this.material.K_emit = gl.getUniformLocation(this.shaderLoc, 'u_Material.Ke');
	this.material.K_shiny = gl.getUniformLocation(this.shaderLoc, 'u_Material.shiny');
    if (!this.material.K_ambi || !this.material.K_diff || 
        !this.material.K_spec || !this.material.K_emit || !this.material.K_shiny) {
        console.log(this.constructor.name + 
                '.init() failed to get GPU location for material0.');
        return;
    }
}

VBObox1.prototype.switchToMe = function() {
    gl.useProgram(this.shaderLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
    gl.vertexAttribPointer( 
        this.a_PosLoc,
        this.vboFcount_a_Pos0,
        gl.FLOAT,
        false,
        this.vboStride,
        this.vboOffset_a_Pos0 );                    	
    gl.vertexAttribPointer( 
        this.a_ColrLoc, 
        this.vboFcount_a_Colr0, 
        gl.FLOAT, 
        false, 
        this.vboStride, 
        this.vboOffset_a_Colr0);
    gl.vertexAttribPointer( 
        this.a_NormLoc,
        this.vboFcount_a_Norm0,
        gl.FLOAT,
        false,
        this.vboStride,
        this.vboOffset_a_Norm0);             
    gl.enableVertexAttribArray(this.a_PosLoc);
    gl.enableVertexAttribArray(this.a_ColrLoc);
    gl.enableVertexAttribArray(this.a_NormLoc);
}

VBObox1.prototype.isReady = function() {
    var isOK = true;

    if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
        console.log(this.constructor.name + 
                    '.isReady() false: shader program at this.shaderLoc not in use!');
        isOK = false;
    }
    if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + 
                    '.isReady() false: vbo at this.vboLoc not in use!');
        isOK = false;
    }
    return isOK;
}

VBObox1.prototype.adjust = function() {
    if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }

    gl.uniform3f(this.u_eyePosWorldLoc, cam_x, cam_y, cam_z);

    gl.uniform3fv(this.lamp.u_pos, [-lit_x, lit_y, -lit_z]);
    if(lampOn != 0) {
        gl.uniform3fv(this.lamp.u_ambi, [ia_r, ia_g, ia_b]); 
        gl.uniform3fv(this.lamp.u_diff, [id_r*4, id_g*4, id_b*4]);
        gl.uniform3fv(this.lamp.u_spec, [is_r*4, is_g*4, is_b*4]);
    } else {
        gl.uniform3fv(this.lamp.u_ambi, [0,0,0]); 
        gl.uniform3fv(this.lamp.u_diff, [0,0,0]);
        gl.uniform3fv(this.lamp.u_spec, [0,0,0]);
    }

    var mtrl = new Material(mat_index);
    gl.uniform3fv(this.material.K_ambi, mtrl.K_ambi.slice(0,3));
    gl.uniform3fv(this.material.K_diff, mtrl.K_diff.slice(0,3));
    gl.uniform3fv(this.material.K_spec, mtrl.K_spec.slice(0,3));
    gl.uniform3fv(this.material.K_emit, mtrl.K_emit.slice(0,3));
    gl.uniform1f(this.material.K_shiny, mtrl.K_shiny);

    gl.uniform1i(this.u_BlinnLoc, blinn);
}

VBObox1.prototype.draw = function() {
    if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
                '.draw() call you needed to call this.switchToMe()!!');
    }
    this.ModelMat.setTranslate(0.0,0.0,0.0);
    pushMatrix(this.ModelMat);
    drawSphere(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);

    var mtrl_weight = new Material(20);
    gl.uniform3fv(this.material.K_ambi, mtrl_weight.K_ambi.slice(0,3));
    gl.uniform3fv(this.material.K_diff, mtrl_weight.K_diff.slice(0,3));
    gl.uniform3fv(this.material.K_spec, mtrl_weight.K_spec.slice(0,3));
    gl.uniform3fv(this.material.K_emit, mtrl_weight.K_emit.slice(0,3));
    gl.uniform1f(this.material.K_shiny, mtrl_weight.K_shiny);
    this.ModelMat = popMatrix();
    pushMatrix(this.ModelMat);
    this.ModelMat.translate(-3,-4,0);
    drawCylinder(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);

    var mtrl_weight2 = new Material(13);
    gl.uniform3fv(this.material.K_ambi, mtrl_weight2.K_ambi.slice(0,3));
    gl.uniform3fv(this.material.K_diff, mtrl_weight2.K_diff.slice(0,3));
    gl.uniform3fv(this.material.K_spec, mtrl_weight2.K_spec.slice(0,3));
    gl.uniform3fv(this.material.K_emit, mtrl_weight2.K_emit.slice(0,3));
    gl.uniform1f(this.material.K_shiny, mtrl_weight2.K_shiny);
    this.ModelMat = popMatrix();
    pushMatrix(this.ModelMat);
    this.ModelMat.translate(3,0,0);
    this.ModelMat.rotate(90,0,0,1);
    drawCylinder(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);

    var mtrl_podium = new Material(9);
    gl.uniform3fv(this.material.K_ambi, mtrl_podium.K_ambi.slice(0,3));
    gl.uniform3fv(this.material.K_diff, mtrl_podium.K_diff.slice(0,3));
    gl.uniform3fv(this.material.K_spec, mtrl_podium.K_spec.slice(0,3));
    gl.uniform3fv(this.material.K_emit, mtrl_podium.K_emit.slice(0,3));
    gl.uniform1f(this.material.K_shiny, mtrl_podium.K_shiny);
    this.ModelMat = popMatrix();
    pushMatrix(this.ModelMat);
    this.ModelMat.translate(-3,2,0);
    this.ModelMat.rotate(-90,1,0,0);
    this.ModelMat.rotate(-90,0,1,0);
    drawCube(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);

    this.ModelMat = popMatrix();
    pushMatrix(this.ModelMat);
    this.ModelMat.translate(2,-3,0);
    drawHexPrism(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);
}

VBObox1.prototype.reload = function() {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vboContents);
}


// Phong Shading, Blinn Phong & Phong Lighting
function VBObox2() {
    this.VERT_SRC =
    'struct MatlT {\n' +
	'	vec3 Ke;\n' +
	'	vec3 Ka;\n' +
	'	vec3 Kd;\n' +
	'	vec3 Ks;\n' +
	'	float shiny;\n' +
    '};\n' +

    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'attribute vec3 a_Color;\n'+ 

    'uniform MatlT u_Material;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +

    'varying vec3 v_Kd;\n' +
    'varying vec4 v_Position;\n' +
    'varying vec3 v_Normal;\n' +

    'void main() {\n' +
    '   gl_Position = u_MvpMatrix * a_Position;\n' +
    '   v_Position = u_ModelMatrix * a_Position;\n' +
    '   v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '   v_Kd = u_Material.Kd * a_Color;\n' +
    ' }\n';
  
    this.FRAG_SRC = 
    'precision highp float;\n' +
    'precision highp int;\n' +

    'struct LampT {\n' +
    '   vec3 pos;\n' +	
    ' 	vec3 Ia;\n' +	
    ' 	vec3 Id;\n' +	
    '	vec3 Is;\n' +	
    '}; \n' +

    'struct MatlT {\n' +
	'	vec3 Ke;\n' +
	'	vec3 Ka;\n' +
	'	vec3 Kd;\n' +
	'	vec3 Ks;\n' +
	'	float shiny;\n' +
    '};\n' +

    'uniform LampT u_Lamp;\n' +
    'uniform MatlT u_Material;\n' +
    'uniform vec3 u_eyePosWorld;\n' +
    'uniform int u_Blinn;\n' +
    
    'varying vec3 v_Normal;\n' +
    'varying vec4 v_Position;\n' +
    'varying vec3 v_Kd;\n' +

    'void main() {\n' +
    '   vec3 normal = normalize(v_Normal);\n' +
    '   vec3 lightDirection = normalize(u_Lamp.pos - v_Position.xyz);\n' +
    '   vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +

    '   float nDotL = max(dot(lightDirection, normal), 0.0);\n' + 
    '   float e64;\n' +
    '   if (u_Blinn == 1){\n' +
    '       vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '       float nDotH = max(dot(H, normal), 0.0); \n' +
    '       e64 = pow(nDotH, u_Material.shiny);\n' +
    '   }\n' +
    '   else {\n' +
    '       vec3 R = reflect(-lightDirection, normal);\n' +
    '       float rDotV = max(dot(R, eyeDirection), 0.0);\n' +
    '       e64 = pow(rDotV, u_Material.shiny);\n' +
    '   }\n' +
    '   vec3 ambient = u_Lamp.Ia * u_Material.Ka;\n' +
    '   vec3 diffuse = u_Lamp.Id * v_Kd * nDotL;\n' +
    '	vec3 specular = u_Lamp.Is * u_Material.Ks * e64;\n' +
    '   vec3 emissive = u_Material.Ke;\n' +
    '   gl_FragColor = vec4(ambient + diffuse + specular + emissive, 1.0);\n' +
    '}\n';
   
    makeSphere();
    makeCylinder();
    makeCube();
    makeHexPrism();
    var totalSize = sphVerts.length + cylVerts.length + cubeVerts.length + hexVerts.length;
    var n = totalSize / floatsPerVertex;
    var vertices = new Float32Array(totalSize);

    sphStart = 0;
    for (i = 0, j = 0; j < sphVerts.length; i++, j++){
        vertices[i] = sphVerts[j];
    }
    cylStart = i;
    for (j = 0; j < cylVerts.length; i++, j++){
        vertices[i] = cylVerts[j];
    }

    cubeStart = i;
    for (j = 0; j < cubeVerts.length; i++, j++){
        vertices[i] = cubeVerts[j];
    }

    hexStart = i;
    for (j = 0; j < hexVerts.length; i++, j++){
        vertices[i] = hexVerts[j];
    }

    this.vboContents = vertices;
    this.vboVerts = n;
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
    this.vboBytes = this.vboContents.length * this.FSIZE;
    this.vboStride = this.vboBytes / this.vboVerts;

    this.vboFcount_a_Pos0 =  4;
    this.vboFcount_a_Colr0 = 3;
    this.vboFcount_a_Norm0 = 3;
    console.assert((this.vboFcount_a_Pos0 + this.vboFcount_a_Colr0 + this.vboFcount_a_Norm0) * this.FSIZE == this.vboStride, 
        "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");
    
    this.vboOffset_a_Pos0 = 0;
    this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;
    this.vboOffset_a_Norm0 = (this.vboFcount_a_Pos0 + this.vboFcount_a_Colr0) * this.FSIZE;

    this.vboLoc;
    this.shaderLoc;	
    this.a_PosLoc;	
    this.a_ColrLoc;	
    this.a_NormLoc;

    this.ModelMat = new Matrix4();
    this.u_ModelMatLoc;
    this.u_MvpMatLoc;	
    this.u_NormalMatLoc;

    this.u_eyePosWorldLoc;
    this.u_BlinnLoc;

    this.material = new Material();
    this.material.K_ambi;
    this.material.K_diff;
    this.material.K_spec;
    this.material.K_emit;
    this.material.K_shiny;

    this.lamp = new LightsT();
    this.lamp.u_pos;
    this.lamp.u_ambi;
    this.lamp.u_diff;
    this.lamp.u_spec;
}

VBObox2.prototype.init = function() {
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
        console.log(this.constructor.name + 
                '.init() failed to create executable Shaders on the GPU. Bye!');
        return;
    }
    gl.program = this.shaderLoc;
    
    this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
        console.log(this.constructor.name + 
    		    '.init() failed to create VBO in GPU. Bye!'); 
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
    gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);  

    this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
    if(this.a_PosLoc < 0) {
        console.log(this.constructor.name + 
                '.init() Failed to get GPU location of attribute a_Position');
        return -1;
    }

    this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Color');
    if(this.a_ColrLoc < 0) {
        console.log(this.constructor.name + 
                '.init() failed to get the GPU location of attribute a_Color');
        return -1;
    }

    this.a_NormLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
    if(this.a_NormLoc < 0) {
        console.log(this.constructor.name + 
                '.init() Failed to get GPU location of attribute a_Normal');
        return -1;
    }

    this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
    this.u_MvpMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
    this.u_NormalMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
    if (!this.u_ModelMatLoc || !this.u_MvpMatLoc || !this.u_NormalMatLoc) { 
        console.log(this.constructor.name + 
                '.init() failed to get GPU location of uniform Matrices');
        return;
    }

    this.u_eyePosWorldLoc = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
    this.u_BlinnLoc = gl.getUniformLocation(this.shaderLoc, 'u_Blinn');
    if(!this.u_eyePosWorldLoc || !this.u_BlinnLoc) {
        console.log(this.constructor.name + 
                '.init() Failed to get GPU location of uniform u_eyePosWorld or u_Blinn');
        return;
    }

    this.lamp.u_pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp.pos');
    this.lamp.u_ambi = gl.getUniformLocation(this.shaderLoc, 'u_Lamp.Ia');
    this.lamp.u_diff = gl.getUniformLocation(this.shaderLoc, 'u_Lamp.Id');
    this.lamp.u_spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp.Is');
    if(!this.lamp.u_pos || !this.lamp.u_ambi || !this.lamp.u_diff || !this.lamp.u_spec ) {
        console.log(this.constructor.name + 
                '.init() failed to get GPU location of uniform u_Lamp.');
        return;
    }

    this.material.K_ambi = gl.getUniformLocation(this.shaderLoc, 'u_Material.Ka');
    this.material.K_diff = gl.getUniformLocation(this.shaderLoc, 'u_Material.Kd');
    this.material.K_spec = gl.getUniformLocation(this.shaderLoc, 'u_Material.Ks');
    this.material.K_emit = gl.getUniformLocation(this.shaderLoc, 'u_Material.Ke');
	this.material.K_shiny = gl.getUniformLocation(this.shaderLoc, 'u_Material.shiny');
    if (!this.material.K_ambi || !this.material.K_diff || 
        !this.material.K_spec || !this.material.K_emit || !this.material.K_shiny) {
        console.log(this.constructor.name + 
                '.init() failed to get GPU location of uniform u_Material.');
        return;
    }
}

VBObox2.prototype.switchToMe = function() {
    gl.useProgram(this.shaderLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
    gl.vertexAttribPointer( 
        this.a_PosLoc,
        this.vboFcount_a_Pos0,
        gl.FLOAT,
        false,
        this.vboStride,
        this.vboOffset_a_Pos0);                    	
    gl.vertexAttribPointer( 
        this.a_ColrLoc, 
        this.vboFcount_a_Colr0, 
        gl.FLOAT, 
        false, 
        this.vboStride, 
        this.vboOffset_a_Colr0);
    gl.vertexAttribPointer( 
        this.a_NormLoc,
        this.vboFcount_a_Norm0,
        gl.FLOAT,
        false,
        this.vboStride,
        this.vboOffset_a_Norm0);         
    gl.enableVertexAttribArray(this.a_PosLoc);
    gl.enableVertexAttribArray(this.a_ColrLoc);
    gl.enableVertexAttribArray(this.a_NormLoc);
}

VBObox2.prototype.isReady = function() {
    var isOK = true;

    if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
        console.log(this.constructor.name + 
                            '.isReady() false: shader program at this.shaderLoc not in use!');
        isOK = false;
    }
    if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + 
                            '.isReady() false: vbo at this.vboLoc not in use!');
        isOK = false;
    }
    return isOK;
}

VBObox2.prototype.adjust = function() {
    if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }

    gl.uniform3f(this.u_eyePosWorldLoc, cam_x, cam_y, cam_z);

    gl.uniform3fv(this.lamp.u_pos, [-lit_x, lit_y, -lit_z]);
    if (lampOn != 0) {
        gl.uniform3fv(this.lamp.u_ambi, [ia_r, ia_g, ia_b]); 
        gl.uniform3fv(this.lamp.u_diff, [id_r*4, id_g*4, id_b*4]);
        gl.uniform3fv(this.lamp.u_spec, [is_r*4, is_g*4, is_b*4]);
    } else {
        gl.uniform3fv(this.lamp.u_ambi, [0,0,0]); 
        gl.uniform3fv(this.lamp.u_diff, [0,0,0]);
        gl.uniform3fv(this.lamp.u_spec, [0,0,0]);
    }

    var mtrl = new Material(mat_index);
    gl.uniform3fv(this.material.K_ambi, mtrl.K_ambi.slice(0,3));
    gl.uniform3fv(this.material.K_diff, mtrl.K_diff.slice(0,3));
    gl.uniform3fv(this.material.K_spec, mtrl.K_spec.slice(0,3));
    gl.uniform3fv(this.material.K_emit, mtrl.K_emit.slice(0,3));
    gl.uniform1f(this.material.K_shiny, mtrl.K_shiny);

    gl.uniform1i(this.u_BlinnLoc, blinn);
}

VBObox2.prototype.draw = function() {
    if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
                '.draw() call you needed to call this.switchToMe()!!');
    }
    this.ModelMat.setTranslate(0.0,0.0,0.0);
    pushMatrix(this.ModelMat);
    drawSphere(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);

    var mtrl_weight = new Material(20);
	gl.uniform3fv(this.material.K_ambi, mtrl_weight.K_ambi.slice(0,3));
    gl.uniform3fv(this.material.K_diff, mtrl_weight.K_diff.slice(0,3));
    gl.uniform3fv(this.material.K_spec, mtrl_weight.K_spec.slice(0,3));
    gl.uniform3fv(this.material.K_emit, mtrl_weight.K_emit.slice(0,3));
    gl.uniform1f(this.material.K_shiny, mtrl_weight.K_shiny);
    this.ModelMat = popMatrix();
    pushMatrix(this.ModelMat);
    this.ModelMat.translate(-3,-4,0);
    drawCylinder(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);

    var mtrl_weight2 = new Material(13);
	gl.uniform3fv(this.material.K_ambi, mtrl_weight2.K_ambi.slice(0,3));
    gl.uniform3fv(this.material.K_diff, mtrl_weight2.K_diff.slice(0,3));
    gl.uniform3fv(this.material.K_spec, mtrl_weight2.K_spec.slice(0,3));
    gl.uniform3fv(this.material.K_emit, mtrl_weight2.K_emit.slice(0,3));
    gl.uniform1f(this.material.K_shiny, mtrl_weight2.K_shiny);
    this.ModelMat = popMatrix();
    pushMatrix(this.ModelMat);
    this.ModelMat.translate(3,0,0);
    this.ModelMat.rotate(90,0,0,1);
    drawCylinder(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);

    var mtrl_podium = new Material(9);
	gl.uniform3fv(this.material.K_ambi, mtrl_podium.K_ambi.slice(0,3));
    gl.uniform3fv(this.material.K_diff, mtrl_podium.K_diff.slice(0,3));
    gl.uniform3fv(this.material.K_spec, mtrl_podium.K_spec.slice(0,3));
    gl.uniform3fv(this.material.K_emit, mtrl_podium.K_emit.slice(0,3));
    gl.uniform1f(this.material.K_shiny, mtrl_podium.K_shiny);
    this.ModelMat = popMatrix();
    pushMatrix(this.ModelMat);
    this.ModelMat.translate(-3,2,0);
    this.ModelMat.rotate(-90,1,0,0);
    this.ModelMat.rotate(-90,0,1,0);
    drawCube(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);

    this.ModelMat = popMatrix();
    pushMatrix(this.ModelMat);
    this.ModelMat.translate(2,-3,0);
    drawHexPrism(this.ModelMat, this.u_ModelMatLoc, this.u_MvpMatLoc, this.u_NormalMatLoc);
}

VBObox2.prototype.reload = function() {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vboContents);
}