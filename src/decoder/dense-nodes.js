const decodeLatLng = require('./lat-lng');
const decodeTimestamp = require('./timestamp');
const createNode = require('./../geos/node');

module.exports = (dense, settings) => {

  let tagKeyValueIndex = 0;

  let id = 0;
  let lat = 0;
  let lng = 0;
  let changeSet = 0;
  let timestamp = 0;
  let uid = 0;
  let userSid = 0;
  let version = 0;

  const nodes = [];

  for (let i = 0; i < dense.id.length; i++) {
    id += parseInt(dense.id[i]);
    lat += parseFloat(dense.lat[i]);
    lng += parseFloat(dense.lon[i]);

    const info = {};

    if (dense.denseinfo) {
      changeSet += parseInt(dense.denseinfo.changeset[i]);
      timestamp += parseInt(dense.denseinfo.timestamp[i]);
      uid += parseInt(dense.denseinfo.uid[i]);
      userSid += parseInt(dense.denseinfo.userSid[i]);
      version += parseInt(dense.denseinfo.version[i]);

      info['changeSet'] = changeSet;
      info['timestamp'] = decodeTimestamp(timestamp, settings.dateGranularity);
      info['uid'] = uid;
      info['version'] = version;
      info['username'] = settings.stringTable.s[userSid];
    }

    const tags = {};
    while (dense.keysVals.length > tagKeyValueIndex && dense.keysVals[tagKeyValueIndex]) {
      tags[settings.stringTable.s[dense.keysVals[tagKeyValueIndex++]]] =
        settings.stringTable.s[dense.keysVals[tagKeyValueIndex++]];
    }
    tagKeyValueIndex++;

    nodes.push(createNode(
      id,
      decodeLatLng(lat, settings.latOffset, settings.granularity),
      decodeLatLng(lng, settings.lngOffset, settings.granularity),
      {
        ...info,
        tags: tags
      }
    ));
  }

  return nodes;
}
