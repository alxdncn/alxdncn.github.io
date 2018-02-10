var scope = this;
            
var queryTerm = 'Nature';
var getUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&indexpageids=&titles=' + queryTerm;
            
var msg;
var baseVar = 0.0075;

var jsonText;
$.ajax({
    url: getUrl,

    // The name of the callback parameter, as specified by the YQL service
    jsonp: "callback",

    // Tell jQuery we're expecting JSONP
    dataType: "jsonp",

    // Tell YQL what we want and that we want JSON
    data: {
        q: "select title,abstract,url from search.news where query=\"cat\"",
        format: "json"
    },

    // Work with the response
    success: function( response ) {
        onAjaxComplete(response);
    }
});

var onAjaxComplete = function(response){
    var jsonArray = $.map(response, function(el) { return el });
    
    var jsonParsed = jsonArray[2].pageids[0];
    
    jsonText = jsonArray[2].pages[jsonParsed].extract;
        
    msg = new SpeechSynthesisUtterance(jsonText);
//    msg.pitch = 1.8; // 0 to 2
    msg.rate = 1.2; // 0.1 to 10
    msg.volume = baseVar;
    msg.onend = nextUtterance;    
};

function startMessageLoop(){
    window.speechSynthesis.speak(msg);
};

function nextUtterance(event){    
    msg = new SpeechSynthesisUtterance(jsonText);
    msg.rate = 1.2;
    msg.volume = gameStateVar + baseVar;
    msg.onend = nextUtterance;
    window.speechSynthesis.speak(msg);
};

var openWindows = [];
var launchWindows = false;
var windowIndex = 0;
var launchedWindows = false;

function launchImageWindow(imageURL){    
    var width = 500 + Math.floor(Math.random() * 600);
    var height = 300 + Math.floor(Math.random() * 600);

    var posX = -window.innerWidth/4 + Math.random() * (window.innerWidth);
    var posY = Math.random() * (window.innerHeight - height/2);

    var newWin = window.open(imageURL,'windowName' + openWindows.length,'resizable=1,scrollbars=1,fullscreen=100,height=' + height.toString() + ',width=' + width.toString() + ',left=' + posX.toString() + ',top=' + posY.toString(), 'toolbar=0, menubar=0,status=1');

    openWindows.push(newWin);
}

function closeWindow(){    
    var oldWindow = openWindows.pop();
    oldWindow.close();

    return openWindows.length;
}

function closeAllWindows(){ 
    for(let i = openWindows.length - 1; i >= 0; i--){
        var oldWindow = openWindows.pop();
        oldWindow.close();
    }    
}

//var voices = window.speechSynthesis.getVoices();
//msg.voice = voices[10]; // Note: some voices don't support altering params
////            msg.voiceURI = 'native';
//msg.volume = 1; // 0 to 1
//msg.rate = 1; // 0.1 to 10
//msg.pitch = 1; //0 to 2
////            msg.text = 'Hello World';
//msg.lang = 'en-US';
//
//msg.onend = function(e) {
//  console.log('Finished in ' + event.elapsedTime + ' seconds.');
//};
//
// msg.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Whisper'; })[0];
//

