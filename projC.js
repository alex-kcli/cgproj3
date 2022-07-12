var gl;	
var g_canvasID;	

worldBox = new VBObox0();
gouraudBox = new VBObox1();
phongBox = new VBObox2();

var weightliftAngle = 0.0;
var sphereAngle = 0.0;

var weightliftAngleRate = 50.0;
var sphereAngleRate = 25.0;

var g_show0 = 1;
var g_show1 = 0;
var g_show2 = 1;

normalMatrix = new Matrix4();
viewMatrix = new Matrix4();
projMatrix = new Matrix4();
mvpMatrix = new Matrix4();

var cam_x = 0, cam_y = 9.0, cam_z = 3.0;
var foc_x = 0, foc_y = 0, foc_z = 0.4;
var angle_between = 90 * Math.PI / 180;

var lit_x = 2.0, lit_y = 1.0, lit_z = 3.0;

var ia_r = 0.5, ia_g = 0.5, ia_b = 0.5;
var id_r = 0.5, id_g = 0.5, id_b = 0.5;
var is_r = 0.5, is_g = 0.5, is_b = 0.5;

const mtrlArray = [
    "RED PLASTIC", "GRN PLASTIC", "BLU PLASTIC", "BLACK PLASTIC", "BLACK RUBBER", 
    "BRASS", "BRONZE DULL", "BRONZE SHINY", "CHROME", "COPPER DULL", "COPPER SHINY",
    "GOLD DULL", "GOLD SHINY", "PEWTER", "SILVER DULL", "SILVER SHINY", "EMERALD", 
    "JADE", "OBSIDIAN", "PEARL", "RUBY", "TURQUOISE"]

function main(){
    g_canvasID = document.getElementById('webgl');
    gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST); 

    window.addEventListener("keydown", myKeyDown, false);
    window.addEventListener("keyup", myKeyUp, false);

    worldBox.init(gl);
    gouraudBox.init(gl);
    phongBox.init(gl);

    var tick = function() {
        requestAnimationFrame(tick, g_canvasID); 
        drawResize();
        setCamera();
        animate();
        drawAll();
        getSliderValue();
        getColorValue();
        fillHTMLInst();
    };
    tick();	
}

function getSliderValue() {
    var x_slider = document.getElementById("x_axis_val");
    lit_x = x_slider.value;
    var y_slider = document.getElementById("y_axis_val");
    lit_y = y_slider.value;
    var z_slider = document.getElementById("z_axis_val");
    lit_z = z_slider.value;
}

function getColorValue() {
    var ambient_raw = document.getElementById("ambient"); 
    var aRgbHex = ambient_raw.value.match(/[a-z0-9]{1,2}/g);
        ia_r = parseInt(aRgbHex[0],16)/255;
        ia_g = parseInt(aRgbHex[1],16)/255;
        ia_b = parseInt(aRgbHex[2],16)/255;
    
    var diffuse_raw = document.getElementById("diffuse"); 
    var dRgbHex = diffuse_raw.value.match(/[a-z0-9]{1,2}/g);
        id_r = parseInt(dRgbHex[0],16)/255;
        id_g = parseInt(dRgbHex[1],16)/255;
        id_b = parseInt(dRgbHex[2],16)/255;

    var specular_raw = document.getElementById("specular"); 
    var sRgbHex = specular_raw.value.match(/[a-z0-9]{1,2}/g);
        is_r = parseInt(sRgbHex[0],16)/255;
        is_g = parseInt(sRgbHex[1],16)/255;
        is_b = parseInt(sRgbHex[2],16)/255;
}

function fillHTMLInst() {
    document.getElementById("currMtrl").innerHTML = "Sphere: " + mtrlArray[mat_index-1];

    var shade;
    if (g_show1 == 1) {
        shade = "Gouraud Shading";
    } else {
        shade = "Phong Shading";
    }
    var light;
    if (blinn == 1) {
        light = "Blinn-Phong Lighting";
    } else {
        light = "Phong Lighting";
    }
    document.getElementById("currShade").innerHTML = shade + " + " + light;
}

function drawResize(){
    var xtraMargin = 16;
    g_canvasID.width = innerWidth - xtraMargin;
    g_canvasID.height = innerHeight * 0.7;
}

