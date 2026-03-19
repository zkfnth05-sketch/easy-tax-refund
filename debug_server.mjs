import http from 'http';
http.get('http://localhost:9002/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data.substring(0, 1000));
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
