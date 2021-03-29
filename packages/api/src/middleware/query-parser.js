function parseBoolean(value) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}

function parseNumber(value) {
  if (/^\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value, 10);
  }

  return value;
}

function parseNull(value) {
  if (value === 'null') {
    return null;
  }

  return value;
}

function parseQueryOject(query) {
  const result = Object.entries(query).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      const newValue = parseBoolean(parseNumber(parseNull(value)));

      return { ...acc, [key]: newValue };
    }

    return { ...acc, [key]: value };
  }, {});

  return result;
}

export default function queryParserMiddleware(req, _res, next) {
  req.query = parseQueryOject(req.query);

  next();
}