function setCamera() {
    gl.viewport(0, 0, g_canvasID.width, g_canvasID.height); 
    var vpAspect = g_canvasID.width / g_canvasID.height;
    projMatrix.setPerspective(30.0, vpAspect, 1.0, 100.0);
    viewMatrix.setLookAt(cam_x, cam_y, cam_z, foc_x, foc_y, foc_z, 0.0, 0.0, 1.0);
}

function drawAll(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (g_show0 == 1){
        worldBox.switchToMe();  
        worldBox.adjust();
        worldBox.draw();
    }
    if (g_show1 == 1){
        gouraudBox.switchToMe();  
        gouraudBox.adjust();
        gouraudBox.draw();
    }
    if (g_show2 == 1){
        phongBox.switchToMe();  
        phongBox.adjust();
        phongBox.draw();
    }
}

function gouraudPhongtoggle() {
    g_show0 = 1;
    g_show1 = 1;
    g_show2 = 0;
    blinn = 0;
    console.log('g_show0: '+g_show0);
}
  
function gouraudBlinntoggle() {
    g_show0 = 1;
    g_show1 = 1;
    g_show2 = 0;
    blinn = 1;
    console.log('g_show1: '+g_show1);
}
  
function phongPhongtoggle() {
    g_show0 = 1;
    g_show1 = 0;
    g_show2 = 1;
    blinn = 0;
    console.log('g_show2: '+g_show2);
}

function phongBlinntoggle() {
    g_show0 = 1;
    g_show1 = 0;
    g_show2 = 1;
    blinn = 1;
    console.log('g_show2: '+g_show2);
}

var g_last = Date.now();
function animate() {
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;

    weightliftAngle = weightliftAngle + (weightliftAngleRate * elapsed) / 1000.0;
    if(weightliftAngle > 90.0 && weightliftAngleRate > 0) weightliftAngleRate *= -1.0;
    if(weightliftAngle <  0.0 && weightliftAngleRate < 0) weightliftAngleRate *= -1.0;
    if(weightliftAngle > 180.0) weightliftAngle = weightliftAngle - 360.0;
    if(weightliftAngle <-180.0) weightliftAngle = weightliftAngle + 360.0;

    sphereAngle = sphereAngle + (sphereAngleRate * elapsed) / 1000.0;
    if(sphereAngle > 180.0) sphereAngle = sphereAngle - 360.0;
    if(sphereAngle <-180.0) sphereAngle = sphereAngle + 360.0;
}

function makeGroundGrid() { // changed
    var floatsPerVertex = 7;

    var xcount = 100;
    var ycount = 100;		
    var xymax	= 50.0;
    var xColr = new Float32Array([1.0, 1.0, 0.3]);
    var yColr = new Float32Array([0.5, 1.0, 0.5]);

    gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
              
    var xgap = xymax/(xcount-1);
    var ygap = xymax/(ycount-1);
    
    for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
      if(v%2==0) {
        gndVerts[j  ] = -xymax + (v  )*xgap;
        gndVerts[j+1] = -xymax;
        gndVerts[j+2] = 0.0;
        gndVerts[j+3] = 1.0;
      }
      else {
        gndVerts[j  ] = -xymax + (v-1)*xgap;
        gndVerts[j+1] = xymax;
        gndVerts[j+2] = 0.0;
        gndVerts[j+3] = 1.0;
      }
      gndVerts[j+4] = xColr[0];
      gndVerts[j+5] = xColr[1];
      gndVerts[j+6] = xColr[2];
    }
    for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
      if(v%2==0) {
        gndVerts[j  ] = -xymax;
        gndVerts[j+1] = -xymax + (v  )*ygap;
        gndVerts[j+2] = 0.0;
        gndVerts[j+3] = 1.0;
      }
      else {
        gndVerts[j  ] = xymax;
        gndVerts[j+1] = -xymax + (v-1)*ygap;
        gndVerts[j+2] = 0.0;
        gndVerts[j+3] = 1.0;
      }
      gndVerts[j+4] = yColr[0];
      gndVerts[j+5] = yColr[1];
      gndVerts[j+6] = yColr[2];
    }
}

