import React, { Component } from "react";
import Scale, { get, names } from 'music-scale';
import { cloneDeep } from 'lodash';
import { Provider } from './context';
import { Grid, Slider, Select } from './controls';
import { play } from "./instrument";
import * as Adapters from './adapters';
import { Transport } from 'tone';
import patterns from './patterns.json';
import synths from './synths.json';

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
// const env = {"attack":0.005,"decay":0.11,"sustain":0.06,"hold":0.08,"release":1.3800000000000003};

const defaultFilter = {
  type: 'lowpass', // What type of filter is applied.
  frequency: 400,       // The frequency, in hertz, to which the filter is applied.
  q: 10,         // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
  // env       : {          // Filter envelope.
  //     frequency : 880, // If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
  //     attack    : 0.5  // Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency
  // }
};


const getScale = (scaleName, key, base) =>
  Scale(scaleName, `${key}${base}`)
    .concat(Scale(scaleName, `${key}${base + 1}`))
    .concat([`${key}${base + 2}`]).reverse();


class App extends Component {
  constructor(props) {
    super(props);
    const scaleName = 'minor pentatonic';
    const key = 'E';
    const base = 4;
    const scale = getScale(scaleName, key, base);

    const controls = {
      attack: 1,
      sustain: 21,
      decay: 13,
      release: 60,
      hold: 1,
    };

    const env = {
      attack: Adapters.attack(controls.attack),
      sustain: Adapters.sustain(controls.sustain),
      decay: Adapters.decay(controls.decay),
      release: Adapters.release(controls.release),
      hold: Adapters.hold(controls.hold),
    }

    this.state = {
      score: props.score,
      dragging: false,
      activeBeat: 0,
      key,
      scaleName,
      scale,
      base,
      controls,
      settings: {
        source: 'sine', // sine, square, triangle, sawtooth
        volume: 0.25,
        env,
      },
      patterns,
      synths,
    }
    this.tick = this.tick.bind(this);
    this.toggle = this.toggle.bind(this);
    this.updateSetting = this.updateSetting.bind(this);
    this.updateScale = this.updateScale.bind(this);
    this.updateSource = this.updateSource.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.updateFilterType = this.updateFilterType.bind(this);
    this.updateQ = this.updateQ.bind(this);
    this.updateBPM = this.updateBPM.bind(this);
    this.savePattern = this.savePattern.bind(this);
    this.saveSynth = this.saveSynth.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentWillMount() {
    // setInterval(this.tick, 125);

    Transport.scheduleRepeat(this.tick, '16n');
    Transport.start()
  }

  tick() {
    this.setState(({ activeBeat, score, scale }) => {
      const newBeat = activeBeat < score.length - 1 ? activeBeat + 1 : 0;
      const notes = scale.filter((x, i) => score[newBeat][i]);
      play(notes, this.state.settings);

      return {
        activeBeat: newBeat,
      }
    });
  }

  updateBPM(value) {
    Transport.pause();
    Transport.bpm.value = value;
    Transport.start();
  }

  toggle(x, y, checkDrag) {
    this.setState(({ dragging, score }) => {
      if (checkDrag && !dragging) return;
      score[y][x] = +!(score[y][x]);
      return { score };
    });
  }

  updateSetting(setting, value) {
    const { settings, controls } = this.state;
    controls[setting] = value;
    settings.env[setting] = Adapters[setting](value);
    this.setState({ settings });
  };

  updateSource({ value }) {
    const { settings } = this.state;
    settings.source = value;
    this.setState({ settings });
  };

  updateScale(scaleName, key, base) {
    const scale = getScale(scaleName, key, base);
    this.setState({ scaleName, key, base, scale })
  }

  updateFilter(value) {
    const { settings } = this.state;
    if (!settings.filter) return;
    settings.filter.frequency = value;
    this.setState({ settings });
  }

  updateFilterType({ value }) {
    const { settings } = this.state;
    if (value) {
      if (settings.filter) {
        settings.filter.type = value;
      }
      else {
        settings.filter = { ...defaultFilter, type: value }
      }
    } else {
      settings.filter = null
    }
    this.setState({ settings });
  }

  updateQ(value) {
    const { settings } = this.state;
    if (!settings.filter) return;
    settings.filter.q = value;
    this.setState({ settings });
  }

  savePattern() {
    this.setState(({ patterns, score }) => {
      return {
        patterns: [...patterns, cloneDeep(score)],
      }
    });
  }

  saveSynth() {
    this.setState(({
      synths,
      controls,
      settings,
      key,
      scaleName,
      scale,
      base,
    }) => {
      return {
        synths: [...synths, {
          controls: cloneDeep(controls),
          settings: cloneDeep(settings),
          scale: cloneDeep(scale),
          key,
          scaleName,
          base,
        }],
      }
    });
  }

  setPattern(index) {
    this.setState(({ patterns }) => ({
      score: cloneDeep(patterns[index]),
    }));
  }

  setSynth(index) {
    console.log(this.state.synths[index]);

    this.setState(({ synths }) => ({
      ...cloneDeep(synths[index])
    }));
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
      controls,
    } = this.state;

    const {
      attack,
      sustain,
      decay,
      release,
      hold,
    } = controls;

    const scaleOptions = scaleNames.map(scale => ({ value: scale, label: scale }));

    return (
      <Provider value={{ toggle }}>
        <div className="container" {...{
          onMouseDown,
          onMouseUp,
        }}>
          <Grid {...{ columns, activeColumn }} />
          <div>
            <h3 className="control-heading">BPM</h3>
            <label htmlFor="bpm" className="slider">
              <input type="range" min={40} max={240} name="bpm" defaultValue="120"
                className="bpm range-slider__range"
                onChange={(e) => this.updateBPM(parseInt(e.target.value))} />
            </label>
            <div className="controls">
              <section>
                <h3 className="control-heading">Wave Shape</h3>
                <Select
                  className="select"
                  classNamePrefix="select"
                  value={{ label: this.state.settings.source, value: this.state.settings.source }}
                  options={[
                    { label: 'sine', value: 'sine' },
                    { label: 'triangle', value: 'triangle' },
                    { label: 'square', value: 'square' },
                    { label: 'sawtooth', value: 'sawtooth' },
                  ]}
                  onChange={this.updateSource}
                />
                <h3 className="control-heading">Scale</h3>
                <Select
                  className="select small root"
                  classNamePrefix="select"
                  value={{ value: key, label: key }}
                  options={keys.map(key => ({ label: key, value: key }))}
                  onChange={({ value }) => this.updateScale(scaleName, value, base)}
                />
                <Select
                  className="select small"
                  classNamePrefix="select"
                  value={{ value: base, label: base }}
                  options={Array(5).fill(0).map((_, i) => ({ label: i + 1, value: i + 1 }))}
                  onChange={({ value }) => this.updateScale(scaleName, key, parseInt(value))}
                />
                <Select
                  isSearchable
                  className="select"
                  classNamePrefix="select"
                  value={{ label: scaleName, value: scaleName }}
                  options={scaleOptions}
                  onChange={({ value }) => this.updateScale(value, key, base)}
                />
              </section>

              <section>
                <h3 className="control-heading">Envelope</h3>
                <Slider name="attack" value={attack} min="1" max="100" {...{ updateSetting }} />
                <Slider name="sustain" value={sustain} min="1" max="100" {...{ updateSetting }} />
                <Slider name="decay" value={decay} min="1" max="100" {...{ updateSetting }} />
                <Slider name="release" value={release} min="1" max="100" {...{ updateSetting }} />
                <Slider name="hold" value={hold} min="0" max="100" {...{ updateSetting }} />

              </section>
              <section>
                <h3 className="control-heading">Filter</h3>
                <Select
                  className="select"
                  classNamePrefix="select"
                  defaultValue={{ value: '', label: 'none' }}
                  options={[
                    { value: '', label: 'none' },
                    { value: 'highpass', label: 'highpass' },
                    { value: 'lowpass', label: 'lowpass' },
                  ]}
                  onChange={this.updateFilterType}
                />
                <label htmlFor="cutoff" className="slider">
                  <input type="range" min={1} max={5000} name="cutoff"
                    className="range-slider__range"
                    onChange={(e) => this.updateFilter(parseInt(e.target.value))} />
                  cutoff
                 </label>
                <label htmlFor="q" className="slider">
                  <input type="range" min={1} max={50} name="q"
                    className="range-slider__range"
                    onChange={(e) => this.updateQ(parseInt(e.target.value))} />
                  q
                </label>
              </section>
            </div>
            <button
              onClick={this.savePattern}
            >Save Pattern</button>
            {
              this.state.patterns.map((pattern, i) =>
                <div key={i}>
                  <a
                    onClick={() => this.setPattern(i)}
                  >Pattern {i + 1}</a>
                </div>
              )
            }
            <button
              onClick={this.saveSynth}
            >Save Synth</button>
          </div>
          {
              this.state.synths.map((synth, i) =>
                <div key={i}>
                  <a
                    onClick={() => this.setSynth(i)}
                  >Synth {i + 1}</a>
                </div>
              )
            }
        </div>
      </Provider>
    );
  }
}

export default App;