const encodeTags = require('./pbf-tags');
const encodeInfo = require('./pbf-info');

module.exports = (ways, settings, stringTable) => ways.map(way => {
  const encodedTags = encodeTags(way.tags, stringTable);
  const refs = [];
  let prevRef = 0;
  for (let n = 0; n < way.refs.length; n++) {
    refs.push(way.refs[n] - prevRef);
    prevRef = way.refs[n];
  }

  return {
    id: way.id,
    keys: encodedTags.keys,
    vals: encodedTags.vals,
    info: encodeInfo(way, settings, stringTable),
    refs: refs
  };
});
