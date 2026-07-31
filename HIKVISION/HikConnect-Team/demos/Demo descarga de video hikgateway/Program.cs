namespace HikGatewayVideoDownloader;

/// <summary>
/// Consola interactiva para buscar y descargar grabaciones vía Hik Device Gateway.
/// </summary>
internal static class Program
{
    public static async Task<int> Main()
    {
        ConsoleUi.Init();
        var config = AppConfig.Load();

        while (true)
        {
            ConsoleUi.Header("Hik Device Gateway — Videos", config);
            ConsoleUi.WriteMenu(
                ("1", "Configurar Gateway (host, usuario, password)"),
                ("2", "Carpeta de descarga"),
                ("3", "Buscar y descargar videos"),
                ("4", "Eliminar configuración guardada"),
                ("5", "Abrir carpeta de descargas"),
                ("0", "Salir"));

            var choice = ConsoleUi.ReadChoice(0, 5);

            switch (choice)
            {
                case 1:
                    ConfigureGateway(config);
                    break;
                case 2:
                    ConfigureDownloadFolder(config);
                    break;
                case 3:
                    await RunSearchAndDownloadAsync(config).ConfigureAwait(false);
                    break;
                case 4:
                    ClearConfiguration(ref config);
                    break;
                case 5:
                    OpenDownloadFolder(config);
                    break;
                case 0:
                    ConsoleUi.WriteLine();
                    ConsoleUi.Info("Hasta luego.");
                    return 0;
            }
        }
    }

    // -------------------------------------------------------------------------
    // Menú: configuración
    // -------------------------------------------------------------------------
    private static void ConfigureGateway(AppConfig config)
    {
        ConsoleUi.Header("Configurar Gateway", config);
        ConsoleUi.Section("Datos de conexión");

        config.GatewayHost = ConsoleUi.ReadLine("  Host (ej. http://127.0.0.1:80)", config.GatewayHost);
        config.Username = ConsoleUi.ReadLine("  Usuario", config.Username);

        ConsoleUi.WriteLine();
        ConsoleUi.Info("Password (Enter conserva el actual si ya existe):");
        var password = ConsoleUi.ReadPassword("  Password: ");
        if (!string.IsNullOrEmpty(password))
            config.Password = password;
        else if (string.IsNullOrEmpty(config.Password))
            ConsoleUi.Warn("No se cambió el password y sigue vacío.");

        ConsoleUi.WriteLine();
        var days = ConsoleUi.ReadLine("  Días de búsqueda por defecto", config.DefaultSearchDays.ToString());
        if (int.TryParse(days, out var d) && d > 0)
            config.DefaultSearchDays = d;

        var max = ConsoleUi.ReadLine("  Máximo de resultados por búsqueda", config.MaxResults.ToString());
        if (int.TryParse(max, out var m) && m > 0)
            config.MaxResults = m;

        config.Save();
        ConsoleUi.Success($"Configuración guardada en {AppConfig.FileName}");
        ConsoleUi.Pause();
    }

    private static void ConfigureDownloadFolder(AppConfig config)
    {
        ConsoleUi.Header("Carpeta de descarga", config);
        ConsoleUi.Section("Ubicación");

        ConsoleUi.Info($"Actual: {config.DownloadFolder}");
        ConsoleUi.WriteLine();
        var path = ConsoleUi.ReadLine("  Nueva carpeta (Enter conserva)", config.DownloadFolder);

        try
        {
            config.DownloadFolder = Path.GetFullPath(path);
            config.EnsureDownloadFolder();
            config.Save();
            ConsoleUi.Success($"Carpeta lista: {config.DownloadFolder}");
        }
        catch (Exception ex)
        {
            ConsoleUi.Error($"No se pudo crear/usar la carpeta: {ex.Message}");
        }

        ConsoleUi.Pause();
    }

    private static void ClearConfiguration(ref AppConfig config)
    {
        ConsoleUi.Header("Eliminar configuración", config);
        ConsoleUi.Section("Confirmación");
        ConsoleUi.Warn("Se borrará gateway-config.json (host, usuario, password y carpeta).");
        ConsoleUi.WriteLine();
        var confirm = ConsoleUi.ReadLine("  Escriba SI para confirmar", "no");

        if (!string.Equals(confirm, "SI", StringComparison.OrdinalIgnoreCase))
        {
            ConsoleUi.Info("Operación cancelada.");
            ConsoleUi.Pause();
            return;
        }

        AppConfig.Delete();
        config = new AppConfig();
        ConsoleUi.Success("Configuración eliminada.");
        ConsoleUi.Pause();
    }

