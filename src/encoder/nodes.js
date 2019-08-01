const encodeTags = require('./pbf-tags');
const encodeInfo = require('./pbf-info');
const encodeLatLng = require('./lat-lng');

module.exports = (nodes, settings, stringTable) => nodes.map(node => {
  const encodedTags = encodeTags(node.tags);
  return {
    id: node.id,
    keys: encodedTags.keys,
    vals: encodedTags.vals,
    info: encodeInfo(node, settings, stringTable),
    lat: encodeLatLng(node.lat, settings.latOffset, settings.granularity),
    lon: encodeLatLng(node.lng, settings.lngOffset, settings.granularity)
  };
});
