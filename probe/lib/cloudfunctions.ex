defmodule Cloudfunctions do
  require Logger

  defmodule Client do
    use Tesla

    plug Tesla.Middleware.JSON
    plug Tesla.Middleware.Logger
    adapter Tesla.Adapter.Hackney
  end

  defmodule InfluxClient do
    use Tesla

    plug Tesla.Middleware.BasicAuth, username: System.get_env("INFLUX_USER"), password: System.get_env("INFLUX_PASSWORD")
    plug Tesla.Middleware.DebugLogger
    adapter Tesla.Adapter.Hackney

    def write(line) do
      post(System.get_env("INFLUX_WRITE_URL"), line)
    end
  end

  def main(_args) do
    Logger.info "Starting"
    # :hackney_pool.start_pool(:my_pool, [timeout: 5, max_connections: 10])
    Task.Supervisor.start_link(name: :requests)

    [
      fn -> probe_load()     end,
      fn -> probe_transfer() end
    ]
    |> Enum.map(&Task.async/1)
    |> Enum.map(fn t -> Task.await(t, 600_000) end)
  end

  def probe_load() do
    backends = [{:bluemix,[memory:  512               ], "https://openwhisk.ng.bluemix.net/api/v1/web/kfigiela_kfigiela/default/cloud-functions-research-dev-hello-512.json"},
                {:google, [memory: 1024, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_1024"},
                {:google, [memory: 1024, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_1024"},
                {:bluemix,[memory:  256               ], "https://openwhisk.ng.bluemix.net/api/v1/web/kfigiela_kfigiela/default/cloud-functions-research-dev-hello-256.json"},
                {:google, [memory: 2048, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_2048"},
                {:google, [memory: 2048, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_2048"},
                {:aws,    [memory: 1024               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-1024"},
                {:google, [memory:  256, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_256"},
                {:google, [memory:  256, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_256"},
                {:aws,    [memory:  256               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-256"},
                {:bluemix,[memory:  128               ], "https://openwhisk.ng.bluemix.net/api/v1/web/kfigiela_kfigiela/default/cloud-functions-research-dev-hello-128.json"},
                {:aws,    [memory:  128               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-128"},
                {:google, [memory:  128, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_128"},
                {:google, [memory:  128, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_128"},
                {:aws,    [memory:  512               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-512"},
                {:google, [memory:  512, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_512"},
                {:google, [memory:  512, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_512"},
                {:aws,    [memory: 1536               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-1536"},
                {:azure,  [                           ], "http://cloud-functions-research.azurewebsites.net/api/hello"}]

    backends
    |> Enum.map(fn {provider, tags, url} ->
      Task.Supervisor.async_nolink(:requests, fn ->
        try do
          Logger.info("Trying #{provider} #{inspect(tags)} #{url}")
          parsed = URI.parse(url)
          root_uri = %{parsed | path: ""}

          Client.get(root_uri |> to_string(), opts: [timeout: 120_000_000, connect_timeout: 30_000_000, recv_timeout: 120_000_000])

          {latency, _result} = :timer.tc(fn ->
            Client.get(root_uri |> to_string(), opts: [timeout: 120_000_000, connect_timeout: 30_000_000, recv_timeout: 120_000_000])
          end)

          {time, result} = :timer.tc(fn ->
            Client.get(url, opts: [timeout: 120_000_000, connect_timeout: 30_000_000, recv_timeout: 120_000_000])
          end)

          time_s = time / 1_000_000
          latency_s = latency / 1_000_000

          if is_map(result.body) do
            tags_str = tags
                        |> Keyword.put(:macAddr, String.trim(Map.get(result.body, "macAddr", "unknown")))
                        |> Keyword.put(:cpuModel, String.trim(Map.get(result.body, "cpuModel", "unknown")) |> String.replace(" ", "\\ ", global: true))
                        |> Keyword.put(:provider, provider)
                        |> Enum.reject(fn {k,v} -> is_nil(v) end)
                        |> Enum.map(fn
                          {k, v} when is_binary(v) -> "#{k}=\"#{v}\""
                          {k, v}                   -> "#{k}=#{v}"
                        end)
                        |> Enum.join(",")
            time_since_loaded = case Map.get(result.body, "time_since_loaded", nil) do
              nil -> nil
              [s, ns] -> s + ns / 1_000_000_000
            end
            case Map.get(result.body, "time", nil) do
              nil -> nil
              [time_internal_s, time_internal_ns] ->
                time_internal = time_internal_s + time_internal_ns / 1_000_000_000

                values_str = [value: time_internal, external: time_s, latency: latency_s, timeSinceBoot: time_since_loaded]
                          |> Enum.reject(fn {k,v} -> is_nil(v) end)
                          |> Enum.map(fn
                            {k, v} when is_binary(v) -> "#{k}=\"#{v}\""
                            {k, v}                   -> "#{k}=#{v}"
                          end)
                          |> Enum.join(",")
                ~s|experiment,#{tags_str} #{values_str}|
                |> InfluxClient.write()
            end
          else
            Logger.warn("Invalid response: #{result.body}")
          end
        rescue
          e in Tesla.Error ->
            Logger.error("Error: #{inspect(e)}")
        end
      end)
      |> Task.await(120000)
    end)
  end

  def probe_transfer() do
    backends = [{:aws,    [memory:  128, case: 1], "https://n1112vxae9.execute-api.eu-west-1.amazonaws.com/dev/hello-128"},
                {:aws,    [memory:  256, case: 1], "https://n1112vxae9.execute-api.eu-west-1.amazonaws.com/dev/hello-256"},
                {:aws,    [memory:  512, case: 1], "https://n1112vxae9.execute-api.eu-west-1.amazonaws.com/dev/hello-512"},
                {:aws,    [memory: 1024, case: 1], "https://n1112vxae9.execute-api.eu-west-1.amazonaws.com/dev/hello-1024"},
                {:aws,    [memory: 1536, case: 1], "https://n1112vxae9.execute-api.eu-west-1.amazonaws.com/dev/hello-1536"},
                {:google, [memory:  128, case: 1], "https://us-central1-serverless-random.cloudfunctions.net/hello_128"},
                {:google, [memory:  256, case: 1], "https://us-central1-serverless-random.cloudfunctions.net/hello_256"},
                {:google, [memory:  512, case: 1], "https://us-central1-serverless-random.cloudfunctions.net/hello_512"},
                {:google, [memory: 1024, case: 1], "https://us-central1-serverless-random.cloudfunctions.net/hello_1024"},
                {:google, [memory: 2048, case: 1], "https://us-central1-serverless-random.cloudfunctions.net/hello_2048"},
                {:aws,    [memory:  128, case: 2], "https://8ws7snw6dc.execute-api.eu-west-1.amazonaws.com/prod/transfer-128"},
                {:aws,    [memory:  256, case: 2], "https://8ws7snw6dc.execute-api.eu-west-1.amazonaws.com/prod/transfer-256"},
                {:aws,    [memory:  512, case: 2], "https://8ws7snw6dc.execute-api.eu-west-1.amazonaws.com/prod/transfer-512"},
                {:aws,    [memory: 1024, case: 2], "https://8ws7snw6dc.execute-api.eu-west-1.amazonaws.com/prod/transfer-1024"},
                {:aws,    [memory: 1536, case: 2], "https://8ws7snw6dc.execute-api.eu-west-1.amazonaws.com/prod/transfer-1536"},
                {:google, [memory:  128, case: 2], "https://us-central1-serverless-research-199315.cloudfunctions.net/transfer-128"},
                {:google, [memory:  256, case: 2], "https://us-central1-serverless-research-199315.cloudfunctions.net/transfer-256"},
                {:google, [memory:  512, case: 2], "https://us-central1-serverless-research-199315.cloudfunctions.net/transfer-512"},
                {:google, [memory: 1024, case: 2], "https://us-central1-serverless-research-199315.cloudfunctions.net/transfer-1024"},
                {:google, [memory: 2048, case: 2], "https://us-central1-serverless-research-199315.cloudfunctions.net/transfer-2048"}
                ]
    backends
    |> Enum.map(fn {provider, tags, url} ->
      Task.Supervisor.async_nolink(:requests, fn ->
        try do
          Logger.info("Trying #{provider} #{inspect(tags)} #{url}")
          parsed = URI.parse(url)
          root_uri = %{parsed | path: ""}

          Client.get(root_uri |> to_string(), opts: [timeout: 120_000_000, connect_timeout: 30_000_000, recv_timeout: 120_000_000])

          {latency, _result} = :timer.tc(fn ->
            Client.get(root_uri |> to_string(), opts: [timeout: 120_000_000, connect_timeout: 30_000_000, recv_timeout: 120_000_000])
          end)

          {time, result} = :timer.tc(fn ->
            Client.post(url, %{"fileName" => "64MB.dat", "contentLength" => 67108864}, opts: [timeout: 120_000_000, connect_timeout: 30_000_000, recv_timeout: 120_000_000])
          end)

          time_s = time / 1_000_000
          latency_s = latency / 1_000_000

          if is_map(result.body) do
            tags_str = tags
                        |> Keyword.put(:provider, provider)
                        |> Enum.reject(fn {k,v} -> is_nil(v) end)
                        |> Enum.map(fn
                          {k, v} when is_binary(v) -> "#{k}=\"#{v}\""
                          {k, v}                   -> "#{k}=#{v}"
                        end)
                        |> Enum.join(",")
            time_download = case get_in(result.body, ["time", "download"]) do
              nil ->
                Logger.warn("No download time")
                nil
              [time_internal_s, time_internal_ns] -> time_internal_s + time_internal_ns / 1_000_000_000
            end

            time_upload = case get_in(result.body, ["time", "upload"]) do
              nil ->
                Logger.warn("No upload time")
                nil
              [time_internal_s, time_internal_ns] -> time_internal_s + time_internal_ns / 1_000_000_000
            end

            values_str = [download: time_download, upload: time_upload]
                      |> Enum.reject(fn {k,v} -> is_nil(v) end)
                      |> Enum.map(fn
                        {k, v} when is_binary(v) -> "#{k}=\"#{v}\""
                        {k, v}                   -> "#{k}=#{v}"
                      end)
                      |> Enum.join(",")
            ~s|transfer,#{tags_str} #{values_str}|
            |> InfluxClient.write()
          else
            Logger.warn("Invalid response: #{result.body}")
          end
        rescue
          e in Tesla.Error ->
            Logger.error("Error: #{inspect(e)}")
        end
      end)
      |> Task.await(120000)
    end)
  end
end
