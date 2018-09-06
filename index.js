import React from "react";
import { render } from "react-dom";
import Main from "./js";
import "./scss";
import Tone, { Transport } from 'tone';

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
