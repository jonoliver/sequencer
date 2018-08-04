import React, { Component } from "react";
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

const { Provider, Consumer } = React.createContext();

const Cell = ({ active, x, y }) =>
  <Consumer>
    { ({ toggle }) =>
      <div 
        onClick={() => toggle(x, y)}
        onMouseEnter={() => toggle(x, y, true)}
        className={`cell ${active ? 'active' : ''}`}
      />
    }
  </Consumer>

const Column = ({ cells, activeColumn, y }) =>
  <div className={`column ${activeColumn === y ? 'active' : ''}`}>
    {
      cells.map((active, x) => <Cell key={x} {...{active, x, y}} />)
    }
  </div>

const Grid = ({ columns, activeColumn }) => 
  <div className="grid">
    {
      columns.map((cells, y) => <Column key={y} {...{cells, activeColumn, y}} />)
    }  
  </div>

const Slider = ({ name, min, max, updateSetting, multiplier }) =>
  <label htmlFor={name} className="slider">
    <input type="range" min={min} max={max} name={name}
      onChange={ (e) => updateSetting(name, e.target.value * multiplier) } />
    {name}
  </label>

// const env = {"attack":0.005,"decay":0.13,"sustain":0.15,"hold":0.12,"release":1.5000000000000002};
const env = {"attack":0.005,"decay":0.11,"sustain":0.06,"hold":0.08,"release":1.3800000000000003};

const getScale = (scaleName, key) => 
  Scale(scaleName, `${key}4`)
    .concat(Scale(scaleName, `${key}5`))
    .concat([`${key}6`]).reverse();    


class App extends Component {
  constructor(props){
    super(props);
    const scaleName = 'minor pentatonic';
    const key = 'E';
    const scale = getScale(scaleName, key);
  this.state = {
      score: props.score,
      dragging: false,
      activeBeat: 0,
      key,
      scaleName,
      scale,
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
    setInterval(this.tick, 250);
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
      return score;  
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

  updateScale(scaleName, key){
    const scale = getScale(scaleName, key);
    this.setState({ scale })
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
    } = this.state;

    return (
      <Provider value={{ toggle }}>
        <div className="container" {...{ 
          onMouseDown,
          onMouseUp,
        }}>
          <Grid {...{ columns, activeColumn }} />
          <select defaultValue={key} onChange={(e) => this.updateScale(scaleName, e.target.value)}>
            { keys.map(key => 
              <option key={key} value={key}>{key}</option>
            )}
          </select>
          <select defaultValue={scaleName} onChange={(e) => this.updateScale(e.target.value, key)}>
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
