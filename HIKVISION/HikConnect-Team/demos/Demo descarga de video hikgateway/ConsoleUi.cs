using System.Text;

namespace HikGatewayVideoDownloader;

/// <summary>Ayudas visuales para la consola (secciones, colores, menús).</summary>
internal static class ConsoleUi
{
    private const int Width = 72;

    public static void Init()
    {
        try
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.InputEncoding = Encoding.UTF8;
            Console.Title = "Hik Device Gateway — Videos";
        }
        catch
        {
            // Algunos hosts de consola no permiten cambiar encoding/título.
        }
    }

    public static void Clear() => Console.Clear();

    public static void Header(string title, AppConfig? config = null)
    {
        Clear();
        WriteLine(new string('═', Width), ConsoleColor.DarkCyan);
        WriteCentered(title, ConsoleColor.Cyan);
        WriteLine(new string('═', Width), ConsoleColor.DarkCyan);

        if (config is not null)
        {
            WriteLine();
            WriteLabel("  Host      ", MaskOrValue(config.GatewayHost));
            WriteLabel("  Usuario   ", string.IsNullOrWhiteSpace(config.Username) ? "(sin configurar)" : config.Username);
            WriteLabel("  Password  ", string.IsNullOrEmpty(config.Password) ? "(sin configurar)" : "********");
            WriteLabel("  Descargas ", config.DownloadFolder);
            WriteLine(new string('─', Width), ConsoleColor.DarkGray);
        }

        WriteLine();
    }

    public static void Section(string title)
    {
        WriteLine();
        WriteLine($"── {title} ", ConsoleColor.Yellow);
        WriteLine(new string('─', Width), ConsoleColor.DarkGray);
    }

    public static void Success(string message) => WriteLine($"  ✓  {message}", ConsoleColor.Green);

    public static void Warn(string message) => WriteLine($"  !  {message}", ConsoleColor.Yellow);

    public static void Error(string message) => WriteLine($"  ✗  {message}", ConsoleColor.Red);

    public static void Info(string message) => WriteLine($"     {message}", ConsoleColor.Gray);

    public static void Pause(string message = "Presione Enter para continuar...")
    {
        WriteLine();
        Write(message, ConsoleColor.DarkGray);
        Console.ReadLine();
    }

    public static string ReadLine(string prompt, string? defaultValue = null)
    {
        if (defaultValue is null)
            Write(prompt, ConsoleColor.White);
        else
            Write($"{prompt} [{defaultValue}]: ", ConsoleColor.White);

        var line = Console.ReadLine()?.Trim() ?? string.Empty;
        return string.IsNullOrEmpty(line) && defaultValue is not null ? defaultValue : line;
    }

    public static string ReadPassword(string prompt)
    {
        Write(prompt, ConsoleColor.White);
        var sb = new StringBuilder();
        while (true)
        {
            var key = Console.ReadKey(intercept: true);
            if (key.Key == ConsoleKey.Enter)
            {
                Console.WriteLine();
                break;
            }

            if (key.Key == ConsoleKey.Backspace)
            {
                if (sb.Length > 0)
                {
                    sb.Length--;
                    Console.Write("\b \b");
                }

                continue;
            }

            if (!char.IsControl(key.KeyChar))
            {
                sb.Append(key.KeyChar);
                Console.Write('*');
            }
        }

        return sb.ToString();
    }

    public static int ReadChoice(int min, int max, string prompt = "  Opción: ", int? defaultValue = null)
    {
        while (true)
        {
            Write(defaultValue is null ? prompt : $"{prompt.TrimEnd()} [{defaultValue}]: ", ConsoleColor.White);
            var line = Console.ReadLine();

            if (string.IsNullOrWhiteSpace(line) && defaultValue is not null)
                return defaultValue.Value;

            if (int.TryParse(line, out var n) && n >= min && n <= max)
                return n;

            Warn($"Digite un número entre {min} y {max}.");
        }
    }

    public static T PromptSelect<T>(IReadOnlyList<T> items, Func<T, string> formatter, string prompt)
    {
        for (var i = 0; i < items.Count; i++)
            WriteLine($"  [{i + 1}]  {formatter(items[i])}", ConsoleColor.White);

        WriteLine();
        var index = ReadChoice(1, items.Count, prompt);
        return items[index - 1];
    }

    public static void WriteMenu(params (string Key, string Label)[] options)
    {
        foreach (var (key, label) in options)
        {
            Write($"  [{key}]  ", ConsoleColor.Cyan);
            WriteLine(label, ConsoleColor.White);
        }

        WriteLine();
    }

    public static void WriteProgress(string text)
    {
        Console.Write($"\r  →  {text}   ");
    }

    public static void WriteLine(string text = "", ConsoleColor? color = null)
    {
        if (color is null)
        {
            Console.WriteLine(text);
            return;
        }

        var previous = Console.ForegroundColor;
        Console.ForegroundColor = color.Value;
        Console.WriteLine(text);
        Console.ForegroundColor = previous;
    }

    public static void Write(string text, ConsoleColor color)
    {
        var previous = Console.ForegroundColor;
        Console.ForegroundColor = color;
        Console.Write(text);
        Console.ForegroundColor = previous;
    }

    private static void WriteCentered(string text, ConsoleColor color)
    {
        var pad = Math.Max(0, (Width - text.Length) / 2);
        WriteLine(new string(' ', pad) + text, color);
    }

    private static void WriteLabel(string label, string value)
    {
        Write(label, ConsoleColor.DarkGray);
        WriteLine(value, ConsoleColor.White);
    }

    private static string MaskOrValue(string value) =>
        string.IsNullOrWhiteSpace(value) ? "(sin configurar)" : value;
}
