import Graph from 'egraph/lib/graph'
import Layouter from 'egraph/lib/layouter/sugiyama'
import layerAssignment from './layer-assignment'

const components = (graph) => {
  const visited = new Set();
  let result = [];
  for (const u of graph.vertices()) {
    if (visited.has(u)) {
      continue;
    }
    const queue = [u];
    const vertices = new Set();
    while (queue.length) {
      const v = queue.shift();
      if (visited.has(v)) {
        continue;
      }
      visited.add(v);
      vertices.add(v);
      for (const w of graph.inVertices(v)) {
        queue.push(w);
      }
      for (const w of graph.outVertices(v)) {
        queue.push(w);
      }
    }
    result.push(Array.from(vertices));
  }
  return result;
};

const copy = (g) => {
  const graph = new Graph();
  for (const component of components(g)) {
    for (const u of component) {
      graph.addVertex(u, g.vertex(u));
    }
  }
  for (const [u, v] of g.edges()) {
    graph.addEdge(u, v, g.edge(u, v));
  }
  return graph;
};

const layoutGraph = (g, {layerMargin, vertexMargin}) => {
  const graph = copy(g);
  const layouter = new Layouter()
    .layerAssignment(layerAssignment(graph))
    .layerMargin(layerMargin)
    .vertexWidth(() => 10)
    .vertexHeight(() => 10)
    .vertexMargin(vertexMargin)
    .edgeWidth(() => 2)
    .edgeMargin(1);
  const positions = layouter.layout(graph);

  const vertices = [];
  for (const u of graph.vertices()) {
    const d = graph.vertex(u);
    const {x, y, width, height, layer, order} = positions.vertices[u];
    const x0 = d.x === undefined ? x : d.x;
    const y0 = d.y === undefined ? 0 : d.y;
    vertices.push({u, x, y, x0, y0, width, height, layer, order, d});
  }

  const enterPoints = (u, v) => {
    const uD = graph.vertex(u),
      vD = graph.vertex(v),
      ux0 = uD.x === undefined ? positions.vertices[u].x : uD.x,
      uy0 = uD.y === undefined ? 0 : uD.y,
      vx0 = vD.x === undefined ? positions.vertices[v].x : vD.x,
      vy0 = vD.y === undefined ? 0 : vD.y;
    return [[ux0, uy0], [ux0, uy0], [vx0, vy0], [vx0, vy0], [vx0, vy0], [vx0, vy0]];
  };
  const edges = [];
  for (const [u, v] of graph.edges()) {
    const d = graph.edge(u, v);
    const {points, reversed} = positions.edges[u][v];
    while (points.length < 6) {
      points.push(points[points.length - 1]);
    }
    const points0 = d.points === undefined ? enterPoints(u, v) : d.points;
    edges.push({u, v, points, points0, reversed, d});
  }

  for (const u of graph.vertices()) {
    const {x, y} = positions.vertices[u];
    Object.assign(graph.vertex(u), {x, y});
  }
  for (const [u, v] of graph.edges()) {
    const {points} = positions.edges[u][v];
    Object.assign(graph.edge(u, v), {points});
  }

  return {vertices, edges};
};

export default layoutGraph
