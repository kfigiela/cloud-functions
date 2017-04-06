#!/bin/sh

docker run --rm -v `pwd`:/src kfigiela/amazon-linux-development-tools sh -c "yum install -y glibc-static && cd /src && cc -o $PROVIDER/bin/hello -std=c99 -static src/random.c src/miniz.c src/hello.c"
