// Traced from Screenshot 2026-10-30 at 17.25.38.png.
// Local coordinates: origin at upper-left boundary; +X right, +Z down image.
// Area calibration is not a survey. Google Maps 3D imagery has perspective distortion.
export const reference = { area: 1113.34, perimeter: 166.93, treeStripArea: 402.75, treeStripPerimeter: 133.62 };
const trace = [[394,167],[707,162],[746,1168],[630,1095],[570,1074],[470,1067],[478,1026],[463,1007],[478,914],[482,850],[447,730],[459,623],[442,540],[447,494],[446,459],[416,464],[400,418]];
export function polygonArea(points) { return Math.abs(points.reduce((a,p,i)=>{let q=points[(i+1)%points.length];return a+p[0]*q[1]-q[0]*p[1]},0))/2; }
export function perimeter(points) { return points.reduce((a,p,i)=>{let q=points[(i+1)%points.length];return a+Math.hypot(p[0]-q[0],p[1]-q[1])},0); }
export const metresPerPixel = Math.sqrt(reference.area/polygonArea(trace));
export const boundary = trace.map(([x,z])=>[(x-394)*metresPerPixel,(z-167)*metresPerPixel]);
export function inside(x,z,poly=boundary) { let hit=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a[1]>z)!=(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit; }
// Eight visible canopy centres, approximated from the full-space screenshot.
export const initialTrees = [[645,249,3.0],[647,365,3.0],[650,480,3.0],[652,594,3.1],[656,711,3.2],[660,825,3.0],[665,939,2.9],[674,1044,2.6]].map(([x,z,r],i)=>({id:`tree-${i+1}`,name:`Tree ${String(i+1).padStart(2,'0')}`,x:(x-394)*metresPerPixel,z:(z-167)*metresPerPixel,r,height:8}));
const stripTrace = [[550,157],[647,149],[682,1098],[634,1070],[592,1066],[567,1035]];
const stripScale = Math.sqrt(reference.treeStripArea/polygonArea(stripTrace));
export const treeStrip = stripTrace.map(([x,z])=>[boundary[1][0]+(x-647)*stripScale,boundary[1][1]+(z-149)*stripScale]);