function makeAxes() { // changed
    axisVerts = new Float32Array([
      -100, 0, 0, 1, 1, 0, 0,
      100,  0, 0, 1, 1, 0, 0,
      0, -100, 0, 1, 0, 1, 0,
      0,  100, 0, 1, 0, 1, 0,
      0, 0, -100, 1, 0, 0, 1,
      0, 0,  100, 1, 0, 0, 1,
    ]);
}

function makeSphere() { // changed
    var floatsPerVertex = 10;
    var slices = 13;

    var sliceVerts	= 27;

    var topColr = new Float32Array([0.5, 0.1, 1.0]);
    var equColr = new Float32Array([0.5, 0.1, 1.0]);
    var botColr = new Float32Array([0.5, 0.1, 1.0]);
    var sliceAngle = Math.PI/slices;
    
    sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
  
    var cos0 = 0.0;
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0;
    var isLast = 0;
    var isFirst = 1;
    for(s=0; s<slices; s++) {
        if(s==0) {
            isFirst = 1;
            cos0 = 1.0;
            sin0 = 0.0;
        }
        else {
            isFirst = 0;	
            cos0 = cos1;
            sin0 = sin1;
        }
        cos1 = Math.cos((s+1)*sliceAngle);
        sin1 = Math.sin((s+1)*sliceAngle);
        if(s==slices-1) isLast=1;
        for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
            if(v%2==0) {
                sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
                sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
                sphVerts[j+2] = cos0;		
                sphVerts[j+3] = 1.0;	
                sphVerts[j+7] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
                sphVerts[j+8] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
                sphVerts[j+9] = cos0;			
            }
            else { 
                sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);
                sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);
                sphVerts[j+2] = cos1;
                sphVerts[j+3] = 1.0;	
                sphVerts[j+7] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);
                sphVerts[j+8] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);
                sphVerts[j+9] = cos1;	
            }
            if(s==0) {
                sphVerts[j+4]=topColr[0]; 
                sphVerts[j+5]=topColr[1]; 
                sphVerts[j+6]=topColr[2];	
            }
            else if(s==slices-1) {
                sphVerts[j+4]=botColr[0]; 
                sphVerts[j+5]=botColr[1]; 
                sphVerts[j+6]=botColr[2];	
            }
            else {
                sphVerts[j+4]=equColr[0];
                sphVerts[j+5]=equColr[1]; 
                sphVerts[j+6]=equColr[2];				
            }
        }
    }
}

function makeHexPrism() { // changed
    var ctrColr = new Float32Array([240/255, 240/255, 240/255]);
    var topColr = new Float32Array([240/255, 240/255, 240/255]);
    var botColr = new Float32Array([240/255, 240/255, 240/255]);
    var capVerts = 6;
    var botRadius = 1.0;
     
    hexVerts = new Float32Array(  ((capVerts*6)+6 ) * floatsPerVertex);
    
    for(v=0,j=0; v<2*capVerts+2; v++,j+=floatsPerVertex) {	
        if(v%2==0) {
            hexVerts[j  ] = 0.0; 
            hexVerts[j+1] = 0.0;	
            hexVerts[j+2] = 1.0; 
            hexVerts[j+3] = 1.0;
            hexVerts[j+4]=ctrColr[0]; 
            hexVerts[j+5]=ctrColr[1]; 
            hexVerts[j+6]=ctrColr[2];
        }
        else { 
            hexVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);
            hexVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);
            hexVerts[j+2] = 1.0;
            hexVerts[j+3] = 1.0;
            hexVerts[j+4]=topColr[0]; 
            hexVerts[j+5]=topColr[1]; 
            hexVerts[j+6]=topColr[2];			
        }
        hexVerts[j+7] = 0.0;
        hexVerts[j+8] = 0.0;
        hexVerts[j+9] = 1.0;
    }
    for(v=0; v< 2*capVerts+2; v++, j+=floatsPerVertex) {
        if(v%2==0) {		
            hexVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);
            hexVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);
            hexVerts[j+2] = 1.0;
            hexVerts[j+3] = 1.0;
            hexVerts[j+4]=topColr[0]; 
            hexVerts[j+5]=topColr[1]; 
            hexVerts[j+6]=topColr[2];	
                
            hexVerts[j+7] = Math.cos(Math.PI*(v)/capVerts);
            hexVerts[j+8] = Math.sin(Math.PI*(v)/capVerts);
            hexVerts[j+9] = 0.0;
        }
        else {
            hexVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);
            hexVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);
            hexVerts[j+2] =-1.0;
            hexVerts[j+3] = 1.0;
            hexVerts[j+4]=botColr[0]; 
            hexVerts[j+5]=botColr[1]; 
            hexVerts[j+6]=botColr[2];	
                    
            hexVerts[j+7] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);
            hexVerts[j+8] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);
            hexVerts[j+9] = 0.0;
        }
    }
    for(v=0; v < 2*capVerts+2; v++, j+= floatsPerVertex) {
        if(v%2==0) {
            hexVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);
            hexVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);
            hexVerts[j+2] =-1.0;
            hexVerts[j+3] = 1.0;
            hexVerts[j+4]=botColr[0]; 
            hexVerts[j+5]=botColr[1]; 
            hexVerts[j+6]=botColr[2];		
        }
        else {
            hexVerts[j  ] = 0.0;
            hexVerts[j+1] = 0.0;
            hexVerts[j+2] =-1.0;
            hexVerts[j+3] = 1.0;
            hexVerts[j+4]=botColr[0]; 
            hexVerts[j+5]=botColr[1]; 
            hexVerts[j+6]=botColr[2];
        }
        hexVerts[j+7] = 0.0;
        hexVerts[j+8] = 0.0;
        hexVerts[j+9] = -1.0;
    }
}

