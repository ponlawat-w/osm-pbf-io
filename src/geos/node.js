const type = require('./../osm-object-type').node;

module.exports = (id, lat, lng, data = {}) => ({
  id: parseInt(id),
  lat: parseFloat(lat),
  lng: parseFloat(lng),
  type: parseInt(type),
  ...data
});
