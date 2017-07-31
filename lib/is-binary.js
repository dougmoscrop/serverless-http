'use strict';

const BINARY_ENCODINGS = ['gzip', 'deflate'];
const BINARY_CONTENT_TYPES = (process.env.BINARY_CONTENT_TYPES || '').split(',');

function isBinaryEncoding(headers) {
  const contentEncoding = headers['content-encoding'];

  if (typeof contentEncoding === 'string') {
    return contentEncoding.split(',').some(value =>
      BINARY_ENCODINGS.some(binaryEncoding =>
        value.indexOf(binaryEncoding !== -1)
      )
    );
  }
}

function isBinaryContent(headers, options) {
  const contentTypes = Array.isArray(options.binary)
    ? options.binary : BINARY_CONTENT_TYPES;

  return contentTypes.some(contentType =>
    contentType === headers['content-type']
  );
}

module.exports = function isBinary(headers, options) {
  if (options.binary === false) {
    return false;
  }

  if (typeof options.binary === 'function') {
    return options.binary(headers);
  }

  return isBinaryEncoding(headers) || isBinaryContent(headers, options);
};
