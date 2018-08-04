import React, { Component } from "react";
import { Provider } from './context';
import { Grid, Slider } from './controls';
import { play } from "./instrument";
import Scale, { get, names } from 'music-scale';

const scaleNames = names().sort();

const keys = [
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
]

// const env = {"attack":0.005,"decay":0.13,"sustain":0.15,"hold":0.12,"release":1.5000000000000002};
const env = {"attack":0.005,"decay":0.11,"sustain":0.06,"hold":0.08,"release":1.3800000000000003};

const getScale = (scaleName, key, base) =>
  Scale(scaleName, `${key}${base}`)
    .concat(Scale(scaleName, `${key}${base + 1}`))
    .concat([`${key}${base + 2}`]).reverse();


class App extends Component {
  constructor(props){
    super(props);
    const scaleName = 'minor pentatonic';
    const key = 'E';
    const base = 4;
    const scale = getScale(scaleName, key, base);
  this.state = {
      score: props.score,
      dragging: false,
      activeBeat: 0,
      key,
      scaleName,
      scale,
      base,
      settings: {
        source: 'sine', // sine, square, triangle, sawtooth
        volume: 0.25,
        env,
      },
    }
    this.tick = this.tick.bind(this);
    this.toggle = this.toggle.bind(this);
    this.updateSetting = this.updateSetting.bind(this);
    this.updateScale = this.updateScale.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentWillMount() {
    const { scale, score } = this.state;
    setInterval(this.tick, 125);
  }

  tick(){
    this.setState(({ activeBeat, score, scale }) => {
      const newBeat = activeBeat < score.length - 1 ? activeBeat + 1 : 0;
      const notes = scale.filter((x, i) => score[newBeat][i]);
      play(notes, this.state.settings);

      return { 
        activeBeat: newBeat,
      }
    });
  }

  toggle(x, y, checkDrag) {
    this.setState(({ dragging, score }) => {
      if (checkDrag && !dragging) return;
      score[y][x] = +!(score[y][x]);
      return { score };
    });
  }

  updateSetting(setting, value){
    const { settings } = this.state;
    settings.env[setting] = value;
    this.setState({ settings });
  };

  updateSource(value){
    const { settings } = this.state;
    settings.source = value;
    this.setState({ settings });
  };

  updateScale(scaleName, key, base){
    const scale = getScale(scaleName, key, base);
    this.setState({ scaleName, key, base, scale })
  }

  onMouseDown() {
    this.setState({ dragging: true });
  }

  onMouseUp() {
    this.setState({ dragging: false });
  }
  
  render() {
    const { 
      toggle, 
      onMouseDown, 
      onMouseUp,
      updateSetting,
    } = this;

    const {
      score: columns,
      activeBeat: activeColumn,
      scaleName,
      key,
      base,
    } = this.state;

    return (
      <Provider value={{ toggle }}>
        <div className="container" {...{ 
          onMouseDown,
          onMouseUp,
        }}>
          <Grid {...{ columns, activeColumn }} />
          <select defaultValue={key} onChange={(e) => this.updateScale(scaleName, e.target.value, base)}>
            { keys.map(key => 
              <option key={key} value={key}>{key}</option>
            )}
          </select>
          <select defaultValue={base} onChange={(e) => this.updateScale(scaleName, key, parseInt(e.target.value))}>
            { Array(5).fill(0).map((_, i) => 
              <option key={i+1} value={i+1}>{i+1}</option>
            )}
          </select>
          <select defaultValue={scaleName} onChange={(e) => this.updateScale(e.target.value, key, base)}>
            { scaleNames.map(scale => 
              <option key={scale} value={scale}>{scale}</option>
            )}
          </select>
          <div>
            <select onChange={(e) => this.updateSource(e.target.value)}>
              <option value="sine">sine</option>
              <option value="square">square</option>
              <option value="triangle">triangle</option>
              <option value="sawtooth">sawtooth</option>
            </select>
          </div>
          <Slider name="attack" min="1" max="100" multiplier={0.01 * 0.5} {...{ updateSetting } }/>
          <Slider name="sustain" min="1" max="100" multiplier={0.01} {...{ updateSetting } }/>
          <Slider name="decay" min="1" max="100" multiplier={0.01} {...{ updateSetting } }/>
          <Slider name="release" min="1" max="100" multiplier={0.1 * 0.2} {...{ updateSetting } }/>
          <Slider name="hold" min="0" max="100" multiplier={0.01} {...{ updateSetting } }/>
        </div>
      </Provider>
    );
  }
}

export default App;
