import React from "react";
import { render } from "react-dom";
import Main from "./js";
import "./scss";
import { get } from 'music-scale';

const scale = get('e4 major pentatonic').reverse();

// const score = Array(8).fill(0).map((note, i) => Array(5).fill(0).map((n, f) => f === i ? 1 : 0));
const score = [[0,0,0,0,1],[0,1,0,0,0],[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0],[0,1,0,0,0]];

render(<Main {...{scale, score}} />, document.getElementById("app"));
