let processedOutput = ''; // Contenido procesado del archivo de subtítulos
let subtitles = []; // Subtítulos procesados
let player; // Reproductor de YouTube

// Procesar el archivo de subtítulos
document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('subtitleFile');
    const output = document.getElementById('output');

    if (fileInput.files.length === 0) {
        output.textContent = 'Please select a subtitle file.';
        Prism.highlightElement(output);
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const content = event.target.result;

        if (file.name.endsWith('.vtt')) {
            processedOutput = processVTT(content);
        } else if (file.name.endsWith('.srt')) {
            processedOutput = processSRT(content);
        } else if (file.name.endsWith('.ass')) {
            processedOutput = processASS(content);
        } else if (file.name.endsWith('.ssa')) {
            processedOutput = processSSA(content);
        } else if (file.name.endsWith('.txt')) {
            processedOutput = processTXT(content);
        } else {
            processedOutput = 'Unsupported file format.';
        }

        // Mostrar el contenido procesado en pantalla
        output.className = 'language-lua';
        output.textContent = processedOutput;
        Prism.highlightElement(output);

        // Parsear subtítulos
        subtitles = parseLuaSubtitles(processedOutput);
        console.log('Subtitles loaded:', subtitles);
    };

    reader.readAsText(file);
});

// Copiar contenido procesado al portapapeles
document.getElementById('copyButton').addEventListener('click', () => {
    const outputText = document.getElementById('output').textContent;
    navigator.clipboard
        .writeText(outputText)
        .then(() => alert('Output copied to clipboard!'))
        .catch((err) => console.error('Could not copy text:', err));
});

// Iniciar la previsualización
document.getElementById('startPreview').addEventListener('click', () => {
    if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) {
        player.playVideo(); // Inicia el video si no está reproduciéndose
    }
    syncSubtitles();
});

// Cargar el video de YouTube
document.getElementById('loadVideo').addEventListener('click', () => {
    const youtubeLink = document.getElementById('youtubeLink').value.trim();
    const videoId = extractVideoId(youtubeLink);

    if (videoId) {
        player.loadVideoById(videoId);
        console.log(`Loaded video: ${videoId}`);
    } else {
        alert('Please enter a valid YouTube link.');
    }
});

function timeToSeconds(time) {
    const [h, m, s] = time.split(':'); // Divide el tiempo en horas, minutos y segundos
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s); // Convierte todo a segundos
}

function escapeString(str) {
    return str.replace(/"/g, '\\"');
}

function cleanLineText(line) {
    return line.replace(/200\)\}/g, '').trim(); // Elimina "200)}" de las líneas
}

// Sincronizar subtítulos con el tiempo del video
function syncSubtitles() {
    const previewScreen = document.getElementById('preview-screen');
    previewScreen.innerHTML = ''; // Limpia subtítulos previos

    if (!subtitles || subtitles.length === 0) {
        console.error('No subtitles available for sync.');
        return;
    }

    subtitles.forEach((subtitle) => {
        const startTime = subtitle.startTime * 1000; // Convertir a milisegundos
        const duration = subtitle.duration * 1000;

        setTimeout(() => {
            const subtitleContainer = document.createElement('div');
            subtitleContainer.classList.add('subtitle-container');
            previewScreen.appendChild(subtitleContainer);

            createAnimatedText(
                subtitle.text,
                subtitleContainer,
                {
                    charSpacing: subtitle.charSpacing,
                    fadeDuration: 0.5,
                    fadeOutInterval: subtitle.fadeOutInterval,
                    sizeStart: '1rem',
                    sizeEnd: '2rem',
                    minX: -10,
                    maxX: 10,
                    minY: -10,
                    maxY: 10,
                    loopPreset: 'shaky', // Opciones: 'wavy', 'shaky', 'glitchy', 'none'
                    lifetime: subtitle.duration,
                }
            );

            setTimeout(() => {
                previewScreen.removeChild(subtitleContainer);
            }, duration);
        }, startTime);
    });
}

