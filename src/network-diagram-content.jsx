import React from 'react'
import Vertex from './vertex'
import Edge from './edge'

class NetworkDiagramContent extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.layout !== nextProps.layout;
  }

  render() {
    const {layout} = this.props;
    return <g>
      <g>{layout.edges.map((d, i) => <Edge key={i} {...d}/>)}</g>
      <g>{layout.vertices.map((d, i) => <Vertex key={i} {...d}/>)}</g>
    </g>
  }
}

export default NetworkDiagramContent
