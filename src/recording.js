// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');
const credentials = require('./service_account_file.json');
// Import other required libraries
const fs = require('fs');
const util = require('util');
// Creates a client
const client = new textToSpeech.TextToSpeechClient({credentials});
const sample_path = '/tmp';
const path = require('path');
var crypto = require('crypto');

async function getRecording(text, options) {
  options = options || {};
  
  // The text to synthesize
  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: options.languageCode || 'en-US', ssmlGender: 'NEUTRAL'},
    // select the type of audio encoding
    audioConfig: {
        sampleRateHertz: 8000,
        speakingRate: 1.2,
        audioEncoding: 'LINEAR16'
    },
  };

  const requesthash = crypto.createHash('md5').update(JSON.stringify(request)).digest('hex');
  const filename = path.join(options.path || sample_path, `${requesthash}.wav`);
  const fileExists = util.promisify(fs.exists);

  if(await fileExists(filename)) {
      console.log('File already exists: ' + filename);
      return filename;
  }

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(filename, response.audioContent, 'binary');
  console.log(`Audio content written to file: ${filename}`);
  return filename;
}

module.exports = getRecording;
