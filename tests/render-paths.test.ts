import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {componentGeometry,chainstayPoints,catmullRomSegments,handlebarPoints,saddleRailPoints} from '@tracklab/domain';
import {Bike2D} from '@tracklab/domain/svg';
import {seedCatalog,defaultConfiguration} from '../backend/src/catalog';
describe('shared projected component paths',()=>{
 it('matches the actual centripetal mesh curve without importing Three into the SVG bundle',()=>{
  const g=componentGeometry(),paths=[chainstayPoints(g,1),saddleRailPoints(g.saddle,1),...['drop','riser','flat','bullhorn'].map(shape=>handlebarPoints({shape}))];
  for(const points of paths){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
   for(const [i,segment] of catmullRomSegments(points).entries()){const cubic=new THREE.CubicBezierCurve3(...segment.map(p=>new THREE.Vector3(...p)) as [THREE.Vector3,THREE.Vector3,THREE.Vector3,THREE.Vector3]);
    for(const t of [0,.15,.5,.85,1])expect(cubic.getPoint(t).distanceTo(curve.getPoint((i+t)/(points.length-1)))).toBeLessThan(1e-9);
   }
  }
 });
 it('keeps the opposite crank behind the frame and outer axle hardware above the dropout',()=>{
  const svg=renderToStaticMarkup(createElement(Bike2D,{catalog:seedCatalog,configuration:defaultConfiguration}));
  expect(svg.indexOf('data-layer="far-drivetrain"')).toBeLessThan(svg.indexOf('data-paint-zone="chainstay"'));
  expect(svg.indexOf('data-layer="outer-axle-hardware"')).toBeGreaterThan(svg.indexOf('data-steering-assembly'));
  expect(svg).toContain('data-seating-profile="shared-contour"');
 });
});