function makeCube() { // changed
    cubeVerts = new Float32Array([
        -1,  1,  1,  1, 170/255, 66/255, 245/255, -1, 0, 0, // front top left
        -1,  1, -1,  1, 170/255, 66/255, 245/255, -1, 0, 0, // back top left
        -1, -1, -1,  1, 66/255, 188/255, 245/255, -1, 0, 0, // back lower left

        -1, -1, -1,  1, 66/255, 188/255, 245/255, -1, 0, 0, // back lower left
        -1, -1,  1,  1, 66/255, 188/255, 245/255, -1, 0, 0, // front lower left
        -1,  1,  1,  1, 170/255, 66/255, 245/255, -1, 0, 0, // front top left

        1,   1,  1,  1, 170/255, 66/255, 245/255,  1, 0, 0, // front top right
        1,   1, -1,  1, 170/255, 66/255, 245/255,  1, 0, 0, // back top right
        1,  -1, -1,  1, 66/255, 188/255, 245/255,  1, 0, 0, // back lower right

        1,  -1, -1,  1, 66/255, 188/255, 245/255,  1, 0, 0, // back lower right
        1,  -1,  1,  1, 66/255, 188/255, 245/255,  1, 0, 0, // front lower right
        1,   1,  1,  1, 170/255, 66/255, 245/255,  1, 0, 0, // front top right

        -1, -1,  1,  1, 66/255, 188/255, 245/255, 0, -1, 0, // front lower left
        1,  -1,  1,  1, 66/255, 188/255, 245/255, 0, -1, 0, // front lower right
        -1, -1, -1,  1, 66/255, 188/255, 245/255, 0, -1, 0, // back lower left

        1,  -1,  1,  1, 66/255, 188/255, 245/255, 0, -1, 0, // front lower right
        -1, -1, -1,  1, 66/255, 188/255, 245/255, 0, -1, 0, // back lower left
        1,  -1, -1,  1, 66/255, 188/255, 245/255, 0, -1, 0, // back lower right

        -1, -1,  1,  1, 66/255, 188/255, 245/255, 0, 0, 1, // front lower left
        1,  -1,  1,  1, 66/255, 188/255, 245/255, 0, 0, 1, // front lower right
        -1,  1,  1,  1, 170/255, 66/255, 245/255, 0, 0, 1, // front top left

        -1,  1,  1,  1, 170/255, 66/255, 245/255, 0, 0, 1, // front top left
        1,   1,  1,  1, 170/255, 66/255, 245/255, 0, 0, 1, // front top right
        1,  -1,  1,  1, 66/255, 188/255, 245/255, 0, 0, 1, // front lower right

        -1,  1,  1,  1, 170/255, 66/255, 245/255, 0, 1, 0, // front top left
        1,   1,  1,  1, 170/255, 66/255, 245/255, 0, 1, 0, // front top right
        -1,  1, -1,  1, 170/255, 66/255, 245/255, 0, 1, 0, // back top left

        1,   1,  1,  1, 170/255, 66/255, 245/255, 0, 1, 0, // front top right
        -1,  1, -1,  1, 170/255, 66/255, 245/255, 0, 1, 0, // back top left
        1,   1, -1,  1, 170/255, 66/255, 245/255, 0, 1, 0, // back top right

        -1,  1, -1,  1, 170/255, 66/255, 245/255, 0, 0, -1, // back top left
        1,   1, -1,  1, 170/255, 66/255, 245/255, 0, 0, -1, // back top right
        -1, -1, -1,  1, 66/255, 188/255, 245/255, 0, 0, -1, // back lower left

        -1, -1, -1,  1, 66/255, 188/255, 245/255, 0, 0, -1, // back lower left
        1,  -1, -1,  1, 66/255, 188/255, 245/255, 0, 0, -1, // back lower right
        1,   1, -1,  1, 170/255, 66/255, 245/255, 0, 0, -1, // back top right
    ]);
}

