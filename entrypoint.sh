#!/bin/sh
set -e

sh -c "TEST_URL=$TEST_URL WEBPAGETEST_API_KEY=$WEBPAGETEST_API_KEY node ./index.js $*"
