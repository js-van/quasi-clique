import React from 'react'

class Edge extends React.Component {
  render() {
    const {points} = this.props;
    return (
      <g>
        <path
          d={`M${points[0][0]} ${points[0][1]}L ${points[5][0]} ${points[5][1]}`}
          fill="none"
          stroke="#aaa"
          strokeWidth="2"/>
      </g>
    );
  }
}

export default Edge