function makeCylinder() { // changed
    var ctrColr = new Float32Array([245/255, 233/255, 66/255]);
    var topColr = new Float32Array([245/255, 233/255, 66/255]);
    var botColr = new Float32Array([245/255, 233/255, 66/255]);
    var capVerts = 16;
    var botRadius = 1.0;
     
    cylVerts = new Float32Array(  ((capVerts*6)+6 ) * floatsPerVertex);
    
    for(v=0,j=0; v<2*capVerts+2; v++,j+=floatsPerVertex) {	
        if(v%2==0) {
            cylVerts[j  ] = 0.0; 
            cylVerts[j+1] = 0.0;	
            cylVerts[j+2] = 1.0; 
            cylVerts[j+3] = 1.0;
            cylVerts[j+4]=ctrColr[0]; 
            cylVerts[j+5]=ctrColr[1]; 
            cylVerts[j+6]=ctrColr[2];
        }
        else { 
            cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);
            cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);
            cylVerts[j+2] = 1.0;
            cylVerts[j+3] = 1.0;
            cylVerts[j+4]=topColr[0]; 
            cylVerts[j+5]=topColr[1]; 
            cylVerts[j+6]=topColr[2];			
        }
        cylVerts[j+7] = 0.0;
        cylVerts[j+8] = 0.0;
        cylVerts[j+9] = 1.0;
    }
    for(v=0; v< 2*capVerts+2; v++, j+=floatsPerVertex) {
        if(v%2==0) {		
            cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);
            cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);
            cylVerts[j+2] = 1.0;
            cylVerts[j+3] = 1.0;
            cylVerts[j+4]=topColr[0]; 
            cylVerts[j+5]=topColr[1]; 
            cylVerts[j+6]=topColr[2];	
                
            cylVerts[j+7] = Math.cos(Math.PI*(v)/capVerts);
            cylVerts[j+8] = Math.sin(Math.PI*(v)/capVerts);
            cylVerts[j+9] = 0.0;
        }
        else {
            cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);
            cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);
            cylVerts[j+2] =-1.0;
            cylVerts[j+3] = 1.0;
            cylVerts[j+4]=botColr[0]; 
            cylVerts[j+5]=botColr[1]; 
            cylVerts[j+6]=botColr[2];	
                    
            cylVerts[j+7] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);
            cylVerts[j+8] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);
            cylVerts[j+9] = 0.0;
        }
    }
    for(v=0; v < 2*capVerts+2; v++, j+= floatsPerVertex) {
        if(v%2==0) {
            cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);
            cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);
            cylVerts[j+2] =-1.0;
            cylVerts[j+3] = 1.0;
            cylVerts[j+4]=botColr[0]; 
            cylVerts[j+5]=botColr[1]; 
            cylVerts[j+6]=botColr[2];		
        }
        else {
            cylVerts[j  ] = 0.0;
            cylVerts[j+1] = 0.0;
            cylVerts[j+2] =-1.0;
            cylVerts[j+3] = 1.0;
            cylVerts[j+4]=botColr[0]; 
            cylVerts[j+5]=botColr[1]; 
            cylVerts[j+6]=botColr[2];
        }
        cylVerts[j+7] = 0.0;
        cylVerts[j+8] = 0.0;
        cylVerts[j+9] = -1.0;
    }
}

