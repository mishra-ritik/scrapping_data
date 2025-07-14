const apiToken = 'sqp_5e9f34f3e3dfbebea7ff5e325cf49280b2501a80';
const encoded = Buffer.from(`${apiToken}:`, 'utf8').toString('base64');
console.log(encoded); 



// const api_token = 'sqa_5c3d0850ebbeeb20e1e940a43c7bec045ddeb48d';
// const encoded = btoa(`${api_token}:`);
// console.log(encoded);