// Crear animaciones para cada carácter
function createAnimatedText(text, container, animationSettings) {
    const charSpacing = animationSettings.charSpacing || 0.05;
    const fadeDuration = animationSettings.fadeDuration || 0.5;
    const fadeOutInterval = animationSettings.fadeOutInterval || 0.1;

    const sizeStart = animationSettings.sizeStart || '1rem';
    const sizeEnd = animationSettings.sizeEnd || '2rem';
    const minRotation = animationSettings.minRotation || -15;
    const maxRotation = animationSettings.maxRotation || 15;

    const minX = animationSettings.minX || -10;
    const maxX = animationSettings.maxX || 10;
    const minY = animationSettings.minY || -10;
    const maxY = animationSettings.maxY || 10;

    const loopPreset = animationSettings.loopPreset || 'none';
    const lifetime = animationSettings.lifetime || null;

    container.innerHTML = ''; // Limpiar contenedor

    // Crear caracteres
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charElement = document.createElement('span');

        // Asignar contenido del carácter o un espacio con ancho definido
        if (char === ' ') {
            charElement.innerHTML = '&nbsp;'; // Espacio no separable
            charElement.style.display = 'inline-block';
        } else {
            charElement.textContent = char;
            charElement.style.display = 'inline-block';
        }

        charElement.style.opacity = '0';
        charElement.style.color = animationSettings.textColor || '#fff'; // Establecer color
        charElement.style.transition = `opacity ${fadeDuration}s, transform ${fadeDuration}s`;
        charElement.style.transform = `translate(
          ${Math.random() * (maxX - minX) + minX}px, 
          ${Math.random() * (maxY - minY) + minY}px
        ) rotate(${Math.random() * (maxRotation - minRotation) + minRotation}deg)`;

        container.appendChild(charElement);

        // Animación de Fade-In
        setTimeout(() => {
            charElement.style.opacity = '1';
            charElement.style.transition = `opacity ${fadeDuration}s, transform ${fadeDuration}s`;
            charElement.style.transform = 'translate(0, 0) rotate(0)';
            charElement.style.fontSize = sizeEnd;
        }, charSpacing * i * 1000);

        // Animación de Fade-Out
        if (lifetime) {
            setTimeout(() => {
                charElement.style.transition = `opacity ${fadeDuration}s ease-in, transform ${fadeDuration}s ease-in-out`;
                charElement.style.opacity = '0';
                charElement.style.transform = `translate(
                  ${Math.random() * (maxX - minX) + minX}px, 
                  ${Math.random() * (maxY - minY) + minY}px
                ) rotate(${Math.random() * (maxRotation - minRotation) + minRotation}deg)`;
                charElement.style.fontSize = sizeStart;

                setTimeout(() => charElement.remove(), fadeDuration * 1000);
            }, (lifetime + fadeOutInterval * i) * 1000);
        }

        // Presets de animación
        if (loopPreset === 'wavy') {
            setInterval(() => {
                const offset = Math.sin(Date.now() / 200) * 5;
                charElement.style.transform = `translateY(${offset}px)`;
            }, 50);
        } else if (loopPreset === 'shaky') {
            setInterval(() => {
                const xOffset = Math.random() * 4 - 2; // -2 a 2
                const yOffset = Math.random() * 4 - 2;
                charElement.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            }, 100);
        } else if (loopPreset === 'glitchy') {
            setInterval(() => {
                charElement.style.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
            }, 200);
        }
    }
}

// Parsear subtítulos desde el código Lua generado
function parseLuaSubtitles(luaCode) {
    const subtitleRegex = /createSubtitle\("([^"]+)", "([^"]+)", ([^,]+), ([^,]+), ([^,]+), ([^,]+)\)/g;
    const subtitles = [];
    let match;

    while ((match = subtitleRegex.exec(luaCode)) !== null) {
        const [_, id, text, startTime, duration, charSpacing, fadeOutInterval] = match;
        subtitles.push({
            id,
            text,
            startTime: parseFloat(startTime),
            duration: parseFloat(duration),
            charSpacing: parseFloat(charSpacing),
            fadeOutInterval: parseFloat(fadeOutInterval),
        });
    }

    console.log('Parsed subtitles:', subtitles);
    return subtitles;
}

