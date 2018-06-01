# Cloudfunctions

Probe is ready to be run in docker. Uses `elixir:1.4` image as runtime.

Make run.sh/build.sh from templates.

Running probe:
```shell
docker run --rm -v $REPO_PATH/probe:/src elixir:1.4 /src/run.sh
```

Run with cron:
```
*/5 * * * * docker run --rm -v $REPO_PATH/probe:/src elixir:1.4 /src/run.sh
````


Building probe (into escript binary):
```shell
docker run --rm -v $REPO_PATH/probe:/src elixir:1.4 /src/build.sh
```

