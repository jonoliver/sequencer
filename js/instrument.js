import Wad from 'web-audio-daw';

export const play = (notes, settings) => {
  const wads = notes.map(note =>
    new Wad({ ...settings, pitch: note })
  );

  const instrument = new Wad.Poly();
  wads.forEach(wad => instrument.add(wad));
  instrument.play();
};