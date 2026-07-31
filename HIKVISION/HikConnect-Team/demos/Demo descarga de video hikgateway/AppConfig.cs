using System.Text.Json;
using System.Text.Json.Serialization;

namespace HikGatewayVideoDownloader;

/// <summary>Configuración persistente del Gateway y de la aplicación.</summary>
internal sealed class AppConfig
{
    public const string FileName = "gateway-config.json";

    [JsonPropertyName("gatewayHost")]
    public string GatewayHost { get; set; } = "";

    [JsonPropertyName("username")]
    public string Username { get; set; } = "";

    [JsonPropertyName("password")]
    public string Password { get; set; } = "";

    [JsonPropertyName("downloadFolder")]
    public string DownloadFolder { get; set; } = "descargas";

    [JsonPropertyName("maxResults")]
    public int MaxResults { get; set; } = 5;

    [JsonPropertyName("defaultSearchDays")]
    public int DefaultSearchDays { get; set; } = 30;

    /// <summary>Ruta efectiva del JSON (cwd del proceso o carpeta del ejecutable).</summary>
    [JsonIgnore]
    public static string FilePath
    {
        get
        {
            var cwd = Path.Combine(Directory.GetCurrentDirectory(), FileName);
            if (File.Exists(cwd))
                return cwd;

            return Path.Combine(AppContext.BaseDirectory, FileName);
        }
    }

    [JsonIgnore]
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(GatewayHost) &&
        !string.IsNullOrWhiteSpace(Username) &&
        !string.IsNullOrWhiteSpace(Password);

    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true
    };

    public static AppConfig Load()
    {
        try
        {
            var path = FilePath;
            if (!File.Exists(path))
                return new AppConfig();

            var json = File.ReadAllText(path);
            var config = JsonSerializer.Deserialize<AppConfig>(json, Options) ?? new AppConfig();
            config.NormalizePaths(Path.GetDirectoryName(path)!);
            return config;
        }
        catch
        {
            return new AppConfig();
        }
    }

    public void Save()
    {
        GatewayHost = GatewayHost.Trim().TrimEnd('/');
        if (MaxResults < 1) MaxResults = 1;
        if (MaxResults > 40) MaxResults = 40;
        if (DefaultSearchDays < 1) DefaultSearchDays = 1;

        // Preferimos guardar junto al cwd (carpeta del proyecto al usar dotnet run).
        var path = Path.Combine(Directory.GetCurrentDirectory(), FileName);
        NormalizePaths(Directory.GetCurrentDirectory());

        // En el JSON guardamos la carpeta relativa si está bajo el cwd.
        var toSerialize = CloneForDisk();
        File.WriteAllText(path, JsonSerializer.Serialize(toSerialize, Options));
    }

    public static void Delete()
    {
        var cwd = Path.Combine(Directory.GetCurrentDirectory(), FileName);
        if (File.Exists(cwd))
            File.Delete(cwd);

        var basePath = Path.Combine(AppContext.BaseDirectory, FileName);
        if (File.Exists(basePath))
            File.Delete(basePath);
    }

    public void EnsureDownloadFolder()
    {
        Directory.CreateDirectory(DownloadFolder);
    }

    private void NormalizePaths(string baseDir)
    {
        if (string.IsNullOrWhiteSpace(DownloadFolder))
            DownloadFolder = Path.Combine(baseDir, "descargas");
        else if (!Path.IsPathRooted(DownloadFolder))
            DownloadFolder = Path.GetFullPath(Path.Combine(baseDir, DownloadFolder));
        else
            DownloadFolder = Path.GetFullPath(DownloadFolder);
    }

    private AppConfig CloneForDisk()
    {
        var cwd = Directory.GetCurrentDirectory();
        var folder = DownloadFolder;
        try
        {
            var fullCwd = Path.GetFullPath(cwd);
            var fullFolder = Path.GetFullPath(DownloadFolder);
            if (fullFolder.StartsWith(fullCwd, StringComparison.OrdinalIgnoreCase))
                folder = Path.GetRelativePath(fullCwd, fullFolder);
        }
        catch
        {
            // conservar absoluto
        }

        return new AppConfig
        {
            GatewayHost = GatewayHost,
            Username = Username,
            Password = Password,
            DownloadFolder = folder,
            MaxResults = MaxResults,
            DefaultSearchDays = DefaultSearchDays
        };
    }
}
