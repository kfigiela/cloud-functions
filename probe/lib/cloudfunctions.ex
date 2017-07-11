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
    backends = [{:bluemix,[memory:  512               ], "https://42273934-3113-4915-b9bd-5dd4e2cb007c-gws.api-gw.mybluemix.net/cloud-functions-research/hello-512"},
                {:google, [memory: 1024, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_1024"},
                {:google, [memory: 1024, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_1024"},
                {:bluemix,[memory:  256               ], "https://42273934-3113-4915-b9bd-5dd4e2cb007c-gws.api-gw.mybluemix.net/cloud-functions-research/hello-256"},
                {:google, [memory: 2048, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_2048"},
                {:google, [memory: 2048, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_2048"},
                {:aws,    [memory: 1024               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-1024"},
                {:google, [memory:  256, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_256"},
                {:google, [memory:  256, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_256"},
                {:aws,    [memory:  256               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-256"},
                {:bluemix,[memory:  128               ], "https://42273934-3113-4915-b9bd-5dd4e2cb007c-gws.api-gw.mybluemix.net/cloud-functions-research/hello-128"},
                {:aws,    [memory:  128               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-128"},
                {:google, [memory:  128, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_128"},
                {:google, [memory:  128, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_128"},
                {:aws,    [memory:  512               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-512"},
                {:google, [memory:  512, deployment: 1], "https://us-central1-ninth-potion-161615.cloudfunctions.net/hello_512"},
                {:google, [memory:  512, deployment: 2], "https://us-central1-cloud-functions-2-168708.cloudfunctions.net/hello_512"},
                {:aws,    [memory: 1536               ], "https://bv4odbjim8.execute-api.eu-west-1.amazonaws.com/dev/hello-1536"},
                {:azure,  [                           ], "https://cloud-functions-research.azurewebsites.net/api/hello"}]

    # try do
    #   Client.get("https://example.com", opts: [timeout: 120_000_000, connect_timeout: 30_000_000, recv_timeout: 120_000_000, pool: :my_pool])
    # rescue
    #   e in Error -> Logger.error("FUCK")
    # end
    #

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

          tags_str = tags
                  |> Keyword.put(:provider, provider)
                  |> Enum.map(fn {k, v} -> "#{k}=#{v}" end)
                  |> Enum.join(",")
          if is_map(result.body) do
            case Map.get(result.body, "time", nil) do
              nil -> nil
              [time_internal_s, time_internal_ns] ->
                time_internal = time_internal_s + time_internal_ns / 1_000_000_000
                ~s|experiment,#{tags_str} value=#{time_internal},external=#{time_s},latency=#{latency_s}|
                |> InfluxClient.write()
            end
          else
            Logger.warn("Invalid response: #{result.body}")
          end
        rescue
          e in Error ->
            Logger.error("Error: #{inspect(e)}")
        end
      end)
      |> Task.await(120000)
    end)
  end
end
