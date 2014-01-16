LoudnessDetector = function(canvasElementID) {
    this.prevFreqData = 0;
    this.canvasElementID = canvasElementID;
    this.canvas = document.getElementById(this.canvasElementID);
    this.drawer = new FreqDrawer(this.canvas);
	
	this.peaks = [];
	this.ignoreProcess = false;
	this.lastAlert = 0;
	window.catsKilled = 0;
	
	var self = this;
	var t = setInterval(function() {
		//console.log('Determine peaks');
		var peaks = self.peaks;
		if (peaks.length == 0)
			return;

		self.ignoreProcess = true;
		
		var sumLow = 0;
		var sumMed = 0;
		var sumHigh = 0;
		var sumUltra = 0;
		
		while (peaks.length > 0) {
			var peak = peaks.pop();
			sumLow += Number(peak['low']);
			sumMed += Number(peak['med']);
			sumHigh += Number(peak['high']);
			sumUltra += Number(peak['ultra']);
		}
		sumLow = sumLow.toFixed(2);
		sumMed = sumMed.toFixed(2);
		sumHigh = sumHigh.toFixed(2);
		sumUltra = sumUltra.toFixed(2);
		document.getElementById('peaks').innerHTML = "<font color='red'>"+window.catsKilled + ' cats died</font>' + "<br/><font size='2px'>Low: " + zeroPad(sumLow,6) + "<br/>Med: " + zeroPad(sumMed,6) + "<br/>Hig: " + zeroPad(sumHigh,6) + "<br/>Ult: " + zeroPad(sumUltra,6)+'</font>';
		
		if (isAlertFromLow(sumLow) ||
			isAlertFromLowMed(sumMed, sumLow) ||
			isAlertFromMed(sumMed) ||
			isAlertFromLowMedHigh(sumLow, sumMed, sumHigh)) {

			var p = "";
			if (isAlertFromLow(sumLow))
				p = "sumLow: " + zeroPad(sumLow,6);
			if (isAlertFromLowMed(sumMed, sumLow))
				p += "<br/>sumLow+sumMed: " + zeroPad( (sumMed + sumLow),6);
			if (isAlertFromMed(sumMed)) 
				p += "<br/>sumMed: " + zeroPad( (sumMed),6);
			if (isAlertFromLowMedHigh(sumMed)) 
				p += "<br/>sumLow+sumMed+sumHigh: " + zeroPad( (sumLow+ sumMed+ sumHigh),6);
			document.getElementById('alert').innerHTML = p;

			// do not let it pop again
			if (document.getElementById('kitty').style.display !== 'block')
			{
				window.catsKilled = window.catsKilled + 1;
				console.log('killed: ' + window.catsKilled);
				//document.getElementById('peaks').style.display = 'none';
				document.getElementById('kitty').style.display = 'block';
				setTimeout(function() {
					//document.getElementById('peaks').style.display = 'block';
					document.getElementById('kitty').style.display = 'none';
					document.getElementById('alert').innerHTML = '';
				}, 5000);
			}
		}
		
		self.ignoreProcess = false;
	}, 500);
}

function isAlertFromLow(sumLow) {
	return sumLow > 100;
}
function isAlertFromLowMed(sumMed, sumLow) {
	return sumMed + sumLow > 180;
}
function isAlertFromMed(sumMed) {
	return sumMed > 120;
}
function isAlertFromLowMedHigh(sumLow, sumMed, sumHigh) {
	return sumLow + sumMed + sumHigh > 120;
}

LoudnessDetector.prototype.analyse = function(freqData) {
	if (this.ignoreProcess === true)
		return;

    var prevFreqData = this.prevFreqData;
    
    if (prevFreqData === 0) {
        this.prevFreqData = cloneArray(freqData);
        return;
    }
    var diffData = calculateDerivedFreqData(new Uint8Array(freqData.length));

    this.drawer.draw(diffData);
	
    this.prevFreqData = cloneArray(freqData);
	
	var peaks = this.peaks;
	peaks.push(calculatePeaks(this.canvas));

    function calculateDerivedFreqData(diffData) {
        for(var i = 0; i < freqData.length; ++i) {
            var c = freqData[i] - prevFreqData[i];
            if (c < 0)
                c = 0;
            diffData[i] = c;
        }
        return diffData;
    }
	
	function calculatePeaks(canvas) {
		// to-from * scale [scale=128]
		var rangedPeaks = {
			"low":  formatStrength( sumInInterval(diffData, 0, 50) / 6400),
			"med": formatStrength(sumInInterval(diffData, 51, 85) / 4352),
			"high": formatStrength(sumInInterval(diffData, 86, 120) / 4352),
			"ultra": formatStrength(sumInInterval(diffData, 121, 250) / 16512)
		};
		return rangedPeaks;
	}	
}

function formatStrength(value) {
	return (value * 100).toFixed(2);
}

function sumInInterval(array, from, to) {
    var sum = 0;
    for(var i = from; i <= to; ++i) {
        sum += array[i];
    }
	return sum;
}

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function cloneArray(input) {
    var output = new Uint8Array(input.length);
    for(var i = 0; i < output.length; ++i)
        output[i] = input[i];
    return output;
}