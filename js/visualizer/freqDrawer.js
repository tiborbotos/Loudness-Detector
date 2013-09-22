FreqDrawer = function(canvas) {
    this.canvas = canvas;
}

FreqDrawer.prototype.draw = function(freqByteData) {
    var canvas = this.canvas;
	var ctx = canvas.getContext("2d");
	
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.font="10px Arial";
	
	// constants
	var HEIGHT = 200;  // max height of the canvas
	var BASE_Y = 50; // position of the spectrum
	var WIDTH = 8; // width of a bar
	var MIN_HEIGHT = 1; // minimum height to display

	var max = freqByteData.length; // local, pre-set constant
	var step = 2; // state variables
	var x = 10;

	var _MAX_HEIGHT_IN_STEP = 255 * step;

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