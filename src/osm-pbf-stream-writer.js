const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const protobuf = require('protobufjs');
const root = protobuf.loadSync(__dirname + '/protos/file-format.proto');
const messages = {
  blobHeader: root.lookupType('BlobHeader'),
  blob: root.lookupType('Blob')
};
const osmPbfBlobEncode = require('./osm-pbf-blob-encode');
const osmPbfBlobEncodeHeader = require('./osm-pbf-blob-encode-header');

const blockItemLength = 8000;

class OsmPbfStreamWriter {
  constructor(targetpath, compress = true, dense = true) {
    this.geos = [];

    this.stream = fs.createWriteStream(targetpath);
    this.events = new EventEmitter();

    this.compress = compress;
    this.dense = dense;

    this._flushHeader();
  }

  _flushBlockToFile(fileBlock, type = 'OSMData') {
    const blob = messages.blob.encode(fileBlock).finish();
    const blobHeader = messages.blobHeader.encode({
      type: type,
      datasize: blob.length
    }).finish();
    const headerSize = blobHeader.length;

    const headerSizeBuffer = Buffer.alloc(4);
    headerSizeBuffer.writeInt32BE(headerSize);

    this.stream.write(headerSizeBuffer);
    this.stream.write(blobHeader);
    this.stream.write(blob);
    this.events.emit('flush', headerSize + blobHeader.length + blob.length);
  }

  _flushHeader() {
    const fileBlock = osmPbfBlobEncodeHeader(this.compress, this.dense);
    this._flushBlockToFile(fileBlock, 'OSMHeader');
  }

  _flushGeos() {
    if (this.geos.length) {
      const fileBlock = osmPbfBlobEncode(this.geos, this.compress, this.dense);
      this.geos = [];
      this._flushBlockToFile(fileBlock);
    }
  }
  
  addGeo(geo) {
    this.geos.push(geo);
    if (this.geos.length >= blockItemLength) {
      this._flushGeos();
    }
  }

  finish() {
    this._flushGeos();
    this.stream.end();
    this.stream.close();
    this.events.emit('finish');
  }

  on(eventName, listener) {
    return this.events.on(eventName, listener);
  }
}

module.exports = OsmPbfStreamWriter;
