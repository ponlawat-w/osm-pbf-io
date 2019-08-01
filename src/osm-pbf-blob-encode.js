const protobuf = require('protobufjs');
const geoType = require('./osm-object-type');
const encodeNodes = require('./encoder/nodes');
const encodeDenseNodes = require('./encoder/dense-nodes');
const encodeWays = require('./encoder/ways');
const encodeRelations = require('./encoder/relations');
const encodeRawBlob = require('./encoder/raw-blob');
const root = protobuf.loadSync(__dirname + '/protos/osm-format.proto');
const message = root.lookupType('PrimitiveBlock');

const defaultGranularity = 100;
const defaultDateGranularity = 1000;
const defaultLatOffset = 0;
const defaultLngOffset = 0;

class StringTable {
  constructor() {
    this.strings = [];
    this.dict = {};
  }

  add(str) {
    if (this.dict[str]) {
      return this.dict[str];
    }
    
    this.strings.push(str);
    this.dict[str] = this.strings.length - 1;
    return this.dict[str];
  }
}

module.exports = (geos, compress = true, denseNode = true) => {
  const nodes = geos.filter(geo => geo.type === geoType.node);
  const ways = geos.filter(geo => geo.type === geoType.way);
  const relations = geos.filter(geo => geo.type === geoType.relation);

  const stringTable = new StringTable();

  const settings = {
    granularity: defaultGranularity,
    latOffset: defaultLatOffset,
    lngOffset: defaultLngOffset,
    dateGranularity: defaultDateGranularity
  };

  const primitiveGroup = [];

  if (nodes.length) {
    if (denseNode) {
      primitiveGroup.push({
        nodes: [],
        dense: encodeDenseNodes(nodes, settings, stringTable),
        ways: [],
        relations: [],
        changesets: []
      });
    } else {
      primitiveGroup.push({
        nodes: encodeNodes(nodes, settings, stringTable),
        ways: [],
        relations: [],
        changesets: []
      });
    }
  }
  if (ways.length) {
    primitiveGroup.push({
      nodes: [],
      ways: encodeWays(ways, settings, stringTable),
      relations: []
    });
  }
  if (relations.length) {
    primitiveGroup.push({
      nodes: [],
      ways: [],
      relations: encodeRelations(relations, settings, stringTable)
    });
  }

  const primitiveBlock = {
    granularity: settings.granularity,
    latOffset: settings.latOffset,
    lonOffset: settings.lngOffset,
    dateGranularity: settings.dateGranularity,
    primitivegroup: primitiveGroup,
    stringtable: {
      s: stringTable.strings.map(str => Buffer.from(str))
    }
  };
  const rawBlob = message.encode(primitiveBlock).finish();

  return encodeRawBlob(rawBlob, compress);
};
