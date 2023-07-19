#!/bin/sh

tar --exclude="node_modules" -czvf ./deploy.tgz Dockerfile server common