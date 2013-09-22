LoudnessDetector = function(canvasElementID) {
    this.prevFreqData = 0;
    this.canvasElementID = canvasElementID;
    this.canvas = document.getElementById(this.canvasElementID);
    this.drawer = new FreqDrawer(this.canvas);
}

LoudnessDetector.prototype.analyse = function(freqData) {
    var prevFreqData = this.prevFreqData;
    
    if (prevFreqData === 0) {
        this.prevFreqData = cloneArray(freqData);
        return;
    }
    var diffData = calculateDerivedFreqData(new Uint8Array(freqData.length));
     
    function calculateDerivedFreqData(diffData) {
        for(var i = 0; i < freqData.length; ++i) {
            var c = freqData[i] - prevFreqData[i];
            if (c < 0)
                c = 0;
            diffData[i] = c;
        }
        return diffData;
    }
    
    this.drawer.draw(diffData);
    this.prevFreqData = cloneArray(freqData);
    
    var diffs = [];
    
    // to-from * scale [scale=128]
    var speakLow = sumInInterval(diffData, 0, 50) / 6400;
    var speakMed = sumInInterval(diffData, 51, 85) / 4352;
    var speakHigh = sumInInterval(diffData, 86, 120) / 4352;
    var high = sumInInterval(diffData, 121, 250) / 16512;
    
    var canvas = this.canvas;
	var ctx = canvas.getContext("2d");
    ctx.font="10px Arial";
    ctx.fillStyle="gray";
    ctx.fillText(speakLow + "," + speakMed + "," + speakHigh + "," + high, 10, 10);
}


function sumInInterval(array, from, to) {
    var sum = 0;
    for(var i = from; i <= to; ++i) {
        sum += array[i];
    }
    return sum;
}

function cloneArray(input) {
    var output = new Uint8Array(input.length);
    for(var i = 0; i < output.length; ++i)
        output[i] = input[i];
    return output;
}