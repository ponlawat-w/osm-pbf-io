const fs = require('fs');
const protobuf = require('protobufjs');
const EventEmitter = require('events').EventEmitter;
const osmPbfBlobDecode = require('./osm-pbf-blob-decode');
const root = protobuf.loadSync(__dirname + '/protos/file-format.proto');
const messages = {
  blobHeader: root.lookupType('OSMPBF.BlobHeader'),
  blob: root.lookupType('OSMPBF.Blob')
};

class OsmPbfStreamReader {

  constructor(sourcePath) {
    this.events = new EventEmitter();

    this.buffer = Buffer.alloc(0);
    this.bufferPointer = 0;

    this.streamFinished = false;
    this.withInfos = true;

    const stats = fs.statSync(sourcePath);
    this.size = parseInt(stats['size']);

    this.stream = fs.createReadStream(sourcePath);
    this.stream.pause();

    this.stream.on('data', function (chunk) {
      this._onFileStreamChunk(chunk);
    }.bind(this));

    this.stream.on('end', function () {
      this.stream.close();
      this.streamFinished = true;
      this.properlyEmitFinishEvent();
    }.bind(this));
  }

  _clearProcessedBuffer() {
    const newBufferLength = this.buffer.length - this.bufferPointer;
    const currentBuffer = this.buffer;
    this.buffer = Buffer.alloc(newBufferLength);
    for (let i = 0; i < newBufferLength; i++) {
      this.buffer[i] = currentBuffer[i + this.bufferPointer];
    }
    this.bufferPointer = 0;
  }

  _lengthIsReadable(wantedLength) {
    return this.bufferPointer + wantedLength <= this.buffer.length;
  }

  _tryReadBlobHeaderLength() {
    this.bufferPointer = 0;
    if (this._lengthIsReadable(4)) {
      const bufferLength4 = this.buffer.slice(this.bufferPointer, this.bufferPointer + 4);
      this.bufferPointer += 4;
      return bufferLength4.readInt32BE();
    }
    return null;
  }

  _tryReadBlobHeader(blobHeaderLength) {
    this.bufferPointer = 4;
    if (this._lengthIsReadable(blobHeaderLength)) {
      const blobHeaderBuffer = this.buffer.slice(this.bufferPointer, this.bufferPointer + blobHeaderLength);
      this.bufferPointer += blobHeaderLength;
      return messages.blobHeader.decode(blobHeaderBuffer);
    }
    return null;
  }

  _tryReadBlob(blobHeaderLength, blobHeader) {
    this.bufferPointer = 4 + blobHeaderLength;
    if (this._lengthIsReadable(blobHeader.datasize)) {
      const blob = this.buffer.slice(this.bufferPointer, this.bufferPointer + blobHeader.datasize);
      this.bufferPointer += blobHeader.datasize;
      return messages.blob.decode(blob);
    }
    return null;
  }

  _onFileStreamChunk(chunk) {
    this.events.emit('chunk', chunk);
    this.buffer = Buffer.concat([this.buffer, chunk], this.buffer.length + chunk.length);

    while (true) {
      const blobHeaderLength = this._tryReadBlobHeaderLength();
      if (!blobHeaderLength) {
        break;
      }

      const blobHeader = this._tryReadBlobHeader(blobHeaderLength);
      if (!blobHeader) {
        break;
      }

      const blob = this._tryReadBlob(blobHeaderLength, blobHeader);
      if (!blob) {
        break;
      }

      this._clearProcessedBuffer();

      this.events.emit('fileBlock', blob, blobHeader, blobHeaderLength);
      osmPbfBlobDecode(blob, blobHeader, this.events, this.withInfos);
    }

    this.properlyEmitFinishEvent();
  }

  properlyEmitFinishEvent() {
    if (this.streamFinished && !this.buffer.length && !this.finishEventEmitted) {
      this.events.emit('finish');
      this.finishEventEmitted = true;
    }
  }

  start() {
    this.stream.resume();
  }

  on(eventName, listener) {
    return this.events.on(eventName, listener);
  }
}

module.exports = OsmPbfStreamReader;
