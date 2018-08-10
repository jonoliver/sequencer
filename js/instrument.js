import Wad from 'web-audio-daw';

const playNote = (notes, settings) => {
  const wads = notes.map(note =>
    new Wad({ ...settings, pitch: note })
  );
  const instrument = new Wad.Poly();
  wads.forEach(wad => instrument.add(wad));
  instrument.play();
}

export const play = (notes, settings) => {
  try {
    playNote(notes, settings);
  }
  catch (e) {
    console.error(e);
  }
};

export const build = () => {}
export const update = () => {}
export const updateFilter = () => {}
