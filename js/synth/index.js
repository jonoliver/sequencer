// import { play as playSynth } from './wad-synth';
import { play  as playSynth } from './tone-synth';

export const play = (notes, settings) => {
  try {
    playSynth(notes, settings);
  }
  catch (e) {
    console.error(e);
  }
}