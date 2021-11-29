#!/bin/bash
rm -rf ./build
#npm install 
npm run build
cd ./build

#prod
aws s3 sync . s3://twilio-dialpad --profile services-dev-serverless
aws cloudfront create-invalidation --distribution-id E1WV1U6O2H2XPH --paths "/*" --profile services-dev-serverless


