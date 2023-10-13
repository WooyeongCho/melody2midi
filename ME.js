const { Essentia, EssentiaWASM } = require("essentia.js");
const MidiWriter = require('midi-writer-js');
const fs = require("fs");
const { log } = require("console");

const extract = async (selectedFile, outputFileName) => {
  console.log(`Analysis Started...\nSelected File: ${selectedFile}\nOutput File Name: ${outputFileName}`);
  
  const decodeModule = await import("audio-decode");
  const decode = decodeModule.default;
  const essentia = new Essentia(EssentiaWASM);
  const hopSize = 256;
  const track = new MidiWriter.Track();

  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
  

  // 오디오 디코드
  const decodeAudio = async (filepath) => {
    const buffer = fs.readFileSync(filepath);
    const audio = await decode(buffer);
    return { audioData: essentia.arrayToVector(audio._channelData[0]), sampleRate: audio.sampleRate };
  };

  // 주요 멜로디 추출
  const extractPredominantMelody = (audioData, sampleRate) => {
    return essentia.PredominantPitchMelodia(audioData, 10, 3, 2048, false, 0.8, hopSize, 1, 40, 20000, 100, 80, 20, 0.9, 0.9, 27.5625, 55, sampleRate)
  };

  // bpm 추출
  const extractBPM = (audioData) => {
    return essentia.RhythmExtractor2013(audioData);
  };

  // 약간의 오차값이 존재하는 주파수를 정수화된 미디 노트 번호로 변환
  const pitchToMidi = (pitch) => {
    if (pitch <= 0) return 0; // 음원 파일에서 인식되지 않거나 비어있는 부분이 나올 경우 0을 출력하고, 그때 null을 반환
    const midiNumber = 12 * (Math.log(pitch / 440) / Math.log(2)) + 69;
    return Math.round(midiNumber);
  };

  const audioObj = (await decodeAudio(selectedFile)) // 디코딩된 오디오
  const melodia = extractPredominantMelody(audioObj.audioData, audioObj.sampleRate); // 주요 멜로디 추출
  const pitchFrames = essentia.vectorToArray(melodia.pitch); // 벡터 타입을 배열로 변환
  let bpm = Math.round(extractBPM(audioObj.audioData).bpm); // bpm 추출
  track.setTempo(bpm, 0);
  let midiPitchFrames = [];

  let currentDetectedNote = -1;
  for(let i = 0; i < pitchFrames.length; i++) {
    if(pitchToMidi(pitchFrames[i]) != currentDetectedNote) {
      midiPitchFrames.push({note: pitchToMidi(pitchFrames[i]), startAt: i, endAt: i});   
    } else {
      midiPitchFrames[midiPitchFrames.length - 1].endAt = i;
    }
    currentDetectedNote = pitchToMidi(pitchFrames[i]);
  }

  const sampleToTick = (sample) => {return 128 * bpm / 60 * sample / audioObj.sampleRate};

  for(let i = 0; i < midiPitchFrames.length; i++) {
    if(midiPitchFrames[i].note != 0 && sampleToTick((midiPitchFrames[i].endAt - midiPitchFrames[i].startAt) * hopSize) > 10) {
      //console.log('pitch: ' + midiPitchFrames[i].note + ' startTick: ' + Math.round(sampleToTick(midiPitchFrames[i].startAt * hopSize)) + ' duration: ' + Math.round(sampleToTick(midiPitchFrames[i].endAt - midiPitchFrames[i].startAt) * hopSize))
      try {
        track.addEvent(new MidiWriter.NoteEvent({pitch: midiPitchFrames[i].note, tick: 'T' + Math.round(sampleToTick(midiPitchFrames[i].startAt * hopSize)), duration: 'T' + Math.round(sampleToTick((midiPitchFrames[i].endAt - midiPitchFrames[i].startAt) * hopSize))}))
      } catch (e) {
        console.log(e); 
      }
    } else {//console.log(sampleToTick(midiPitchFrames[i].endAt - midiPitchFrames[i].startAt));
    }
  }
  
  const write = new MidiWriter.Writer(track);
  //console.log(write.dataUri());

  fs.writeFileSync(outputFileName, write.buildFile(), 'binary');
  console.log('Analysis Completed, file created.');
  
  //console.log(midiPitchFrames);
  
  //console.log("위는 분석된 멜로디입니다.");

  //console.log("음원 파일의 샘플레이트: " + audioObj.sampleRate);
  //console.log("분석에 사용된 총 프레임 개수: " + pitchFrames.length);

  
  //console.log("음원 파일의 bpm: " + bpm);
};

module.exports = { extract };