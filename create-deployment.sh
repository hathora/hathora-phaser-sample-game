#!/bin/sh

cd server
tar --exclude="node_modules" -czvf ../deploy.tgz .
cd ..