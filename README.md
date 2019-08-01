# Reader

## Example

```js
const OsmPbfReader = require('osm-pbf-io').Reader;

const reader = new OsmPbfReader('./thailand-latest.osm.pbf');

reader.on('nodes', nodes => {
  nodes.forEach(node => {
    console.log(`Node ID ${node.id} @${node.lat},${node.lng}`);
  });
});

reader.on('ways', ways => {
  ways.forEach(way => {
    console.log(`Way ID ${way.id} (refs: ${way.refs.join(', ')})`);
  });
});

reader.on('relations', relations => {
  relations.forEach(relation => {
    console.log(`Relation ID ${relation.id} members: ${relation.members.length}`);
  });
});

reader.on('finish', () => {
  console.log('Finish');
});

reader.start();

```

---

# Writer

## Example

```js
const OsmPbfTypes = require('osm-pbf-io').Types;
const OsmPbfWriter = require('osm-pbf-io').Writer;

const nodes = [
  {id: 1, type: OsmPbfTypes.node, lat: 18.766886, lng: 99.017465, tags: {name: 'test_node'}},
  {id: 2, type: OsmPbfTypes.node, lat: 18.761441, lng: 99.019739, tags: {}}
];

const ways = [
  {id: 3, type: OsmPbfTypes.way, refs: [1, 2], tags: {name: 'test_way'}}
];

const relations = [
  {id: 4, type: OsmPbfTypes.relation, members: [
    {id: 1, role: 'test_role', type: OsmPbfTypes.node},
    {id: 3, role: 'test_role', type: OsmPbfTypes.way}
  ]}
];

const writer = new OsmPbfWriter('./output.osm.pbf');

// event when file is successfully written and closed
writer.on('finish', () => {
  console.log('Success!');
});

nodes.forEach(node => { writer.addGeo(node); });
ways.forEach(way => { writer.addGeo(way); });
relations.forEach(relation => { writer.addGeo(relation); });
writer.finish(); // call this method when finish adding geos
```

---

# Object Schemas

## Node

- `id: number`
- `lat: number` - Latitude
- `lng: nnumber` - Longitude
- `type: 0` - Always zero for **node** type
- `...data` - Other data (see below at [Other Data](#other-data))

## Way

- `id: number`
- `refs: number[]` - array of node ids
- `type: 1` - Always one for **way** type
- `...data` - Other data (see below at [Other Data](#other-data))

## Relation

- `id: number`
- `type: 2` - Always two for **relation** type
- `members: memberObject[]` - Array of members in this relation, each object element in this array contains following fields:
  - `memberObject.id: number` - id of member
  - `memberObject.role: string` - member role
  - `memberObject.type: number` - `0` if the member is node, `1` if way, and `2` if relation
- `...data` - Other data (see below at [Other Data](#other-data))

<a id="other-data"></a>
## Other data

Possible info fields in each element. In `Reader` these might exist or not after read, in `Writer` these are optional for writing.

- `tags: object` - Element tags
- `version: any`
- `timestamp: Date` - Date object in javascript
- `changeSet: any`
- `uid: number`
- `username: string`

---
