const decodePbfInfo = require('./pbf-info');
const decodePbfTags = require('./pbf-tags');
const createWay = require('./../geos/way');

module.exports = (pbfWays, settings) => pbfWays.map(pbfWay => {
  let ref = 0;
  const refs = [];
  for (let i = 0; i < pbfWay.refs.length; i++) {
    ref += parseInt(pbfWay.refs[i]);
    refs.push(ref);
  }

  return createWay(pbfWay.id, refs, settings.withInfos ? {
    ...decodePbfInfo(pbfWay.info, settings),
    tags: decodePbfTags(pbfWay, settings)
  } : {});
});
