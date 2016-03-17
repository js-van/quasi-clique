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

export const mbea = (g) => {
  const graph = copy(g);
  const U_array = graph.vertices().filter((u) => graph.outDegree(u) );
  const V_array = graph.vertices().filter((u) => graph.inDegree(u) );
  const L_array = U_array;
  const R_array = [];
  const P_array = V_array;
  const Q_array = [];
  let cliques = [];
  biclique_find(graph, new Set(L_array), new Set(R_array), new Set(P_array), new Set(Q_array), cliques);
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
      graph.addEdge(v, w);
    }
    for (const v of L) {
      graph.addEdge(w, v);
    }

    //remove edges
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


const biclique_find = (graph, L, R, P, Q, cliques) => {
  while(P.size != 0){
    let x = Array.from(P)[0];
    P.delete(x);
    let _R = new Set([...R, x]);
    let _L = new Set(graph.inVertices(x).filter((u) => L.has(u)));
    let complement_L = new Set(Array.from(L).filter((u) => !_L.has(u)));
    _L.forEach((l) => {complement_L.delete(l)});
    let C = new Set([x]);
    let _P = new Set();
    let _Q = new Set();
    let is_maximal = true;
    for(let v of Q){
      let N = new Set(graph.inVertices(v).filter((u) => _L.has(u) ));
      if(N.size == _L.size){
        is_maximal = false;
        break;
      }else if(N.size > 0){
        _Q = _Q.add(v);
      }
    }
    if(is_maximal){
      for(let v of P){
        if(v != x){
          let N = new Set(graph.inVertices(v).filter((u) => _L.has(u) ));
          if(N.size == _L.size){
            _R.add(v);
            let S = new Set(graph.inVertices(v).filter((u) => complement_L.has(u) ));
            if(S.size == 0) C.add(v);
          }else if(N.size > 0){
            _P.add(v);
          }
        }
      }
      if(_P.size != 0){
        biclique_find(graph, _L, _R, _P, _Q, cliques);
      }else{
        if(_L.size>1 && _R.size>1) cliques.push({U: Array.from(_L), L: Array.from(_R)});
      }
    }
    Q = new Set([...Q, ...C]);
    P = new Set(Array.from(P).filter((v) => !C.has(v)));
  }
};

