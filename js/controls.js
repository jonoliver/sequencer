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