    private static void OpenDownloadFolder(AppConfig config)
    {
        try
        {
            config.EnsureDownloadFolder();
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = config.DownloadFolder,
                UseShellExecute = true
            });
            ConsoleUi.Success($"Abierta: {config.DownloadFolder}");
        }
        catch (Exception ex)
        {
            ConsoleUi.Error(ex.Message);
        }

        ConsoleUi.Pause();
    }

    // -------------------------------------------------------------------------
    // Menú: búsqueda y descarga
    // -------------------------------------------------------------------------
    private static async Task RunSearchAndDownloadAsync(AppConfig config)
    {
        ConsoleUi.Header("Buscar y descargar videos", config);

        if (!config.IsConfigured)
        {
            ConsoleUi.Error("Configure primero el Gateway (opción 1 del menú).");
            ConsoleUi.Pause();
            return;
        }

        config.EnsureDownloadFolder();

        try
        {
            using var client = new GatewayClient(config.GatewayHost, config.Username, config.Password);

            // Dispositivos
            ConsoleUi.Section("Dispositivos");
            var devices = await client.GetDeviceListAsync().ConfigureAwait(false);
            if (devices.Count == 0)
            {
                ConsoleUi.Warn("No se encontraron dispositivos online.");
                ConsoleUi.Pause();
                return;
            }

            ConsoleUi.WriteLine();
            var device = ConsoleUi.PromptSelect(
                devices,
                d => $"{d.DevName}  |  {d.DevIndex}",
                "  Seleccione dispositivo: ");

            ConsoleUi.Success($"Seleccionado: {device.DevName}");

            // Capacidades / rango
            ConsoleUi.Section("Búsqueda");
            var searchTypes = await client.GetRecordSearchTypesAsync(device.DevIndex).ConfigureAwait(false);
            if (searchTypes.Count > 0)
                ConsoleUi.Info($"Tipos declarados: {string.Join(", ", searchTypes)}");
            else
                ConsoleUi.Info("Sin recordSearchType declarado; se usarán tipos habituales (AllEvent, etc.).");

            var (startTime, endTime) = PromptSearchRange(config.DefaultSearchDays);

            var recordings = await client
                .SearchRecordingsAsync(device.DevIndex, searchTypes, startTime, endTime, config.MaxResults)
                .ConfigureAwait(false);

            if (recordings.Count == 0)
            {
                ConsoleUi.Warn("No hay grabaciones para el rango indicado.");
                ConsoleUi.Info($"Consultado: {startTime} → {endTime}");
                ConsoleUi.Pause();
                return;
            }

            // Lista de videos
            ConsoleUi.Section("Grabaciones encontradas");
            ConsoleUi.WriteLine();
            var selected = ConsoleUi.PromptSelect(
                recordings,
                r =>
                {
                    var size = r.Size > 0 ? $"  ({r.Size / 1024.0 / 1024.0:F1} MB)" : string.Empty;
                    var name = string.IsNullOrWhiteSpace(r.Name) ? string.Empty : $"  ·  {r.Name}";
                    return $"{r.StartTime}  →  {r.EndTime}{size}{name}";
                },
                "  Seleccione video a descargar: ");

            // Descarga
            ConsoleUi.Section("Descarga");
            var outputPath = BuildOutputPath(config.DownloadFolder, selected);
            ConsoleUi.Info($"Destino: {outputPath}");
            ConsoleUi.WriteLine();

            await client.DownloadVideoAsync(device.DevIndex, selected, outputPath).ConfigureAwait(false);

            ConsoleUi.WriteLine();
            ConsoleUi.Success($"Descarga completada");
            ConsoleUi.Info(outputPath);
            InspectImkhHeader(outputPath);
        }
        catch (HttpRequestException ex)
        {
            ConsoleUi.Error($"Error HTTP: {ex.Message}");
        }
        catch (Exception ex)
        {
            ConsoleUi.Error($"Error: {ex.Message}");
        }

        ConsoleUi.Pause();
    }

    /// <summary>
    /// Selector visual del rango. Las fechas se interpretan en hora local: el inicio
    /// al comienzo del día y el fin al final del día, para que no se recorten
    /// grabaciones por el desplazamiento a UTC.
    /// </summary>
    private static (string Start, string End) PromptSearchRange(int defaultDays)
    {
        var today = DateTime.Now.Date;
        const int futureDays = 2;

        var presets = new List<(string Label, DateTime Start, DateTime End)>
        {
            ("Hoy", today, EndOfDay(today.AddDays(futureDays))),
            ("Últimas 24 horas", DateTime.Now.AddHours(-24), EndOfDay(today.AddDays(futureDays))),
            ("Últimos 7 días", today.AddDays(-7), EndOfDay(today.AddDays(futureDays))),
            ($"Últimos {defaultDays} días (configurado)", today.AddDays(-defaultDays), EndOfDay(today.AddDays(futureDays))),
            ("Últimos 90 días", today.AddDays(-90), EndOfDay(today.AddDays(futureDays))),
            ("Rango amplio: 1 año atrás + 7 días a futuro", today.AddYears(-1), EndOfDay(today.AddDays(7))),
            ("Personalizado (escribir fechas)", today, EndOfDay(today))
        };

        const int wideOption = 6;

        ConsoleUi.WriteLine();
        ConsoleUi.WriteLine("  Rango de búsqueda", ConsoleColor.Yellow);
        ConsoleUi.WriteLine();

        for (var i = 0; i < presets.Count; i++)
        {
            var (label, start, end) = presets[i];
            ConsoleUi.Write($"  [{i + 1}]  ", ConsoleColor.Cyan);
            ConsoleUi.Write(label.PadRight(44), ConsoleColor.White);

            if (i == presets.Count - 1)
                ConsoleUi.WriteLine();
            else
                ConsoleUi.WriteLine($"{start:dd/MM/yy HH:mm} → {end:dd/MM/yy HH:mm}", ConsoleColor.DarkGray);
        }

        ConsoleUi.WriteLine();
        ConsoleUi.Info($"Enter usa la opción {wideOption} (la más amplia; evita perder videos por zona horaria).");
        var choice = ConsoleUi.ReadChoice(1, presets.Count, "  Opción:", wideOption);

        DateTime localStart, localEnd;

        if (choice == presets.Count)
        {
            ConsoleUi.WriteLine();
            var startInput = ConsoleUi.ReadLine("  Inicio (yyyy-MM-dd)", today.AddDays(-defaultDays).ToString("yyyy-MM-dd"));
            var endInput = ConsoleUi.ReadLine("  Fin (yyyy-MM-dd)", today.ToString("yyyy-MM-dd"));

            localStart = DateTime.TryParse(startInput, out var ps) ? ps : today.AddDays(-defaultDays);
            localEnd = DateTime.TryParse(endInput, out var pe) ? pe : today;

            // Una fecha sin hora abarca el día completo.
            if (localEnd.TimeOfDay == TimeSpan.Zero)
                localEnd = EndOfDay(localEnd);
        }
        else
        {
            (_, localStart, localEnd) = presets[choice - 1];
        }

        var utcStart = localStart.ToUniversalTime();
        var utcEnd = localEnd.ToUniversalTime();

        ConsoleUi.WriteLine();
        ConsoleUi.Success($"Local: {localStart:dd/MM/yyyy HH:mm:ss} → {localEnd:dd/MM/yyyy HH:mm:ss}");
        ConsoleUi.Info($"UTC:   {utcStart:yyyy-MM-ddTHH:mm:ssZ} → {utcEnd:yyyy-MM-ddTHH:mm:ssZ}");

        return (
            utcStart.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            utcEnd.ToString("yyyy-MM-ddTHH:mm:ssZ"));
    }

    private static DateTime EndOfDay(DateTime date) => date.Date.AddDays(1).AddSeconds(-1);

    /// <summary>
    /// Nombre: {inicio}_a_{fin}_recuperado_{fechaHoraDescarga}.mp4
    /// Ejemplo: 20260731_181811_a_20260731_181847_recuperado_20260731_131520.mp4
    /// </summary>
    internal static string BuildOutputPath(string folder, RecordingItem recording)
    {
        var startStamp = FormatStamp(recording.StartTime);
        var endStamp = FormatStamp(recording.EndTime);
        var recoveredAt = DateTime.Now.ToString("yyyyMMdd_HHmmss");

        var fileName = $"{startStamp}_a_{endStamp}_recuperado_{recoveredAt}.mp4";
        return Path.Combine(folder, SanitizeFileName(fileName));
    }

    private static string FormatStamp(string iso)
    {
        if (GatewayClient.TryNormalizeIso(iso, out var normalized) &&
            DateTimeOffset.TryParse(normalized, out var dto))
        {
            return dto.UtcDateTime.ToString("yyyyMMdd_HHmmss");
        }

        var cleaned = new string(iso
            .Where(c => char.IsLetterOrDigit(c) || c is '_' or '-')
            .ToArray());

        return string.IsNullOrWhiteSpace(cleaned) ? "desconocido" : cleaned;
    }

    private static string SanitizeFileName(string name)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
            name = name.Replace(c, '_');
        return name;
    }

    private static void InspectImkhHeader(string filePath)
    {
        try
        {
            if (!File.Exists(filePath))
                return;

            var header = new byte[4];
            using var fs = File.OpenRead(filePath);
            var n = fs.Read(header, 0, 4);
            if (n == 4 &&
                header[0] == (byte)'I' &&
                header[1] == (byte)'M' &&
                header[2] == (byte)'K' &&
                header[3] == (byte)'H')
            {
                ConsoleUi.Info("Cabecera IMKH detectada (contenedor propietario Hikvision).");
                ConsoleUi.Info("Puede requerir FFmpeg (-c copy) o Player SDK (PlayCtrl.dll) según cifrado.");
            }
            else if (n == 4)
            {
                ConsoleUi.Info(
                    $"Cabecera: {header[0]:X2} {header[1]:X2} {header[2]:X2} {header[3]:X2}");
            }
        }
        catch (Exception ex)
        {
            ConsoleUi.Warn($"No se pudo inspeccionar la cabecera: {ex.Message}");
        }
    }
}
