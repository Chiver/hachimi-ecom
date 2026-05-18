import { readFileSync } from 'node:fs';
import { feature } from 'topojson-client';

function splitRingAtAntimeridian(ring) {
  let crosses = false;
  for (let i = 0; i < ring.length - 1; i++) {
    if (Math.abs(ring[i+1][0] - ring[i][0]) > 180) { crosses = true; break; }
  }
  if (!crosses) return [ring];
  const out = [[]];
  let cur = out[0];
  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i], p2 = ring[i+1];
    cur.push(p1);
    const dlon = p2[0] - p1[0];
    if (Math.abs(dlon) > 180) {
      const sign = p1[0] > 0 ? 1 : -1;
      const p2LonAdj = p2[0] + (dlon > 0 ? -360 : 360);
      const ratio = (sign * 180 - p1[0]) / (p2LonAdj - p1[0]);
      const cutLat = p1[1] + ratio * (p2[1] - p1[1]);
      cur.push([sign * 180, cutLat]);
      cur = [[-sign * 180, cutLat]];
      out.push(cur);
    }
  }
  cur.push(ring[ring.length - 1]);
  if (out.length > 1) {
    const first = out[0], last = out[out.length - 1];
    out[0] = [...last, ...first.slice(1)];
    out.pop();
  }
  return out.map(r => {
    if (r.length < 3) return null;
    if (r[0][0] !== r[r.length-1][0] || r[0][1] !== r[r.length-1][1]) r.push([...r[0]]);
    return r;
  }).filter(r => r && r.length >= 4);
}

const topo = JSON.parse(readFileSync('public/world-110m.json', 'utf8'));
const fc = feature(topo, topo.objects.countries);
const ata = fc.features.find(f => f.properties.name === 'Antarctica' || f.id === '010');
console.log('Antarctica found:', !!ata, 'id:', ata?.id, 'name:', ata?.properties?.name);
if (ata) {
  console.log('Type:', ata.geometry.type);
  const polys = ata.geometry.type === 'Polygon' ? [ata.geometry.coordinates] : ata.geometry.coordinates;
  console.log('Polygon count:', polys.length);
  for (let i = 0; i < polys.length; i++) {
    const ring = polys[i][0];
    const lons = ring.map(p => p[0]);
    const lats = ring.map(p => p[1]);
    const dlonMax = Math.max(...ring.slice(1).map((p,j) => Math.abs(p[0]-ring[j][0])));
    console.log('  raw poly['+i+']: '+ring.length+' verts, lon ['+Math.min(...lons).toFixed(1)+', '+Math.max(...lons).toFixed(1)+'], lat ['+Math.min(...lats).toFixed(1)+', '+Math.max(...lats).toFixed(1)+'], max dlon = '+dlonMax.toFixed(1));
    const split = splitRingAtAntimeridian(ring);
    console.log('  → split into '+split.length+' rings:');
    for (let j = 0; j < split.length; j++) {
      const r = split[j];
      const ll = r.map(p => p[0]);
      const la = r.map(p => p[1]);
      console.log('     ring['+j+']: '+r.length+' verts, lon ['+Math.min(...ll).toFixed(1)+', '+Math.max(...ll).toFixed(1)+'], lat ['+Math.min(...la).toFixed(1)+', '+Math.max(...la).toFixed(1)+']');
    }
  }
}
