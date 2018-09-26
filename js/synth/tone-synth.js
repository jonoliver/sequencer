import Tone, { Synth, PolySynth, Filter, Master, Distortion } from 'tone';
window.Tone = Tone;

const settingsAdapter = ({ env, source }) => {
  return {
    volume: -8,
    envelope: env,
    oscillator: {
      type: source,
    },
  }
};

const limiter = new Tone.Limiter(-40);
const compressor = new Tone.Compressor(-60, 3);

export const play = (notes, settings) => {
  const synth = new PolySynth(notes.length, Synth);
  synth.set(settingsAdapter(settings));
  const { filter } = settings;
  // var dist = new Tone.Distortion(0.8);
  // var cheby = new Tone.Chebyshev(50);
  // var freeverb = new Tone.Freeverb()

  // phaser = new Tone.Phaser({
  //   "frequency" : 15,
  //   "octaves" : 5,
  //   "baseFrequency" : 1000
  // })
  // lfo = new Tone.LFO("4n", 400, 4000);
  // lfo.connect(phaser.frequency);
  // pingPong = new Tone.PingPongDelay("4n", 0.2);

  const filterNode = filter && new Filter({ ...filter, Q: filter.q });

  const { filters = [] } = window;
  const chain = [
    filterNode,
    ...filters,
    // compressor,
    Master,
  ].filter(fx => fx);

  synth.chain(...chain);

  synth.triggerAttackRelease(notes, `${settings.hold || '16'}n`);
}