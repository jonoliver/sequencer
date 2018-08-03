import Wad from 'web-audio-daw';

export const play = (notes) => {
  const wads = notes.map(note =>
    new Wad({
      source: 'sine', // sine, square, triangle, sawtooth
      volume: 0.5,
      pitch: note,
      env: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        hold: 0,
        release: 0.8,
      }
    })
  );

  const instrument = new Wad.Poly();
  wads.forEach(wad => instrument.add(wad));
  instrument.play();
};