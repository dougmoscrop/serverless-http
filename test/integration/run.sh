rm -rf node_modules
npm i
cp ../../serverless-http.js serverless-http.js
mkdir -p lib node_modules
cp -R ../../lib .
cp -R ../../node_modules .
node test.js
