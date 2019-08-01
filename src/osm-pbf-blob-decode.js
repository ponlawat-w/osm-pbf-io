const protobuf = require('protobufjs');
const zlib = require('zlib');
const decodePrimitiveBlockSettings = require('./decoder/primitive-block-settings');
const decodeDenseNodes = require('./decoder/dense-nodes');
const decodeNodes = require('./decoder/nodes');
const decodeWays = require('./decoder/ways');
const decodeRelations = require('./decoder/relations');
const root = protobuf.loadSync(__dirname + '/protos/osm-format.proto');
const messages = {
  headerBlock: root.lookupType('HeaderBlock'),
  primitiveBlock: root.lookupType('PrimitiveBlock')
};

module.exports = (blob, blobHeader, parentEvents, withInfos = true) => {
  let rawBlob;
  if (blob.raw && blob.raw.length) {
    rawBlob = blob.raw;
  } else if (blob.zlibData && blob.zlibData.length) {
    rawBlob = zlib.inflateSync(blob.zlibData.buffer.slice(blob.zlibData.offset));
  } else {
    console.warn('Unreadable Blob');
    return;
  }

  if (blobHeader.type === 'OSMHeader') {
    parentEvents.emit('header', messages.headerBlock.decode(rawBlob));
    return;
  } else if (blobHeader.type !== 'OSMData') {
    console.warn(`Unknwon BlobHeader type: ${blobHeader.type}`);
    return;
  }
  
  const primitiveBlock = messages.primitiveBlock.decode(rawBlob);

  parentEvents.emit('primitive', primitiveBlock);

  const primitiveBlockSettings = decodePrimitiveBlockSettings(primitiveBlock);

  primitiveBlock.primitivegroup.forEach(primitiveGroup => {
    if (primitiveGroup.nodes && primitiveGroup.nodes.length) {
      parentEvents.emit('nodes', decodeNodes(primitiveGroup.nodes, primitiveBlockSettings));
    } else if (primitiveGroup.dense && primitiveGroup.dense.id && primitiveGroup.dense.id.length) {
      parentEvents.emit('nodes', decodeDenseNodes(primitiveGroup.dense, primitiveBlockSettings));
    } else if (primitiveGroup.ways && primitiveGroup.ways.length) {
      parentEvents.emit('ways', decodeWays(primitiveGroup.ways, primitiveBlockSettings));
    } else if (primitiveGroup.relations && primitiveGroup.relations.length) {
      parentEvents.emit('relations', decodeRelations(primitiveGroup.relations, primitiveBlockSettings));
    } else {
      console.warn('Unknown PrimitiveGroup Type');
    }
  });
}