function drawSphere(modelMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix){
    modelMatrix.scale(0.9,0.9,0.9);
    modelMatrix.translate(0,0,0);
    modelMatrix.rotate(sphereAngle, 0,0,1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart/floatsPerVertex, sphVerts.length/floatsPerVertex);
}

function drawCylinder(modelMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix){
    // Central Bar
    modelMatrix.translate(0, -1, 0);
    modelMatrix.rotate(weightliftAngle, 1, 0, 0);
    modelMatrix.translate(0, 1, 0);
    pushMatrix(modelMatrix);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.scale(0.06,0.06,1.7);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    var capVerts = 16;
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 2+capVerts*2, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 4+capVerts*4, 2+capVerts*2);

    // Left weight
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.translate(0,0,1.1);
    modelMatrix.scale(0.5,0.5,0.1);
    modelMatrix.rotate(sphereAngle,0,0,1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    var capVerts = 16;
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 2+capVerts*2, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 4+capVerts*4, 2+capVerts*2);

    // Right weight
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.translate(0, 0, -1.1);
    modelMatrix.scale(0.5,0.5,0.1);
    modelMatrix.rotate(sphereAngle,0,0,1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    var capVerts = 16;
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 2+capVerts*2, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 4+capVerts*4, 2+capVerts*2);

    // Left extra weight
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.translate(0, 0, 1.25);
    modelMatrix.scale(0.3,0.3,0.05);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    var capVerts = 16;
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 2+capVerts*2, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 4+capVerts*4, 2+capVerts*2);

    // Right extra weight
    modelMatrix = popMatrix();
    // pushMatrix(modelMatrix);
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.translate(0, 0, -1.25);
    modelMatrix.scale(0.3,0.3,0.05);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    var capVerts = 16;
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 2+capVerts*2, 2+capVerts*2);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex + 4+capVerts*4, 2+capVerts*2);
}

function drawCube(modelMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix){
    modelMatrix.scale(0.5,0.5,0.5);
    pushMatrix(modelMatrix);
    modelMatrix.scale(1,0.4,1);
    modelMatrix.rotate(sphereAngle, 0,1,0);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);

    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(0,-1.1,0);
    modelMatrix.rotate(sphereAngle, 0,1,0);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.scale(0.1,0.1,1.4);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);

    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(0,-2.6,0);
    modelMatrix.rotate(weightliftAngle,1,0,1);
    modelMatrix.scale(0.1,0.1,1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);

    modelMatrix = popMatrix();
    modelMatrix.translate(0,-2.6,0);
    modelMatrix.rotate(weightliftAngle,1,0,1);
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.scale(0.1,0.1,1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);
}

function drawHexPrism(modelMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix){
    
    modelMatrix.translate(0,0,1);
    pushMatrix(modelMatrix);
    modelMatrix.scale(0.1,0.1,1);
    // modelMatrix.rotate(sphereAngle, 0,0,1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, hexStart/floatsPerVertex, hexVerts.length/floatsPerVertex);

    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(0,0,1);
    
    modelMatrix.rotate(90, 0,1,0);
    // modelMatrix.rotate(sphereAngle, 1,0,0);
    modelMatrix.scale(0.1,0.1,1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, hexStart/floatsPerVertex, hexVerts.length/floatsPerVertex);

    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
    modelMatrix.translate(0.7,0,1);
    modelMatrix.rotate(weightliftAngle, 1,0,1);
    pushMatrix(modelMatrix);
    modelMatrix.scale(0.1,0.1,0.5);
    modelMatrix.translate(0,0,-1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, hexStart/floatsPerVertex, hexVerts.length/floatsPerVertex);

    modelMatrix = popMatrix();
    modelMatrix.translate(0,0,-0.5);
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.translate(0,0,0.5);
    modelMatrix.scale(0.1,0.1,0.5);
    modelMatrix.translate(0,0,-1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, hexStart/floatsPerVertex, hexVerts.length/floatsPerVertex);


    modelMatrix = popMatrix();
    // pushMatrix(modelMatrix);
    modelMatrix.translate(-0.7,0,1);
    modelMatrix.rotate(-weightliftAngle, 1,0,1);
    pushMatrix(modelMatrix);
    modelMatrix.scale(0.1,0.1,0.5);
    modelMatrix.translate(0,0,-1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, hexStart/floatsPerVertex, hexVerts.length/floatsPerVertex);

    modelMatrix = popMatrix();
    modelMatrix.translate(0,0,-0.5);
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.translate(0,0,0.5);
    modelMatrix.scale(0.1,0.1,0.5);
    modelMatrix.translate(0,0,-1);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, hexStart/floatsPerVertex, hexVerts.length/floatsPerVertex);
}

