const a = require('./index.js');
const fs = require('fs')

a.extractMIDI('trafficlight.mp3')
  .then((midiBinaryData) => {
    console.log('1midi binary data:', midiBinaryData);
    fs.writeFileSync('1.mid', midiBinaryData, 'binary');
  })
  .catch((error) => {
    console.error("error: ", error);
  })

a.extractKey('trafficlight.mp3')
  .then((dd) => {
    console.log('1 midi key:', dd);
  })
  .catch((error) => {
    console.error("error: ", error);
  })

  a.extractMIDI('dragonnight.mp3')
  .then((midiBinaryData) => {
    console.log('2midi binary data:', midiBinaryData);
    fs.writeFileSync('2.mid', midiBinaryData, 'binary');
  })
  .catch((error) => {
    console.error("error: ", error);
  })

a.extractKey('dragonnight.mp3')
  .then((dd) => {
    console.log('2 midi key:', dd);
  })
  .catch((error) => {
    console.error("error: ", error);
  })