import { Synth, PolySynth, Filter, Master, Distortion, Transport } from 'tone';

let synth;

const settingsAdapter = ({ env, source }) => {
  return {
    volume: -8,
    envelope: env,
    oscillator: {
      type: source,
    },
  }
};

let filter;
// let filter = new Filter({
//   type  : 'lowpass' ,
//   frequency  : 150 ,
//   rolloff  : -12 ,
//   Q  : 1,
//   gain  : 0
//   });

export const build = (numVoices, settings) => {
  synth = new PolySynth(numVoices, Synth);
  window.synth = synth;
  synth.set(settingsAdapter(settings)).chain(Master);
  // synth.volume.value = -10;
}

export const update = (settings) => {
  synth.set(settingsAdapter(settings));
}

export const play = (notes) => {
  synth.triggerAttackRelease(notes, "16n")
}

export const updateFilter = (newFilter) => {
  if (filter) synth.disconnect(filter);
  if (!newFilter && filter) {
    synth.chain(Master);
    return;
  }
  filter = new Filter(newFilter);
  synth.chain(filter, Master);
}

export const updateCutoff = (value) => {
  filter.frequency.value = value;
}

// export const update = (key, newSetting) => {
//   settings[key] = { ...settings[key], newSetting };
// }

// const oscillator = {
//   type  : "sine"
// };

// const envelope = {
//   attack: 0.005,
//   decay: 0.11,
//   sustain: 0.06,
//   hold: 0.08,
//   release: 1.3800000000000003
// };

// let settings = { oscillator, envelope };

// Transport.bpm.value = 60;

// Transport.scheduleRepeat(() => 
//   synth.triggerAttackRelease(["C5"], "16n")
// , '4n');

// Transport.start()
