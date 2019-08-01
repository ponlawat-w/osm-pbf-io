const type = require('./../osm-object-type').way;

module.exports = (id, refs, data = {}) => ({
  id: parseInt(id),
  refs: refs.map(ref => parseInt(ref)),
  type: parseInt(type),
  ...data
});
