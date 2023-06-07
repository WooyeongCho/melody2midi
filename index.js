const { Essentia, EssentiaWASM } = require("essentia.js");
const MidiWriter = require('midi-writer-js');
const fs = require("fs");
const { log } = require("console");

const main = async () => {
  const decodeModule = await import("audio-decode");
  const decode = decodeModule.default;
  const essentia = new Essentia(EssentiaWASM);

  const decodeAudio = async (filepath) => {
    const buffer = fs.readFileSync(filepath);
    const audio = await decode(buffer);
    return { audioData: essentia.arrayToVector(audio._channelData[0]), sampleRate: audio.sampleRate };
  };

  // let vectorData = await decodeAudio('audio.mp3'); // await 추가
  // const computed = essentia.PredominantPitchMelodia(vectorData, ,)
  // // { danceability: N }
  
  // console.log(computed.pitch);

  const extractPredominantMelody = (audioData, sampleRate) => {
    // return essentia.PredominantPitchMelodia({
    //   sampleRate: sampleRate,
    //   hopSize: 128,
    //   frameSize: 2048
    // })(audioData);

    return essentia.PredominantPitchMelodia(audioData,10,3,2048,false,0.8,128,1,40,20000,100,80,20,0.9,0.9,27.5625,55,sampleRate)
  };

  const audioObj = (await decodeAudio('audio.mp3'))
  //const audioData = decodedAudio.audioData;
  const melodia = extractPredominantMelody(audioObj.audioData, audioObj.sampleRate);

  const pitchFrames = essentia.vectorToArray(melodia.pitch);
  //const confidenceFrames = essentia.vectorToArray(melodia.pitchConfidece);
  console.log(pitchFrames);

  const polishedFrames = essentia.PitchContourSegmentation(melodia.pitch, audioObj.audioData);
  console.log(polishedFrames);

  const segments = {
    onset: essentia.vectorToArray(polishedFrames.onset),
    duration: essentia.vectorToArray(polishedFrames.duration),
    MIDIpitch: essentia.vectorToArray(polishedFrames.MIDIpitch)
  } // 기존 벡터 리스트에서 일반 리스트로 변환
  
  
  const PPQ = 96; // Pulses per quarter note.
  const BPM = 120; // Assuming a default tempo in Ableton to build a MIDI clip.
  const microsecondsPerBeat = (60 * 1000000) / BPM;

  function secondsToTicks(seconds, ppq = PPQ, tempoMicroseconds = microsecondsPerBeat) {
    const microseconds = seconds * 1000000;
    const beats = (microseconds / tempoMicroseconds);
    return Math.round(beats * ppq);
  }
  
  const track = new MidiWriter.Track();
  //track.addEvent(new MidiWriter.SetTempoEvent({ microsecondsPerBeat }));
  
  const onsets = segments.onset;
  const durations = segments.duration;
  const offsets = onsets.map((onset, index) => onset + durations[index]);
  const silenceDurations = onsets.slice(1).map((onset, index) => onset - offsets[index]).concat([0]);
  const MIDIpitches = segments.MIDIpitch;
  console.log(MIDIpitches)
  // for (let i = 0; i < onsets.length; i++) {
  //   track.addEvent(new MidiWriter.NoteEvent({
  //     pitch: MIDIpitches[i]
  //   }))
  // }

  // for (let index = 0; index < onsets.length; index++) {
  //   try {
  //     const onset = onsets[index];
  //     const duration = durations[index];
  //     const MIDIpitch = MIDIpitches[index];
    
  //     const onsetTicks = secondsToTicks(onset);
  //     const durationTicks = secondsToTicks(duration);

  //     const silenceDurationTicks = (index < onsets.length - 1) ? Math.max(secondsToTicks(onsets[index + 1] - (onset + duration)), 0) : 0;
      
  //     track.addEvent(new MidiWriter.NoteEvent({
  //       pitch: [MIDIpitch],
  //       durationTicks: durationTicks,
  //       velocity: 64, // A fixed velocity of 64 as in the provided Python code
  //       wait: onsetTicks
  //     }));
      
  //     if (silenceDurationTicks > 0) {
  //       track.addEvent(new MidiWriter.NoteEvent({
  //         pitch: [MIDIpitch],
  //         durationTicks: silenceDurationTicks,
  //         velocity: 0,
  //         waiter: durationTicks - silenceDurationTicks
  //       }));
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
    
  // }
  //HERE
  // const writer = new MidiWriter.Writer([track]);
  // fs.writeFileSync('output_segments.mid', new Buffer(writer.buildFile()));
};

main();
