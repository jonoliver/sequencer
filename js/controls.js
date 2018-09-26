import React, { Component, Fragment } from 'react';
import ReactSelect from 'react-select';
import { Transport } from 'tone';
import { Consumer } from './context';
import * as Recorder from './recorder';

const Cell = ({ active, x, y }) =>
  <Consumer>
    { ({ toggle }) =>
      <div
        onMouseDown={() => toggle(x, y)}
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

export const Grid = ({ columns, activeColumn }) =>
  <div className="grid">
    {
      columns.map((cells, y) => <Column key={y} {...{cells, activeColumn, y}} />)
    }
  </div>

export const Slider = ({ name, min, max, value, updateSetting }) =>
  <label htmlFor={name} className="slider">
    <input type="range" {...{ min, max, name, value }}
      className="range-slider__range"
      onChange={ (e) => updateSetting(name, e.target.value) } />
    {name}
  </label>

export class Select extends Component {
  shouldComponentUpdate(nextProps){
    return (nextProps.value && this.props.value)
      ? nextProps.value.value !== this.props.value.value
      : false;
  }

  render(){
    return <ReactSelect {...this.props } />
  }
}

export class PlayButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlaying: true,
    };
    this.togglePlay = this.togglePlay.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keyup', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        this.togglePlay();
      }
    });
  }

  togglePlay(){
    this.setState(({ isPlaying }) => {
      Transport.toggle();
      return { isPlaying: !isPlaying };
    });
  }

  render(){
    const { isPlaying } = this.state;
    return (
      <button
        onClick={this.togglePlay}
        className={isPlaying ? 'play' : 'pause'}
      >
      </button>
    )
  }
}

export class RecordButton extends Component {
  constructor(props){
    super(props);
    this.state = {
      isRecording: false,
      url: null,
    }
    this.toggleRecord = this.toggleRecord.bind(this);
    this.setLink = this.setLink.bind(this);
  }

  setLink(url){
    this.setState({ url });
  }


  toggleRecord(){
    this.setState(({ isRecording }) => {
      if (isRecording) {
        Recorder.stop(this.setLink);
      } else {
        Recorder.record();
      }

      return { isRecording: !isRecording };
    });
  }

  render(){
    const { isRecording, url } = this.state;
    return (
      <Fragment>
        <button
          onClick={this.toggleRecord}
          className={`record ${isRecording ? 'active' : ''}`}
        >
        </button>
        {
          url && <a
            href={url}
            download='output.wav'
          ></a>
        }
      </Fragment>
    )
  }
}

const Arrow = () =>
  <svg className="css-19bqh2r" height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg>

export class NumberInput extends Component {

  constructor(props){
    super(props);
    this.state = props;
    this.updateBPM = this.updateBPM.bind(this);
    this.incrementBPM = this.incrementBPM.bind(this);
    this.decrementBPM = this.decrementBPM.bind(this);
  }

  updateBPM(event) {
    const { value } = event.target;
    console.log(event.type, this.state.bpm, value);

    if (event.key === 'Enter'
      // || (event.type === 'change' && this.state.bpm !== value)
  ) {
      event.preventDefault();
      this.setTransportBPM(value);
    }

    this.setState({ bpm: value });
  }

  incrementBPM(){
    const bpm = parseInt(this.state.bpm) + 1;
    this.setTransportBPM(bpm);
    this.setState({ bpm });
  }

  decrementBPM(){
    const bpm = parseInt(this.state.bpm) - 1;
    this.setTransportBPM(bpm);
    this.setState({ bpm });
  }

  setTransportBPM(value){
    Transport.pause();
    Transport.bpm.value = value;
    Transport.start();
  }

  render() {
    const { bpm } = this.state;
    return (
          <div>
            <input type="number"
              value={bpm}
              onKeyUp={this.updateBPM}
              onChange={this.updateBPM}
            />
          <div style={{ rotate: '180deg' }}>
            <a onClick={this.incrementBPM}>
              <Arrow />
            </a>
          </div>
            <a onClick={this.decrementBPM}>
              <Arrow />
            </a>

        </div>
    );
  }
}
