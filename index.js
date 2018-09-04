import React from "react";
import { render } from "react-dom";
import Main from "./js";
import "./scss";
import Tone, { Transport } from 'tone';
import Wad from 'web-audio-daw';
window.Wad = Wad;
// import Recorder from './js/recorderjs/recorder';
// window.Recorder = Recorder;

// window.dest = Wad.audioContext.createMediaStreamDestination();
// const worker = new Worker('js/recorderjs/recorderWorker.js');

// window.recorder = new Recorder(dest, null, worker);

// recorder.exportWAV(blob => Recorder.forceDownload(blob));

document.addEventListener('keyup', ({ code }) => {
  if (code === 'Space') Transport.toggle();
});

window.Tone = Tone;
const patternLength = 16;
const scaleLength = 11;

const score = Array(patternLength).fill(0)
  .map((note, i) => Array(scaleLength).fill(0)
  .map((n, f) => f === i ? 1 : 0));

render(<Main {...{score}} />, document.getElementById("app"));