function processVTT(content) {
    const lines = content.split('\n');
    const regex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;
    let result = 'local Sprite = require(script.Parent["Roblox-UI-Toolkit"].SpriteManager)\n\nlocal function createSubtitle(identifier, text, startTime, lifetime, charSpacing, fadeOutInterval)\n    local AnimationSettings = {\n        CharSpacing = charSpacing,\n        FadeDuration = 0.2,\n        FadeOutInterval = fadeOutInterval,\n        EasingStyle = Enum.EasingStyle.Quad,\n        EasingDirectionIn = Enum.EasingDirection.Out,\n        EasingDirectionOut = Enum.EasingDirection.In,\n        Lifetime = lifetime,\n        TextSize = 32,\n        SizeStart = UDim2.new(0.5, 0, 0.5, 0),\n        SizeEnd = UDim2.new(1, 0, 1, 0),\n        MinX = -10,\n        MaxX = 10,\n        MinY = -10,\n        MaxY = 10,\n        MinRotation = -15,\n        MaxRotation = 15,\n        LoopPreset = "None",\n        ColorInterval = 0.2,\n        ColorSequence = {\n            Color3.new(1, 0.733333, 0.996078),\n            Color3.new(0.631373, 1, 0.835294),\n            Color3.new(1, 0.819608, 0.701961),\n        },\n        ShakeMagnitude = UDim2.new(0, 400, 0, 400),\n        Speed = 50,\n        Magnitude = 3,\n    }\n    task.delay(startTime, function()\n        local AnimatedText = Sprite:CreateAnimatedText(\n            identifier,\n            text,\n            Color3.new(1, 1, 1),\n            Enum.Font.GothamMedium,\n            Enum.TextXAlignment.Center,\n            1,\n            UDim2.new(0.85, 0, 0.2, 0),\n            UDim2.new(0.5, 0, 0.5, 0),\n            Vector2.new(0.5, 0.5),\n            AnimationSettings,\n            "MainGui"\n        )\n    end)\nend\n\ndo\n';
    let subtitleNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const match = regex.exec(lines[i]);
        if (match) {
            const startSeconds = timeToSeconds(match[1]);
            const endSeconds = timeToSeconds(match[2]) - 1.0;
            const duration = endSeconds - startSeconds;

            let subtitleText = '';
            while (lines[++i] && lines[i].trim() !== '') {
                subtitleText += (subtitleText ? ' ' : '') + cleanLineText(lines[i]);
            }

            result += `createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n;`
            subtitleNumber++;
        }
    }

    result += 'end';
    return result;
}

function processSRT(content) {
    const lines = content.split('\n');
    const regex = /(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/;
    let result = 'local Sprite = require(script.Parent["Roblox-UI-Toolkit"].SpriteManager)\n\nlocal function createSubtitle(identifier, text, startTime, lifetime, charSpacing, fadeOutInterval)\n    local AnimationSettings = {\n        CharSpacing = charSpacing,\n        FadeDuration = 0.2,\n        FadeOutInterval = fadeOutInterval,\n        EasingStyle = Enum.EasingStyle.Quad,\n        EasingDirectionIn = Enum.EasingDirection.Out,\n        EasingDirectionOut = Enum.EasingDirection.In,\n        Lifetime = lifetime,\n        TextSize = 32,\n        SizeStart = UDim2.new(0.5, 0, 0.5, 0),\n        SizeEnd = UDim2.new(1, 0, 1, 0),\n        MinX = -10,\n        MaxX = 10,\n        MinY = -10,\n        MaxY = 10,\n        MinRotation = -15,\n        MaxRotation = 15,\n        LoopPreset = "None",\n        ColorInterval = 0.2,\n        ColorSequence = {\n            Color3.new(1, 0.733333, 0.996078),\n            Color3.new(0.631373, 1, 0.835294),\n            Color3.new(1, 0.819608, 0.701961),\n        },\n        ShakeMagnitude = UDim2.new(0, 400, 0, 400),\n        Speed = 50,\n        Magnitude = 3,\n    }\n    task.delay(startTime, function()\n        local AnimatedText = Sprite:CreateAnimatedText(\n            identifier,\n            text,\n            Color3.new(1, 1, 1),\n            Enum.Font.GothamMedium,\n            Enum.TextXAlignment.Center,\n            1,\n            UDim2.new(0.85, 0, 0.2, 0),\n            UDim2.new(0.5, 0, 0.5, 0),\n            Vector2.new(0.5, 0.5),\n            AnimationSettings,\n            "MainGui"\n        )\n    end)\nend\n\ndo\n';
    let subtitleNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const match = regex.exec(lines[i]);
        if (match) {
            const startSeconds = timeToSeconds(`${match[1]}.${match[2]}`);
            const endSeconds = timeToSeconds(`${match[3]}.${match[4]}`) - 1.0;
            const duration = endSeconds - startSeconds;

            let subtitleText = '';
            while (lines[++i] && lines[i].trim() !== '') {
                subtitleText += (subtitleText ? ' ' : '') + cleanLineText(lines[i]);
            }

            result += `createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n;`
            subtitleNumber++;
        }
    }

    result += 'end';
    return result;
}

