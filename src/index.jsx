/* global document,fetch */
import React from 'react'
import {render} from 'react-dom'
import Graph from 'egraph/lib/graph'
import NetworkDiagram from './network-diagram'
import NetworkDiagramContent from './network-diagram-content'
import layoutGraph from './layout-graph'
import {
  edgeConcentrationNewbery,
  edgeConcentrationMaxrect,
  quasiClique,
  mbea,
} from './transformers'

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      graph: new Graph(),
    };
  }

  componentDidMount() {
    fetch('data.json')
      .then((response) => response.json())
      .then(({vertices, edges}) => {
        const graph = new Graph();
        const groups = ['2 cell', '4 cell', '4 cell-8 cell', '8 cell'];
        const source = groups[0];
        const sink = groups[1];
        for (const {u, d} of vertices) {
          if (d.group === source || d.group === sink) {
            d.groupOrder = d.group === source ? 0 : 1;
            graph.addVertex(u, d);
          }
        }
        for (const {u, v, d} of edges) {
          const du = graph.vertex(u);
          const dv = graph.vertex(v);
          if (du && dv && du.group !== dv.group && d.r > 0.5) {
            graph.addEdge(u, v, d);
          }
        }
        for (const u of graph.vertices()) {
          if (graph.inDegree(u) === 0 && graph.outDegree(u) === 0) {
            graph.removeVertex(u);
          }
        }
        this.setState({graph});
      });
  }

  render() {
    const layerMargin = 150;
    const vertexMargin = 10;

    const {graph} = this.state;
    const graphs = [
      ['Input', graph],
      ['MBEA', mbea(graph)],
    ];
    const nu = graph.vertices().filter((u) => graph.inDegree(u) === 0).length;
    const nl = graph.vertices().filter((v) => graph.outDegree(v) === 0).length;
    const ne = graph.edges().length

    return <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}>
      <NetworkDiagram>
        <g transform="translate(50, 50)">
          <text>{`|U|=${nu} |L|=${nl} |E|=${ne} p=${(ne / nu / nl).toFixed(3)}`}</text>
          {graphs.map(([name, g], i) => <g key={i} transform={`translate(${600 * i},50)`}>
            <text y="-20">{name}</text>
            <g transform="translate(100,0)">
              <NetworkDiagramContent layout={layoutGraph(g, {layerMargin, vertexMargin})}/>
            </g>
          </g>)}
        </g>
      </NetworkDiagram>
    </div>
  }
}

render(<App/>, document.getElementById('content'));
