<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();

            // Inline script to apply stored or default primary brand color (#FF7900)
            (function() {
                const defaultColor = '#FF7900';
                let color = defaultColor;
                try {
                    const stored = localStorage.getItem('app_primary_color');
                    if (stored && /^#([0-9a-fA-F]{3}){1,2}$/.test(stored)) {
                        color = stored;
                    }
                } catch (e) {}

                function hexToRgb(h) {
                    let c = h.replace('#', '');
                    if (c.length === 3) c = c.split('').map(function(x) { return x + x; }).join('');
                    var n = parseInt(c, 16);
                    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
                }

                function adjust(h, pct) {
                    var rgb = hexToRgb(h);
                    var adj = function(v) { return Math.max(0, Math.min(255, Math.round(v + (pct / 100) * 255))); };
                    var toHex = function(v) { return v.toString(16).padStart(2, '0'); };
                    return '#' + toHex(adj(rgb.r)) + toHex(adj(rgb.g)) + toHex(adj(rgb.b));
                }

                var rgb = hexToRgb(color);
                var hover = adjust(color, -14);
                var light = adjust(color, 20);

                var root = document.documentElement;
                root.style.setProperty('--primary', color);
                root.style.setProperty('--color-primary', color);
                root.style.setProperty('--color-vuexy-primary', color);
                root.style.setProperty('--primary-hover', hover);
                root.style.setProperty('--primary-light', light);
                root.style.setProperty('--primary-rgb', rgb.r + ', ' + rgb.g + ', ' + rgb.b);
                root.style.setProperty('--ring', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.4)');
                root.style.setProperty('--sidebar-ring', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.4)');
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: #f8f7fa;
            }

            html.dark {
                background-color: #25293c;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
