const decodeLatLng = require('./lat-lng');
const decodePbfinfo = require('./pbf-info');
const decodePbfTags = require('./pbf-tags');
const createNode = require('./../geos/node');

module.exports = (pbfNodes, settings) => pbfNodes.map(pbfNode => createNode(
  parseInt(pbfNode.id),
  decodeLatLng(pbfNode.lat, settings.latOffset, settings.granularity),
  decodeLatLng(pbfNode.lon, settings.lngOffset, settings.granularity),
  settings.withInfos ? {
    ...decodePbfinfo(pbfNode.info, settings),
    tags: decodePbfTags(pbfNode, settings)
  } : {}
));
