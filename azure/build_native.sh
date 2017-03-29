#!/bin/sh

docker run --rm dockcross/windows-x64 > ./dockcross
chmod +x ./dockcross
mkdir -p functions/hello
./dockcross -- sh -c '$CC src/hello.c -o functions/hello/hello.exe'