function processASS(content) {
    const lines = content.split('\n');
    const regex = /Dialogue: [^,]*,(\d{1,2}:\d{2}:\d{2}\.\d{2}),(\d{1,2}:\d{2}:\d{2}\.\d{2}),/;
    const cleanupRegex = /\{.*?\}/g;
    let result = 'local Sprite = require(script.Parent["Roblox-UI-Toolkit"].SpriteManager)\n\nlocal function createSubtitle(identifier, text, startTime, lifetime, charSpacing, fadeOutInterval)\n    local AnimationSettings = {\n        CharSpacing = charSpacing,\n        FadeDuration = 0.2,\n        FadeOutInterval = fadeOutInterval,\n        EasingStyle = Enum.EasingStyle.Quad,\n        EasingDirectionIn = Enum.EasingDirection.Out,\n        EasingDirectionOut = Enum.EasingDirection.In,\n        Lifetime = lifetime,\n        TextSize = 32,\n        SizeStart = UDim2.new(0.5, 0, 0.5, 0),\n        SizeEnd = UDim2.new(1, 0, 1, 0),\n        MinX = -10,\n        MaxX = 10,\n        MinY = -10,\n        MaxY = 10,\n        MinRotation = -15,\n        MaxRotation = 15,\n        LoopPreset = "None",\n        ColorInterval = 0.2,\n        ColorSequence = {\n            Color3.new(1, 0.733333, 0.996078),\n            Color3.new(0.631373, 1, 0.835294),\n            Color3.new(1, 0.819608, 0.701961),\n        },\n        ShakeMagnitude = UDim2.new(0, 400, 0, 400),\n        Speed = 50,\n        Magnitude = 3,\n    }\n    task.delay(startTime, function()\n        local AnimatedText = Sprite:CreateAnimatedText(\n            identifier,\n            text,\n            Color3.new(1, 1, 1),\n            Enum.Font.GothamMedium,\n            Enum.TextXAlignment.Center,\n            1,\n            UDim2.new(0.85, 0, 0.2, 0),\n            UDim2.new(0.5, 0, 0.5, 0),\n            Vector2.new(0.5, 0.5),\n            AnimationSettings,\n            "MainGui"\n        )\n    end)\nend\n\ndo\n';
    let subtitleNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const match = regex.exec(lines[i]);
        if (match) {
            const startSeconds = timeToSeconds(match[1]);
            const endSeconds = timeToSeconds(match[2]) - 1.0;
            const duration = endSeconds - startSeconds;

            let subtitleText = lines[i].substr(lines[i].lastIndexOf(',') + 1).trim();
            subtitleText = subtitleText.replace(cleanupRegex, '');
            subtitleText = cleanLineText(subtitleText);

            result += `createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n;`
            subtitleNumber++;
        }
    }

    result += 'end';
    return result;
}

