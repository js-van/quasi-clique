import Graph from 'egraph/lib/graph'
import copy from 'egraph/lib/graph/copy'
import EdgeConcentrationTransformer from 'egraph/lib/transformer/edge-concentration'
import newbery from 'egraph/lib/transformer/edge-concentration/newbery'
import layerAssignment from './layer-assignment'

export const edgeConcentrationNewbery = (g) => {
  const graph = copy(g);
  const transformer = new EdgeConcentrationTransformer()
    .method(newbery)
    .layerAssignment(layerAssignment(graph))
    .dummy(() => ({
      dummy: true,
      width: 0,
      height: 0,
      name: '',
      color: '#888',
    }));
  return transformer.transform(graph);
};

export const edgeConcentrationMaxrect = (g) => {
  const graph = copy(g);
  const transformer = new EdgeConcentrationTransformer()
    .layerAssignment(layerAssignment(graph))
    .dummy(() => ({
      dummy: true,
      width: 0,
      height: 0,
      name: '',
      color: '#888',
    }));
  return transformer.transform(graph);
};

export const quasiClique = (g, mu) => {
  const graph = copy(g);
  const visited = new Set();
  const us = graph.vertices();
  us.sort((u, v) => (graph.inDegree(u) + graph.outDegree(u)) - (graph.inDegree(v) + graph.outDegree(v)));
  const cliques = [];
  for (const u of us) {
    if (graph.inDegree(u) > 0 || visited.has(u)) {
      continue;
    }
    const queue = [u];
    const vertices = new Set();
    while (queue.length) {
      const v = queue.shift();
      if (vertices.has(v)) {
        continue;
      }
      vertices.add(v);
      for (const w of graph.outVertices(v)) {
        queue.push(w);
      }
      for (const w of graph.inVertices(v)) {
        if (!visited.has(w)) {
          queue.push(w);
        }
      }
    }

    const subgraph = new Graph();
    for (const v of vertices) {
      subgraph.addVertex(v);
    }
    for (const [v, w] of graph.edges()) {
      if (vertices.has(v) && vertices.has(w)) {
        subgraph.addEdge(v, w);
      }
    }
    let U = subgraph.vertices().filter((v) => subgraph.inDegree(v) === 0);
    let L = subgraph.vertices().filter((v) => subgraph.outDegree(v) === 0);
    let E = subgraph.edges()
    for (let degree = 1; E.length / U.length / L.length < mu; degree++) {
      for (const v of subgraph.vertices()) {
        if (subgraph.inDegree(v) + subgraph.outDegree(v) <= degree) {
          subgraph.removeVertex(v);
        }
      }
      U = subgraph.vertices().filter((v) => subgraph.inDegree(v) === 0);
      L = subgraph.vertices().filter((v) => subgraph.outDegree(v) === 0);
      E = subgraph.edges()
    }
    if (U.length < 2 || L.length < 2) {
      continue;
    }
    for (const v of U) {
      visited.add(v);
    }
    cliques.push({U, L});
  }
  for (const clique of cliques) {
    const {U, L} = clique;
    const w = Symbol();
    graph.addVertex(w, {
      dummy: true,
      width: 0,
      height: 0,
      name: '',
      color: '#888',
    });
    for (const v of U) {
      graph.addEdge(v, w, {p: graph.outDegree(v) / L.length});
    }
    for (const v of L) {
      graph.addEdge(w, v, {p: graph.inDegree(v) / U.length});
    }
    for (const x of U) {
      for (const y of L) {
        if (graph.edge(x, y)) {
          graph.removeEdge(x, y);
        }
      }
    }
  }
  return graph;
};
