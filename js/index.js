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
      activeBeat: 0,
    }
    this.tick = this.tick.bind(this);
    this.toggle = this.toggle.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentWillMount() {
    setInterval(this.tick, 250);
  }

  tick(){
    this.setState(({ activeBeat, score }) => {
      return { 
        activeBeat: activeBeat < score.length - 1 ? activeBeat + 1 :0,
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
    } = this;

    const {
      activeBeat: activeColumn 
    } = this.state;

    return (
      <Provider value={{ toggle }}>
        <div className="container" {...{ 
          onMouseDown,
          onMouseUp,
        }}>
          <Grid {...{ columns, activeColumn }} />
        </div>
      </Provider>
    );
  }
}

export default App;
