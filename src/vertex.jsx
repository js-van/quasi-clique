import React from 'react'

class Vertex extends React.Component {
  render() {
    const {x, y, d} = this.props;
    const {name, color} = d;
    return (
      <g
        transform={`translate(${x},${y})`}
        style={{cursor: 'pointer'}}>
        <circle
          fill={color}
          r={5}/>
        <text
          x={7}
          y={5}
          fill={color}
          fontSize="10pt">
          {name}
        </text>
      </g>
    );
  }
}

export default Vertex
