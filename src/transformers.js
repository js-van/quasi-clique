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
      color: '#444',
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
      color: '#444',
    }));
  return transformer.transform(graph);
};
