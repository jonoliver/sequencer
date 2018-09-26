import React, { Component } from "react";
import Scale, { get, names } from 'music-scale';
import NumericInput from 'react-numeric-input';
import { cloneDeep } from 'lodash';
import { Provider } from './context';
import { Grid, Slider, Select, RecordButton, PlayButton, NumberInput } from './controls';
import * as Synth from "./synth";
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
  frequency: 250,       // The frequency, in hertz, to which the filter is applied.
  q: 10,         // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
  // env       : {          // Filter envelope.
  //     frequency : 880, // If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
  //     attack    : 0.5  // Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency
  // }
};


const convertSharpNote = note => {
  if (!note.includes('##')) return note;
  let index = keys.indexOf(note.slice(0,2)) + 1;
  if (index === keys.length) index = 0;
  return `${keys[index]}${note[note.length - 1]}`;
}

const getScale = ({ scaleName, key, base }) =>
  Scale(scaleName, `${key}${base}`)
    .concat(Scale(scaleName, `${key}${base + 1}`))
    .concat([`${key}${base + 2}`])
    .map(convertSharpNote)
    .reverse();


class App extends Component {
  constructor(props) {
    super(props);
    const scaleName = 'minor pentatonic';
    const key = 'E';
    const base = 4;
    const scale = getScale({ scaleName, key, base });

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

    const settings = {
      source: 'sine', // sine, square, triangle, sawtooth
      volume: 0.25,
      env,
      hold: '16n',
      // filter: defaultFilter,
      // filter  : {
      //   type      : 'lowpass', // What type of filter is applied.
      //   frequency : 400,       // The frequency, in hertz, to which the filter is applied.
      //   q         : 40,         // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
      //   // env       : {          // Filter envelope.
      //   //     frequency : 880, // If this is set, filter frequency will slide from filter.frequency to filter.env.frequency when a note is triggered.
      //   //     attack    : 0.5  // Time in seconds for the filter frequency to slide from filter.frequency to filter.env.frequency
      //   // }
      // },
      // delay: {
      //   delayTime: .25,  // Time in seconds between each delayed playback.
      //   wet: .5, // Relative volume change between the original sound and the first delayed playback.
      //   feedback: .25, // Relative volume change between each delayed playback and the next.
      // },
      // vibrato: { // A vibrating pitch effect.  Only works for oscillators.
      //   shape: 'sine', // shape of the lfo waveform. Possible values are 'sine', 'sawtooth', 'square', and 'triangle'.
      //   magnitude: 40,      // how much the pitch changes. Sensible values are from 1 to 10.
      //   speed: 4,      // How quickly the pitch changes, in cycles per second.  Sensible values are from 0.1 to 10.
      //   attack: 0       // Time in seconds for the vibrato effect to reach peak magnitude.
      // },
      // tremolo: { // A vibrating volume effect.
      //   shape: 'sine', // shape of the lfo waveform. Possible values are 'sine', 'sawtooth', 'square', and 'triangle'.
      //   magnitude: 0.5,      // how much the volume changes. Sensible values are from 1 to 10.
      //   speed: 4,      // How quickly the volume changes, in cycles per second.  Sensible values are from 0.1 to 10.
      //   attack: 0       // Time in seconds for the tremolo effect to reach peak magnitude.
      // },
    }

    this.state = {
      settings,
      score: props.score,
      dragging: false,
      activeBeat: 0,
      activePattern: 0,
      activeSynth: 0,
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
    this.updateKey = this.updateKey.bind(this);
    this.updateBase = this.updateBase.bind(this);
    this.updateScaleName = this.updateScaleName.bind(this);
    this.updateSource = this.updateSource.bind(this);
    this.updateFilterType = this.updateFilterType.bind(this);
    this.updateCutoff = this.updateCutoff.bind(this);
    this.updateQ = this.updateQ.bind(this);
    this.updateBPM = this.updateBPM.bind(this);
    this.updateNotelength = this.updateNotelength.bind(this);
    this.savePattern = this.savePattern.bind(this);
    this.saveSynth = this.saveSynth.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentDidMount() {
    // setInterval(this.tick, 125);

    Transport.scheduleRepeat(this.tick, '16n');
    Transport.start()
  }

  tick() {
    this.setState(({ activeBeat, score, scale }) => {
      const newBeat = activeBeat < score.length - 1 ? activeBeat + 1 : 0;
      const notes = scale.filter((x, i) => score[newBeat][i]);
      Synth.play(notes, this.state.settings);

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
      return { score, activePattern: null };
    });
  }

  updateSetting(setting, value) {
    const { settings, controls } = this.state;
    controls[setting] = value;
    settings.env[setting] = Adapters[setting](value);
    this.setState({ settings, activeSynth: null });
  };

  updateSource({ value }) {
    const { settings } = this.state;
    settings.source = value;
    this.setState({ settings, activeSynth: null });
  };

  updateScale(newSetting) {
    this.setState(({ key, base, scaleName }) => {
      const newState = { key, base, scaleName, ...newSetting };
      const scale = getScale({ ...newState });
      return {  ...newState, scale, activeSynth: null };
    });
  }

  updateKey({ value }) {
    this.updateScale({ key: value });
  }

  updateBase({ value }) {
    this.updateScale({ base: value });
  }

  updateScaleName({ value }) {
    this.updateScale({ scaleName: value });
  }

  updateCutoff(value){
    const { settings } = this.state;
    if (!settings.filter) return;
    settings.filter.frequency = value;
    this.setState({ settings, activeSynth: null });
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
    this.setState({ settings, activeSynth: null });
  }

  updateQ(value) {
    const { settings } = this.state;
    if (!settings.filter) return;
    settings.filter.q = value;
    this.setState({ settings, activeSynth: null });
  }

  updateNotelength({ value }){
    const { settings } = this.state;
    this.setState({ settings: { ...settings, hold: value }, activeSynth: null })
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
      activePattern: index,
    }));
  }

  setSynth(index) {
    this.setState(({ synths }) => ({
      ...cloneDeep(synths[index]),
      activeSynth: index,
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
      updateBPM,
    } = this;

    const {
      score: columns,
      activeBeat: activeColumn,
      activePattern,
      activeSynth,
      scaleName,
      key,
      base,
      controls,
      settings,
    } = this.state;

    const {
      attack,
      sustain,
      decay,
      release,
      hold,
    } = controls;

    const scaleOptions = scaleNames.map(scale => ({ value: scale, label: scale }));

    const filterValue = settings.filter
      ? { value: settings.filter.type, label: settings.filter.type }
      : { value: '', label: 'none' };

    const filterCutoffValue = settings.filter && settings.filter.frequency ? settings.filter.frequency : 1;
    const filterQValue = settings.filter && settings.filter.q ? settings.filter.q : 1;

    return (
      <Provider value={{ toggle, updateBPM }}>
        <div className="container" {...{
          onMouseDown,
          onMouseUp,
        }}>
          <Grid {...{ columns, activeColumn }} />
          <PlayButton />
          <RecordButton />
          <NumberInput bpm={300} />
          <NumericInput min={40} max={240}
            defaultValue={Transport.bpm.value}
            onChange={(value) => this.updateBPM(value)}
          />
          <div>
            <h3 className="control-heading">BPM</h3>
            <label htmlFor="bpm" className="slider">
              <input type="range" min={40} max={240} name="bpm" defaultValue="120"
                className="bpm range-slider__range"
                onChange={(e) => this.updateBPM(parseInt(e.target.value))} />
            </label>
          </div>
          <div>
            <div style={{margin: '1rem'}}>
              <a
                onClick={this.savePattern}
                className='save-button'
              >save pattern</a>
              {
                this.state.patterns.map((pattern, i) =>
                  <a key={i}
                    onClick={() => this.setPattern(i)}
                    className={i === activePattern ? 'active' : '' }
                  >{i + 1}</a>
                )
              }
            </div>
            <div>
              <a
                onClick={this.saveSynth}
                className='save-button'
              >save synth</a>
              {
                this.state.synths.map((synth, i) =>
                  <a
                    key={i}
                    onClick={() => this.setSynth(i)}
                    className={i === activeSynth ? 'active' : '' }
                  >{i + 1}</a>
                )
              }
            </div>

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
                  onChange={this.updateKey}
                />
                <Select
                  className="select small"
                  classNamePrefix="select"
                  value={{ value: base, label: base }}
                  options={Array(5).fill(0).map((_, i) => ({ label: i + 1, value: i + 1 }))}
                  onChange={this.updateBase}
                />
                <Select
                  isSearchable
                  className="select"
                  classNamePrefix="select"
                  value={{ label: scaleName, value: scaleName }}
                  options={scaleOptions}
                  onChange={this.updateScaleName}
                />
              </section>

              <section>
                <h3 className="control-heading">Envelope</h3>
                <Slider name="attack" value={attack} min="1" max="100" {...{ updateSetting }} />
                <Slider name="sustain" value={sustain} min="1" max="100" {...{ updateSetting }} />
                <Slider name="decay" value={decay} min="1" max="100" {...{ updateSetting }} />
                <Slider name="release" value={release} min="1" max="100" {...{ updateSetting }} />
                <Slider name="hold" value={hold} min="0.1" max="100" {...{ updateSetting }} />
                <Select
                  className="select"
                  classNamePrefix="select"
                  defaultValue={{ value: '16', label: '16' }}
                  options={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '4', label: '4' },
                    { value: '8', label: '8' },
                    { value: '16', label: '16' },
                  ]}
                  onChange={this.updateNotelength}
                />

              </section>
              <section>
                <h3 className="control-heading">Filter</h3>
                <Select
                  className="select"
                  classNamePrefix="select"
                  value={filterValue}
                  options={[
                    { value: '', label: 'none' },
                    { value: 'highpass', label: 'highpass' },
                    { value: 'lowpass', label: 'lowpass' },
                  ]}
                  onChange={this.updateFilterType}
                />
                <label htmlFor="cutoff" className="slider">
                  <input type="range" min={1} max={5000} name="cutoff"
                    value={filterCutoffValue}
                    className="range-slider__range"
                    onChange={(e) => this.updateCutoff(parseInt(e.target.value))} />
                  cutoff
                 </label>
                <label htmlFor="q" className="slider">
                  <input type="range" min={1} max={50} name="q"
                    value={filterQValue}
                    className="range-slider__range"
                    onChange={(e) => this.updateQ(parseInt(e.target.value))} />
                  q
                </label>
              </section>
            </div>
          </div>
        </div>
      </Provider>
    );
  }
}

export default App;