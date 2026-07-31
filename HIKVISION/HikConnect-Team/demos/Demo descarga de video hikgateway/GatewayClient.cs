using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Xml.Linq;

namespace HikGatewayVideoDownloader;

internal sealed record GatewayDevice(string DevName, string DevIndex);

internal sealed record RecordingItem(
    string StartTime,
    string EndTime,
    string PlaybackUri,
    long Size,
    string? Name);

/// <summary>Cliente ISAPI del Hik Device Gateway (Digest + JSON).</summary>
internal sealed class GatewayClient : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = false
    };

    private readonly HttpClient _http;

    public GatewayClient(string host, string username, string password)
    {
        var baseUri = new Uri(host.EndsWith('/') ? host : host + "/");
        var credentialCache = new CredentialCache();
        credentialCache.Add(
            new Uri(baseUri.GetLeftPart(UriPartial.Authority)),
            "Digest",
            new NetworkCredential(username, password));

        var handler = new HttpClientHandler
        {
            Credentials = credentialCache,
            PreAuthenticate = false,
            AllowAutoRedirect = true,
            UseCookies = true
        };

        _http = new HttpClient(handler)
        {
            BaseAddress = baseUri,
            Timeout = TimeSpan.FromMinutes(30)
        };

        _http.DefaultRequestHeaders.Accept.Clear();
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("*/*"));
    }

    public void Dispose() => _http.Dispose();

    public async Task<List<GatewayDevice>> GetDeviceListAsync()
    {
        const string path = "/ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json";
        var searchPayload = new
        {
            SearchDescription = new
            {
                position = 0,
                maxResult = 100,
                Filter = new
                {
                    key = "",
                    devType = "",
                    protocolType = new[] { "ehomeV5" },
                    devStatus = new[] { "online" }
                }
            }
        };

        ConsoleUi.Info($"POST {path}");
        var (ok, body) = await SendForBodyAsync(HttpMethod.Post, path, searchPayload).ConfigureAwait(false);

        if (!ok)
        {
            ConsoleUi.Warn($"POST rechazado: {Truncate(body, 160)}");
            ConsoleUi.Info($"GET {path}");
            (ok, body) = await SendForBodyAsync(HttpMethod.Get, path, null).ConfigureAwait(false);
        }

        if (!ok)
            throw new HttpRequestException($"deviceList falló. Cuerpo: {Truncate(body, 600)}");

        return ParseDevices(body);
    }

    public async Task<List<string>> GetRecordSearchTypesAsync(string devIndex)
    {
        var path = $"/ISAPI/System/capabilities?devIndex={Uri.EscapeDataString(devIndex)}";
        ConsoleUi.Info($"GET {path}");

        var (ok, body) = await SendForBodyAsync(HttpMethod.Get, path, null).ConfigureAwait(false);
        if (!ok)
            return [];

        try
        {
            var doc = XDocument.Parse(body);
            var node = doc.Descendants().FirstOrDefault(e => e.Name.LocalName == "recordSearchType");
            var opt = node?.Attribute("opt")?.Value;
            if (string.IsNullOrWhiteSpace(opt))
                return [];

            return opt.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
        }
        catch
        {
            return [];
        }
    }

    public async Task<List<RecordingItem>> SearchRecordingsAsync(
        string devIndex,
        IReadOnlyList<string> searchTypes,
        string startTime,
        string endTime,
        int maxResults)
    {
        var path = $"/ISAPI/ContentMgmt/search?format=json&devIndex={Uri.EscapeDataString(devIndex)}";
        var trackId = await DiscoverTrackIdAsync(devIndex).ConfigureAwait(false);
        var searchId = Guid.NewGuid().ToString().ToUpperInvariant();

        ConsoleUi.Info($"Rango: {startTime} → {endTime}  |  trackID {trackId}");

        string? successBody = null;
        foreach (var (label, payload) in BuildSearchVariants(searchId, trackId, searchTypes, startTime, endTime, maxResults))
        {
            ConsoleUi.Info($"POST search  [{label}]");
            var (ok, body) = await SendForBodyAsync(HttpMethod.Post, path, payload).ConfigureAwait(false);
            if (ok)
            {
                ConsoleUi.Success($"Variante aceptada: {label}");
                successBody = body;
                break;
            }

            ConsoleUi.Warn($"Rechazada: {Truncate(body, 140)}");
        }

        if (successBody is null)
            throw new HttpRequestException("search falló con todas las variantes de CMSearchDescription.");

        return ParseRecordings(successBody);
    }

    public async Task DownloadVideoAsync(string devIndex, RecordingItem recording, string outputPath)
    {
        var candidates = new List<(string Label, string Uri)>
        {
            ("por archivo (playbackURI)", recording.PlaybackUri)
        };

        var byTimeUrl = await GetPlaybackStreamUrlAsync(devIndex, recording).ConfigureAwait(false);
        if (!string.IsNullOrWhiteSpace(byTimeUrl) &&
            !string.Equals(byTimeUrl, recording.PlaybackUri, StringComparison.Ordinal))
        {
            candidates.Add(("por tiempo (streamMedia)", byTimeUrl));
        }

        foreach (var (label, uri) in candidates)
        {
            ConsoleUi.Info($"Intentando descarga {label}...");
            var bytes = await TryDownloadAsync(devIndex, uri, outputPath, recording.Size).ConfigureAwait(false);
            if (bytes > 0)
                return;
        }

        if (File.Exists(outputPath) && new FileInfo(outputPath).Length == 0)
            File.Delete(outputPath);

        throw new HttpRequestException(
            "El Gateway no entregó datos de video. La búsqueda funciona, pero el flujo de media no respondió.");
    }

    private async Task<long> TryDownloadAsync(
        string devIndex,
        string playbackUri,
        string outputPath,
        long expectedSize)
    {
        var path = $"/ISAPI/ContentMgmt/download?format=json&devIndex={Uri.EscapeDataString(devIndex)}";
        ConsoleUi.Info($"POST {path}");
        ConsoleUi.Info($"Archivo: {outputPath}");

        var downloadPayload = new { downloadRequest = new { playbackURI = playbackUri } };
        var json = JsonSerializer.Serialize(downloadPayload, JsonOptions);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        using var request = new HttpRequestMessage(HttpMethod.Post, path) { Content = content };
        request.Headers.Accept.Clear();
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/octet-stream"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("*/*"));

        try
        {
            using var response = await _http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead)
                .ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var errBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                var hint = response.StatusCode == HttpStatusCode.BadGateway
                    ? " (proxy cortó la espera)"
                    : string.Empty;
                ConsoleUi.Warn($"Falló {(int)response.StatusCode}{hint}: {Truncate(errBody, 160)}");
                return 0;
            }

            await using var networkStream = await response.Content.ReadAsStreamAsync().ConfigureAwait(false);
            await using var fileStream = new FileStream(
                outputPath, FileMode.Create, FileAccess.Write, FileShare.None, 81920, useAsync: true);

            var announced = response.Content.Headers.ContentLength ?? expectedSize;
            var buffer = new byte[81920];
            long total = 0;
            var truncated = false;

            try
            {
                int read;
                var lastReport = DateTime.UtcNow;
                while ((read = await networkStream.ReadAsync(buffer.AsMemory(0, buffer.Length)).ConfigureAwait(false)) > 0)
                {
                    await fileStream.WriteAsync(buffer.AsMemory(0, read)).ConfigureAwait(false);
                    total += read;
                    if ((DateTime.UtcNow - lastReport).TotalSeconds >= 1)
                    {
                        ConsoleUi.WriteProgress($"Descargados: {FormatProgress(total, announced)}");
                        lastReport = DateTime.UtcNow;
                    }
                }
            }
            catch (IOException) when (total > 0)
            {
                truncated = true;
            }

            Console.WriteLine();
            ConsoleUi.Info($"Descargados: {FormatProgress(total, announced)}");

            if (total == 0)
            {
                ConsoleUi.Warn("El Gateway respondió 200 pero sin datos de video.");
                return 0;
            }

            if (truncated || (announced > 0 && total < announced))
            {
                ConsoleUi.Warn(
                    $"El Gateway cerró el envío en {total} de {announced} bytes anunciados; el archivo es utilizable.");
            }

            return total;
        }
        catch (TaskCanceledException)
        {
            ConsoleUi.Warn("Tiempo de espera agotado sin recibir datos.");
            return 0;
        }
    }

    private async Task<string?> GetPlaybackStreamUrlAsync(string devIndex, RecordingItem recording)
    {
        if (!TryNormalizeIso(recording.StartTime, out var start) ||
            !TryNormalizeIso(recording.EndTime, out var end))
            return null;

        var path = $"/ISAPI/System/streamMedia?format=json&devIndex={Uri.EscapeDataString(devIndex)}";
        var payload = new
        {
            StreamInfo = new
            {
                id = "1",
                streamType = "main",
                method = "playback",
                PlayBackParams = new { startTime = start, endTime = end }
            }
        };

        ConsoleUi.Info($"POST {path}");
        var (ok, body) = await SendForBodyAsync(HttpMethod.Post, path, payload).ConfigureAwait(false);
        if (!ok)
            return null;

        try
        {
            using var doc = JsonDocument.Parse(body);
            if (TryGetProperty(doc.RootElement, "MediaAccessInfo", out var info))
                return GetString(info, "URL");
        }
        catch (JsonException)
        {
            // ignore
        }

        return null;
    }

    private async Task<int> DiscoverTrackIdAsync(string devIndex)
    {
        const int fallback = 101;
        var path = $"/ISAPI/ContentMgmt/record/tracks?format=json&devIndex={Uri.EscapeDataString(devIndex)}";

        try
        {
            var (ok, body) = await SendForBodyAsync(HttpMethod.Get, path, null).ConfigureAwait(false);
            if (!ok)
                return fallback;

            using var doc = JsonDocument.Parse(body);
            var found = FindFirstTrackId(doc.RootElement);
            if (found.HasValue)
            {
                ConsoleUi.Info($"trackID descubierto: {found.Value}");
                return found.Value;
            }
        }
        catch
        {
            // fallback
        }

        return fallback;

        static int? FindFirstTrackId(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    var raw = GetString(element, "id") ?? GetString(element, "trackID");
                    if (int.TryParse(raw, out var parsed) && parsed >= 100)
                        return parsed;
                    foreach (var prop in element.EnumerateObject())
                    {
                        var nested = FindFirstTrackId(prop.Value);
                        if (nested.HasValue) return nested;
                    }
                    break;
                case JsonValueKind.Array:
                    foreach (var item in element.EnumerateArray())
                    {
                        var nested = FindFirstTrackId(item);
                        if (nested.HasValue) return nested;
                    }
                    break;
            }

            return null;
        }
    }

    private static List<(string Label, object Payload)> BuildSearchVariants(
        string searchId,
        int trackId,
        IReadOnlyList<string> searchTypes,
        string startTime,
        string endTime,
        int maxResults)
    {
        var descriptors = new List<string> { "recordType.meta.hikvision.com/AllEvent" };
        descriptors.AddRange(searchTypes
            .Select(t => $"recordType.meta.hikvision.com/{t}")
            .Where(d => !descriptors.Contains(d)));
        descriptors.Add("recordType.meta.std-cgi.com");

        return descriptors
            .Distinct()
            .Select(d => (d, (object)new
            {
                CMSearchDescription = new
                {
                    searchID = searchId,
                    trackIDList = new[] { new { trackID = trackId } },
                    timeSpanList = new[]
                    {
                        new { timeSpan = new { startTime, endTime } }
                    },
                    contentTypeList = new[] { new { contentType = "video" } },
                    maxResults,
                    searchResultPostion = 0,
                    metadataList = new[] { new { metadataDescriptor = d } }
                }
            }))
            .ToList();
    }

    private async Task<(bool Ok, string Body)> SendForBodyAsync(HttpMethod method, string path, object? payload)
    {
        using var request = new HttpRequestMessage(method, path);
        if (payload is not null)
        {
            var json = JsonSerializer.Serialize(payload, JsonOptions);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
        }

        using var response = await _http.SendAsync(request).ConfigureAwait(false);
        var body = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
        return (response.IsSuccessStatusCode, body);
    }

    private static List<GatewayDevice> ParseDevices(string body)
    {
        var devices = new List<GatewayDevice>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        using var doc = JsonDocument.Parse(body);
        Walk(doc.RootElement);
        return devices;

        void Walk(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    var index = GetString(element, "devIndex") ?? GetString(element, "deviceIndex");
                    if (!string.IsNullOrWhiteSpace(index) && seen.Add(index))
                    {
                        var name = GetString(element, "devName")
                                   ?? GetString(element, "deviceName")
                                   ?? GetString(element, "name")
                                   ?? "(sin nombre)";
                        var status = GetString(element, "devStatus");
                        devices.Add(new GatewayDevice(
                            status is null ? name : $"{name} [{status}]",
                            index));
                    }

                    foreach (var prop in element.EnumerateObject())
                        Walk(prop.Value);
                    break;
                case JsonValueKind.Array:
                    foreach (var item in element.EnumerateArray())
                        Walk(item);
                    break;
            }
        }
    }

    private static List<RecordingItem> ParseRecordings(string body)
    {
        var recordings = new List<RecordingItem>();
        var seen = new HashSet<string>(StringComparer.Ordinal);
        using var doc = JsonDocument.Parse(body);
        Walk(doc.RootElement, null, null);
        return recordings;

        void Walk(JsonElement element, string? start, string? end)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    if (TryGetProperty(element, "timeSpan", out var span) && span.ValueKind == JsonValueKind.Object)
                    {
                        start = GetString(span, "startTime") ?? start;
                        end = GetString(span, "endTime") ?? end;
                    }

                    start = GetString(element, "startTime") ?? start;
                    end = GetString(element, "endTime") ?? end;

                    var uri = GetString(element, "playbackURI");
                    if (!string.IsNullOrWhiteSpace(uri) && seen.Add(uri))
                    {
                        long.TryParse(GetString(element, "size"), out var size);
                        recordings.Add(new RecordingItem(
                            start ?? "(desconocido)",
                            end ?? "(desconocido)",
                            uri,
                            size,
                            GetString(element, "name")));
                    }

                    foreach (var prop in element.EnumerateObject())
                        Walk(prop.Value, start, end);
                    break;
                case JsonValueKind.Array:
                    foreach (var item in element.EnumerateArray())
                        Walk(item, start, end);
                    break;
            }
        }
    }

    internal static bool TryNormalizeIso(string value, out string normalized)
    {
        normalized = string.Empty;
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var candidate = System.Text.RegularExpressions.Regex.Replace(
            value, @"([+-])(\d):(\d{2})$", "$10$2:$3");

        if (!DateTimeOffset.TryParse(candidate, out var parsed))
            return false;

        normalized = parsed.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");
        return true;
    }

    private static bool TryGetProperty(JsonElement element, string name, out JsonElement value)
    {
        if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out value))
            return true;

        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var prop in element.EnumerateObject())
            {
                if (string.Equals(prop.Name, name, StringComparison.OrdinalIgnoreCase))
                {
                    value = prop.Value;
                    return true;
                }
            }
        }

        value = default;
        return false;
    }

    private static string? GetString(JsonElement element, string name)
    {
        if (!TryGetProperty(element, name, out var value))
            return null;

        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number => value.ToString(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => value.ToString()
        };
    }

    private static string FormatProgress(long total, long announced)
    {
        var mb = $"{total / 1024.0 / 1024.0:F2} MB";
        return announced <= 0
            ? mb
            : $"{mb} de {announced / 1024.0 / 1024.0:F2} MB ({total * 100.0 / announced:F1} %)";
    }

    private static string Truncate(string text, int max) =>
        string.IsNullOrEmpty(text) ? string.Empty
        : text.Length <= max ? text
        : text[..max] + "...";
}
