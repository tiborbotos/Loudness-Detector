
/**
 * Class AnalyserView
 */

AnalyserView = function(canvasElementID) {
    this.canvasElementID = canvasElementID;
    this.freqByteData = 0;
	this.alltimemax = 0;
    this.initGL();
    this.drawer = new FreqDrawer(this.canvas);
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

AnalyserView.prototype.doFrequencyAnalysis = function( analyser ) {
    var freqByteData = this.freqByteData;
    analyser.getByteFrequencyData(freqByteData);  
    this.drawer.draw(freqByteData);
    return freqByteData;
}
