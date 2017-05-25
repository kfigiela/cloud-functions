#!/bin/sh

docker run --rm -v `pwd`:/src kfigiela/amazon-linux-development-tools sh -c "yum install -y glibc-static && cd /src && cc -std=c99 -o $PROVIDER/bin/hello -static src/random.c src/miniz.c src/hello.c"
