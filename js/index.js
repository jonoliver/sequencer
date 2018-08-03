import React, { Component } from "react";
import { play } from "./instrument";

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

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      score: props.score,
      scale: props.scale,
      dragging: false,
      activeBeat: 0,
      settings: {
        source: 'sine', // sine, square, triangle, sawtooth
        volume: 0.5,
        env: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.8,
          hold: 0,
          release: 0.8,
        }
      }
    }
    this.tick = this.tick.bind(this);
    this.toggle = this.toggle.bind(this);
    this.updateSetting = this.updateSetting.bind(this);
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
    } = this.state;

    return (
      <Provider value={{ toggle }}>
        <div className="container" {...{ 
          onMouseDown,
          onMouseUp,
        }}>
          <Grid {...{ columns, activeColumn }} />
          <select onChange={(e) => this.updateSource(e.target.value)}>
            <option value="sine">sine</option>
            <option value="square">square</option>
            <option value="triangle">triangle</option>
            <option value="sawtooth">sawtooth</option>
          </select>
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
