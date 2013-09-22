//--------------------------------------------------------------------
// WebGL Analyser
//

var ANALYSISTYPE_FREQUENCY = 0;
var ANALYSISTYPE_SONOGRAM = 1;
var ANALYSISTYPE_3D_SONOGRAM = 2;
var ANALYSISTYPE_WAVEFORM = 3;

/**
 * Class AnalyserView
 */

AnalyserView = function(canvasElementID) {
    this.canvasElementID = canvasElementID;
    this.analysisType = ANALYSISTYPE_FREQUENCY;
    this.freqByteData = 0;
	this.alltimemax = 0;
    this.initGL();
}

function load3DSonogram( shader ) {
    this.sonogram3DShader = shader; 
}

AnalyserView.prototype.initGL = function() {
    var canvas = document.getElementById(this.canvasElementID);
    this.canvas = canvas;
}

AnalyserView.prototype.initByteBuffer = function( analyser ) {
    var gl = this.gl;
    var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;
    
    if (!this.freqByteData || this.freqByteData.length != analyser.frequencyBinCount) {
        freqByteData = new Uint8Array(analyser.frequencyBinCount);
        this.freqByteData = freqByteData;
    }
}

AnalyserView.prototype.setAnalysisType = function(type) {
    // Check for read textures in vertex shaders.
    if (!this.has3DVisualizer && type == ANALYSISTYPE_3D_SONOGRAM)
        return;

    this.analysisType = type;
}

AnalyserView.prototype.analysisType = function() {
    return this.analysisType;
}


AnalyserView.prototype.doFrequencyAnalysis = function( analyser ) {
    var freqByteData = this.freqByteData;
    analyser.getByteFrequencyData(freqByteData);  
    this.draw();
}


AnalyserView.prototype.draw = function() {	
    var canvas = this.canvas;
	var freqByteData = this.freqByteData;
	
	var sum = 0;
	for(var i = 0; i < freqByteData.length; ++i) {
		sum += freqByteData[i];
	}
	var avg = Math.round(sum / ((128 * 256) / 100)  );
	var ctx = canvas.getContext("2d");
	
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.font="10px Arial";
	/*ctx.fillStyle="white";
	ctx.fillText("SUM: " + sum,10, 20);
	ctx.fillText("AVG: " + avg + "%",150, 20);*/
	
	// constants
	var HEIGHT = 200;  // max height of the canvas
	var BASE_Y = 50; // position of the spectrum
	var WIDTH = 8; // width of a bar
	var MIN_HEIGHT = 1; // minimum height to display

	var max = freqByteData.length; // local, pre-set constant
	var step = 2; // state variables
	var x = 10;

	var _MAX_HEIGHT_IN_STEP = 200 * step;

	var alltimemax = this.alltimemax;
	
	for(var i = 0; i < max - step; i += step) {
		var stepSum = 0;
		var stepsUntil = i + step;
		for(var c = i; c < stepsUntil; ++c) {
			stepSum = stepSum + freqByteData[c];
		}
		
		var normalizedValue = stepSum / _MAX_HEIGHT_IN_STEP;		
		ctx.fillStyle = getColor(normalizedValue);
		var height = HEIGHT * normalizedValue + MIN_HEIGHT;
		ctx.fillRect(x, BASE_Y + HEIGHT - height, WIDTH, height);
		
		x += WIDTH;
		
		if (normalizedValue > alltimemax) {
			console.log('All time max changed to ' + normalizedValue + ', from ' + alltimemax + ' (freq~' + (i) + ')' );
			this.alltimemax = normalizedValue;
			alltimemax = normalizedValue;
		}
	}

	function getColor(normalizedValue) {
		if (normalizedValue < 0.10)
			return "rgb(68, 255, 0)";
		else if (normalizedValue < 0.20) 
			return "rgb(55, 207, 0)";
		else if (normalizedValue < 0.30)
			return "rgb(48, 180, 0)";
		else if (normalizedValue < 0.40)
			return "rgb(36, 135, 0)";
		else if (normalizedValue < 0.50)
			return "rgb(255, 165, 87)";
		else if (normalizedValue < 0.70)
			return "rgb(255, 119, 0)";
		else if (normalizedValue < 0.85)
			return "rgb(219, 37, 0)";
		else
			return "rgb(255,0,0)";
	}
}

