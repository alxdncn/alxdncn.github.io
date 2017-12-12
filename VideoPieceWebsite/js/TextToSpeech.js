var scope = this;
            
var queryTerm = 'Nature';
var getUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&indexpageids=&titles=' + queryTerm;
            
var msg;
var vol = 0.01;
var volIncrement = 0.005;

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
    
//    jsonText = "Hello";
    
    msg = new SpeechSynthesisUtterance(jsonText);
    //msg.pitch = 1.8; // 0 to 2
    msg.rate = 1.5; // 0.1 to 10
    msg.volume = vol;
    msg.onend = nextUtterance;
    
//    window.speechSynthesis.speak(msg);
};

function nextUtterance(event){
    console.log("Next utterance called");
    
    msg = new SpeechSynthesisUtterance(jsonText);
    if(vol < 1){
        vol += volIncrement;
    }
    msg.rate = 1.5;
    msg.volume = gameStateVar + 0.1;
    msg.onend = nextUtterance;
    window.speechSynthesis.speak(msg);
};

//var voices;
//
//window.speechSynthesis.onvoiceschanged = function() {
//    voices = window.speechSynthesis.getVoices();
//    for(var i = 0; i < voices.length; i++){
//        console.log(voices[i]);
//    }
//
//    msg.voice = voices[10];
//    msg.volume = 1;
//    window.speechSynthesis.speak(msg);
//};

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

