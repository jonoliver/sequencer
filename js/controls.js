import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { Consumer } from './context';

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
      onChange={ (e) => updateSetting(name, e.target.value) } />
    {name}
  </label>

export class Select extends Component {
  // Since all of the select options are static, no need to rerender
  // This fixes a bug that caused hovered options to display incorrectly
  shouldComponentUpdate(){
    return false;
  }

  render(){
    return <ReactSelect {...this.props } />
  }
}