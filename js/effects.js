var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    effectInput = null;

var rafID = null;
var analyser1;
var analyserView1;
var loudnessDetector;

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;

function updateAnalysers(time) {
    var freqData = analyserView1.doFrequencyAnalysis( analyser1 );
    loudnessDetector.analyse(freqData);
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function gotStream(stream) {
    var input = audioContext.createMediaStreamSource(stream);
    audioInput = convertToMono( input );

    // create mix gain nodes
    audioInput.connect(analyser1);
	outputMix = audioContext.createGain();
	outputMix.connect(analyser2);
    updateAnalysers();
}

function initAudio() {
    analyser1 = audioContext.createAnalyser();
    analyser1.fftSize = 1024;
    analyser2 = audioContext.createAnalyser();
    analyser2.fftSize = 1024;

    analyserView1 = new AnalyserView("view1");
    analyserView1.initByteBuffer( analyser1 );
    
    loudnessDetector = new LoudnessDetector("view2");

    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (!navigator.getUserMedia)
        return(alert("Error: getUserMedia not supported!"));

    navigator.getUserMedia({audio:true}, gotStream, function(e) {
        alert('Error getting audio');
        console.log(e);
    });
	
    // stats
	var stats = new Stats();
	stats.setMode(0);

	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild( stats.domElement );

	setInterval( function () {
		stats.begin();
		stats.end();
	}, 1000 / 60 );
}

window.addEventListener('load', initAudio );