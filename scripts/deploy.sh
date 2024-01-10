#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
#set -e
cd /home/node/Passphrase-backend-main
pvalue=$(ps aux |grep yarn |grep -v grep |awk {'print $2'})
kill $pvalue
yarn install
nohup yarn start > /dev/null 2>&1 &
