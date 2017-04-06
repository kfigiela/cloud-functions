#!/bin/sh

docker run --rm dockcross/windows-x64 > ./dockcross
chmod +x ./dockcross
mkdir -p functions/hello
./dockcross -- sh -c '$CC -std=c99 src/random.c src/miniz.c src/hello.c  -o $PROVIDER/functions/hello/hello.exe'