function myKeyDown(kev) { // changed
    switch(kev.code) {
        case "KeyA":
          console.log("a/A key: Strafe LEFT!\n");
          camLeft();
          break;
        case "KeyD":
          console.log("d/D key: Strafe RIGHT!\n");
          camRight();
          break;
        case "KeyS":
          console.log("s/S key: Move BACK!\n");
          camUnZoom();
          break;
        case "KeyW":
          console.log("w/W key: Move FWD!\n");
          camZoom();
          break;
        
        case "KeyF":
          console.log("f/F key: Pan LEFT!\n");
          panLeft();
          break;
        case "KeyH":
          console.log("h/H key: Pan RIGHT!\n");
          panRight();
          break;
        case "KeyG":
          console.log("g/G key: Pan DOWN!\n");
          panDown();
          break;
        case "KeyT":
          console.log("t/T key: Pan UP!\n");
          panUp();
          break;

        case "KeyO":
            lampOn = !lampOn;
            break;
        
        case "KeyM":
            mat_index += 1;
            if (mat_index > 22) {
                mat_index = 1;
            }
            mtrl.setMatl(mat_index);
            break;

      default:
        console.log("UNUSED!");
        break;
    }
}

function myKeyUp(kev) {
    console.log('myKeyUp()--keyCode='+kev.keyCode+' released.');
}

function camLeft() {
	var x_distance = cam_x - foc_x;
	var y_distance = cam_y - foc_y;
	var radius = Math.sqrt(x_distance ** 2 + y_distance ** 2)
	cam_x += 0.1 * y_distance / radius;
	cam_y -= 0.1 * x_distance / radius;
	foc_x += 0.1 * y_distance / radius;
	foc_y -= 0.1 * x_distance / radius;
}

function camRight() {
	var x_distance = cam_x - foc_x;
	var y_distance = cam_y - foc_y;
	var radius = Math.sqrt(x_distance ** 2 + y_distance ** 2)
	cam_x -= 0.1 * y_distance / radius;
	cam_y += 0.1 * x_distance / radius;
	foc_x -= 0.1 * y_distance / radius;
	foc_y += 0.1 * x_distance / radius;
}

function camZoom() {
	cam_x -= 0.1 * (cam_x - foc_x);
	cam_y -= 0.1 * (cam_y - foc_y);
	cam_z -= 0.1 * (cam_z - foc_z);
	foc_x -= 0.1 * (cam_x - foc_x);
	foc_y -= 0.1 * (cam_y - foc_y);
	foc_z -= 0.1 * (cam_z - foc_z);
}

function camUnZoom() {
	cam_x += 0.1 * (cam_x - foc_x);
	cam_y += 0.1 * (cam_y - foc_y);
	cam_z += 0.1 * (cam_z - foc_z);
	foc_x += 0.1 * (cam_x - foc_x);
	foc_y += 0.1 * (cam_y - foc_y);
	foc_z += 0.1 * (cam_z - foc_z);
}

function panUp() {
	foc_z += 0.05;
}

function panDown() {
	foc_z -= 0.05;
}

function panLeft() {
	var x_distance = cam_x - foc_x;
	var y_distance = cam_y - foc_y;
	var radius = Math.sqrt(x_distance ** 2 + y_distance ** 2)
	angle_between += 0.1;
    foc_x = cam_x - radius * Math.cos(angle_between);
	foc_y = cam_y - radius * Math.sin(angle_between);
}

function panRight() {
	var x_distance = cam_x - foc_x;
	var y_distance = cam_y - foc_y;
	var radius = Math.sqrt(x_distance ** 2 + y_distance ** 2)
	angle_between -= 0.1;
    foc_x = cam_x - radius * Math.cos(angle_between);
	foc_y = cam_y - radius * Math.sin(angle_between);
}