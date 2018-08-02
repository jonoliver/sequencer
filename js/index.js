import React, { Component } from "react";

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

const Column = ({ cells, y }) =>
  <div className='column'>
    {
      cells.map((active, x) => <Cell key={x} {...{active, x, y}} />)
    }
  </div>

const Grid = ({ columns }) => 
  <div className="grid">
    {
      columns.map((cells, y) => <Column key={y} {...{cells, y}} />)
    }  
  </div>


const columns = [
  [1, 0, 0, 1, 0],
  [0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 1, 0, 1, 0],
];

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      score: columns,
      dragging: false,
    }
    this.toggle = this.toggle.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  toggle(x, y, checkDrag) {
    this.setState(({ dragging, score }) => {
      if (checkDrag && !dragging) return;
      score[y][x] = +!(score[y][x]);
      return score;  
    });
  }

  onMouseDown() {
    this.setState({ dragging: true });
  }

  onMouseUp() {
    this.setState({ dragging: false });
  }
  
  render() {
    const { toggle, onMouseDown, onMouseUp } = this;
    return (
      <Provider value={{ toggle }}>
        <div className="container" {...{ 
          onMouseDown,
          onMouseUp,
        }}>
          <Grid {...{ columns }} />
        </div>
      </Provider>
    );
  }
}

export default App;