function processSSA(content) {
    const lines = content.split('\n');
    const regex = /Dialogue: [^,]*,(\d{1,2}:\d{2}:\d{2}\.\d{2}),(\d{1,2}:\d{2}:\d{2}\.\d{2}),/;
    let result = 'local Sprite = require(script.Parent["Roblox-UI-Toolkit"].SpriteManager)\n\nlocal function createSubtitle(identifier, text, startTime, lifetime, charSpacing, fadeOutInterval)\n    local AnimationSettings = {\n        CharSpacing = charSpacing,\n        FadeDuration = 0.2,\n        FadeOutInterval = fadeOutInterval,\n        EasingStyle = Enum.EasingStyle.Quad,\n        EasingDirectionIn = Enum.EasingDirection.Out,\n        EasingDirectionOut = Enum.EasingDirection.In,\n        Lifetime = lifetime,\n        TextSize = 32,\n        SizeStart = UDim2.new(0.5, 0, 0.5, 0),\n        SizeEnd = UDim2.new(1, 0, 1, 0),\n        MinX = -10,\n        MaxX = 10,\n        MinY = -10,\n        MaxY = 10,\n        MinRotation = -15,\n        MaxRotation = 15,\n        LoopPreset = "None",\n        ColorInterval = 0.2,\n        ColorSequence = {\n            Color3.new(1, 0.733333, 0.996078),\n            Color3.new(0.631373, 1, 0.835294),\n            Color3.new(1, 0.819608, 0.701961),\n        },\n        ShakeMagnitude = UDim2.new(0, 400, 0, 400),\n        Speed = 50,\n        Magnitude = 3,\n    }\n    task.delay(startTime, function()\n        local AnimatedText = Sprite:CreateAnimatedText(\n            identifier,\n            text,\n            Color3.new(1, 1, 1),\n            Enum.Font.GothamMedium,\n            Enum.TextXAlignment.Center,\n            1,\n            UDim2.new(0.85, 0, 0.2, 0),\n            UDim2.new(0.5, 0, 0.5, 0),\n            Vector2.new(0.5, 0.5),\n            AnimationSettings,\n            "MainGui"\n        )\n    end)\nend\n\ndo\n';
    let subtitleNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const match = regex.exec(lines[i]);
        if (match) {
            const startSeconds = timeToSeconds(match[1]);
            const endSeconds = timeToSeconds(match[2]) - 1.0;
            const duration = endSeconds - startSeconds;

            let subtitleText = lines[i].split(',').slice(9).join(',').trim();

            result += `createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n;`
            subtitleNumber++;
        }
    }

    result += 'end';
    return result;
}

function processTXT(content) {
    const lines = content.split('\n');
    let result = 'local Sprite = require(script.Parent["Roblox-UI-Toolkit"].SpriteManager)\n\nlocal function createSubtitle(identifier, text, startTime, lifetime, charSpacing, fadeOutInterval)\n    local AnimationSettings = {\n        CharSpacing = charSpacing,\n        FadeDuration = 0.2,\n        FadeOutInterval = fadeOutInterval,\n        EasingStyle = Enum.EasingStyle.Quad,\n        EasingDirectionIn = Enum.EasingDirection.Out,\n        EasingDirectionOut = Enum.EasingDirection.In,\n        Lifetime = lifetime,\n        TextSize = 32,\n        SizeStart = UDim2.new(0.5, 0, 0.5, 0),\n        SizeEnd = UDim2.new(1, 0, 1, 0),\n        MinX = -10,\n        MaxX = 10,\n        MinY = -10,\n        MaxY = 10,\n        MinRotation = -15,\n        MaxRotation = 15,\n        LoopPreset = "None",\n        ColorInterval = 0.2,\n        ColorSequence = {\n            Color3.new(1, 0.733333, 0.996078),\n            Color3.new(0.631373, 1, 0.835294),\n            Color3.new(1, 0.819608, 0.701961),\n        },\n        ShakeMagnitude = UDim2.new(0, 400, 0, 400),\n        Speed = 50,\n        Magnitude = 3,\n    }\n    task.delay(startTime, function()\n        local AnimatedText = Sprite:CreateAnimatedText(\n            identifier,\n            text,\n            Color3.new(1, 1, 1),\n            Enum.Font.GothamMedium,\n            Enum.TextXAlignment.Center,\n            1,\n            UDim2.new(0.85, 0, 0.2, 0),\n            UDim2.new(0.5, 0, 0.5, 0),\n            Vector2.new(0.5, 0.5),\n            AnimationSettings,\n            "MainGui"\n        )\n    end)\nend\n\ndo\n';
    let subtitleNumber = 1;

    for (let line of lines) {
        line = line.trim();
        if (line) {
            const startSeconds = subtitleNumber * 2;
            const duration = 2;

            result += `createSubtitle("Line${subtitleNumber}", "${escapeString(line)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n;`
            subtitleNumber++;
        }
    }

    result += 'end';
    return result;
}

// Función para extraer el ID del video de un enlace de YouTube
function extractVideoId(link) {
    const regex =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = link.match(regex);
    return match ? match[1] : null;
}

// YouTube API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '',
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
        },
    });
}

function onPlayerReady(event) {
    console.log('YouTube Player is ready.');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        syncSubtitles();
    }
}