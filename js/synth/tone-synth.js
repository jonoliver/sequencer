import { Synth, PolySynth, Filter, Master, Distortion } from 'tone';

const settingsAdapter = ({ env, source }) => {
  return {
    volume: -8,
    envelope: env,
    oscillator: {
      type: source,
    },
  }
};

export const play = (notes, settings) => {
  const synth = new PolySynth(notes.length, Synth);
  synth.set(settingsAdapter(settings));
  const { filter } = settings;
  if (filter) {
    filter.Q = filter.q;
    synth.chain((new Filter(filter)), Master);
  }
  else {
    synth.chain(Master);
  }
  synth.triggerAttackRelease(notes, "16n")
}