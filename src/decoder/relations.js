const decodePbfInfo = require('./pbf-info');
const decodePbfTags = require('./pbf-tags');
const createRelation = require('./../geos/relation');

module.exports = (pbfRelations, settings) => pbfRelations.map(pbfRelation => {
  let memberId = 0;
  const members = [];
  for (let i = 0; i < pbfRelation.types.length; i++) {
    memberId += parseInt(pbfRelation.memids[i]);
    members.push({
      id: memberId,
      role: settings.stringTable.s[pbfRelation.rolesSid[i]],
      type: pbfRelation.types[i]
    });
  }

  return createRelation(pbfRelation.id, members, settings.withInfos ? {
    ...decodePbfInfo(pbfRelation.info, settings),
    tags: decodePbfTags(pbfRelation, settings)
  } : {});
});
