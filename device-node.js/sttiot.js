var watson = require('watson-developer-cloud');
var fs = require('fs');
var cp = require('child_process');
var Sound = require('node-aplay');
var mqtt = require('mqtt');
var Say = require('./lib/say');

var clientId = ['d', "org id", "device type", "device id"].join(':');
    
    
    iot_client = mqtt.connect("mqtt://org id.messaging.internetofthings.ibmcloud.com:1883",
                          {
                              "clientId" : clientId,
                              "keepalive" : 30,
                              "username" : "use-token-auth",
                              "password" : "your token"
                          });						  
	 
   iot_client.on('connect', function() {
        
      console.log('STT client connected to IBM IoT Cloud.');      
      iot_client.publish('iot-2/evt/status/fmt/json', '{"d":{"status": "connected" }}'); //iot-2/evt/color/fmt/json
 
    }
    );	
	
	 iot_client.subscribe('iot-2/cmd/+/fmt/+', function(err, granted){
        console.log('subscribed command, granted: '+ JSON.stringify(granted));        
    });

	
	iot_client.on("message", function(topic,payload){
	console.log('received topic:'+topic+', payload:'+payload);
	new Say('').google(payload.toString());
	
	});

console.log('start tw watson regonition');
opencmd();

function opencmd() {
var speech_to_text = watson.speech_to_text({
  username: 'your-watson-stt-username',
  password: 'your-watson-stt-password', 
  version: 'v1'
});

var params = {
  content_type: 'audio/wav',
  model: 'zh-CN_BroadbandModel',
  continuous: true
};

// create the stream
var recognizeStream = speech_to_text.createRecognizeStream(params);

 // start the recording
    var mic = cp.spawn('arecord', ['--device=plughw:1,0', '--format=U8', '--rate=22000', '--channels=1']); //, '--duration=10'
    mic.stderr.pipe(process.stderr);
    mic.stdout.pipe(recognizeStream);
	
 // end the recording
    setTimeout(function() {
        mic.kill();
    }, 60* 5000);


// listen for 'data' events for just the final text
// listen for 'results' events to get the raw JSON with interim results, timings, etc.

recognizeStream.setEncoding('utf8'); // to get strings instead of Buffers from `data` events

// listen for 'data' events for just the final text
 recognizeStream.on('error',  function() {
     console.log.bind(console, 'error event: ');
     //var transcription = converter.toBuffer();
    // console.log(transcription);
 });

 recognizeStream.on('results',  function(data) {
     console.log('xxxxx'+data);
     console.log.bind(console, 'data event: ');
console.log('Results event data: '+data.results[0].alternatives[0].transcript);	
if(data.results[0] && data.results[0].final && data.results[0].alternatives){
	 iot_client.publish('iot-2/evt/voicecmd_ch/fmt/json', JSON.stringify(data, null, 2));
}
 });

// listen for 'data' events for just the final text
 recognizeStream.on('data',  function(data) {
	  console.log('xxxxx'+data);
     console.log.bind(console, 'data event: ');
 });
}
