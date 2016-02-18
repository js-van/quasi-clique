import React from 'react'
import zoom from './zoom'

const NetworkDiagram = zoom(class extends React.Component {
  render() {
    const {children, x, y, scale} = this.props;
    return <svg width="100%" height="100%" style={{cursor: 'move'}}>
      <g transform={`translate(${x},${y})scale(${scale})`}>
        {children}
      </g>
    </svg>
  }
});

export default NetworkDiagram
