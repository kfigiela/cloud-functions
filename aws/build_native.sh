#!/bin/sh

docker run --rm -v `pwd`:/src kfigiela/amazon-linux-development-tools sh -c "yum install -y glibc-static && cd /src && cc -o bin/hello -static src/hello.c"
