#!/bin/sh
set -e

sh -c "echo $* WEBPAGETEST_API_KEY=$WEBPAGETEST_API_KEY node ./index.js"
