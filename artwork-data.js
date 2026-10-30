// Panel dimensions and section count: PARALLELS technical rider, supplied PDF page 3 (printed p4).
// The rider's detailed rigging drawings apply to the eight-laser configuration.
export const configurations={
 wide:{name:'Long wall · 4 lasers',width:10,height:1.5,cols:4,rows:1,sectionWidth:2.5,sectionHeight:1.5},
 tall:{name:'Tall wall · 4 lasers',width:3,height:5,cols:2,rows:2,sectionWidth:1.5,sectionHeight:2.5}
};
export const defaultArtwork={config:'wide',x:7,z:16,rotation:180,throw:8.5,bottom:2.5,visible:true,beams:true};
export function validArtwork(v){return v&&Object.hasOwn(configurations,v.config)&&['x','z','rotation','throw','bottom'].every(k=>Number.isFinite(v[k]))&&v.x>=-20&&v.x<=100&&v.z>=-20&&v.z<=100&&v.rotation>=-360&&v.rotation<=360&&v.throw>=2&&v.throw<=30&&v.bottom>=0&&v.bottom<=10&&typeof v.visible==='boolean'&&typeof v.beams==='boolean';}
export function localToSite(a,x,z){const angle=a.rotation*Math.PI/180;return [a.x+x*Math.cos(angle)+z*Math.sin(angle),a.z-x*Math.sin(angle)+z*Math.cos(angle)];}
export function footprint(a){const c=configurations[a.config],half=c.width/2+.6;return [[-half,-.9],[half,-.9],[half,a.throw+.8],[-half,a.throw+.8]].map(([x,z])=>localToSite(a,x,z));}
export function artworkWarnings(a,trees,inside){const p=footprint(a),out=[];let outside=false;for(let i=0;i<4;i++)for(let j=0;j<=100;j++){const b=p[(i+1)%4];if(!inside(p[i][0]+(b[0]-p[i][0])*j/100,p[i][1]+(b[1]-p[i][1])*j/100))outside=true;}if(outside)out.push('The planning envelope extends outside the marked site.');const c=configurations[a.config],hits=trees.filter(t=>{const angle=-a.rotation*Math.PI/180,dx=t.x-a.x,dz=t.z-a.z,x=dx*Math.cos(angle)+dz*Math.sin(angle),z=-dx*Math.sin(angle)+dz*Math.cos(angle);return Math.hypot(Math.max(Math.abs(x)-c.width/2-.6,0),Math.max(-.9-z,0,z-a.throw-.8))<t.r;});if(hits.length)out.push(`Planning envelope overlaps ${hits.map(t=>t.name).join(', ')} canopy allowance.`);return out;}
