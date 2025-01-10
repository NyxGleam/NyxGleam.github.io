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
        let processedOutput = '';

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

        // Actualizamos el contenido y la clase del código
        output.className = 'language-lua'; // Asegura que Prism lo detecte como Lua
        output.textContent = processedOutput;

        // Resalta el código
        Prism.highlightElement(output);
    };

    reader.readAsText(file);
});

document.getElementById('copyButton').addEventListener('click', () => {
    const outputText = document.getElementById('output').textContent;
    navigator.clipboard.writeText(outputText)
        .then(() => alert('Output copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err));
});

function timeToSeconds(time) {
    const [h, m, s] = time.split(':');
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
}

function escapeString(str) {
    return str.replace(/"/g, '\\"');
}

function cleanLineText(line) {
    return line.replace(/200\)\}/g, '').trim(); // Elimina "200)}" de las líneas
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

            result += `    createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n`;
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

            result += `    createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n`;
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

            result += `    createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n`;
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

            result += `    createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n`;
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

            result += `    createSubtitle("Line${subtitleNumber}", "${escapeString(line)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n`;
            subtitleNumber++;
        }
    }

    result += 'end';
    return result;
}

document.getElementById('startPreview').addEventListener('click', () => {
    startPreview();
});

document.getElementById('startPreview').addEventListener('click', () => {
    startPreview(processedOutput); // Usa los subtítulos generados
});

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

    return subtitles;
}

function startPreview(luaCode) {
    const previewScreen = document.getElementById('preview-screen');
    previewScreen.innerHTML = ''; // Limpia subtítulos anteriores

    const subtitles = parseLuaSubtitles(luaCode);

    subtitles.forEach((subtitle) => {
        const subtitleElement = document.createElement('span');
        subtitleElement.classList.add('subtitle');
        subtitleElement.textContent = subtitle.text;

        // Configuración inicial
        subtitleElement.style.transform = `translate(0px, 0px) rotate(${Math.random() * 30 - 15}deg)`;
        previewScreen.appendChild(subtitleElement);

        // Aparecer subtítulo
        setTimeout(() => {
            subtitleElement.style.opacity = 1;
            subtitleElement.style.transform = `translate(0px, 0px) rotate(0deg)`;
        }, subtitle.startTime * 1000);

        // Desaparecer subtítulo
        setTimeout(() => {
            subtitleElement.style.opacity = 0;
            subtitleElement.style.transform = `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 30 - 15}deg)`;
        }, (subtitle.startTime + subtitle.duration) * 1000);

        // Movimiento dinámico (Wavy)
        if (subtitle.charSpacing > 0.01) {
            setInterval(() => {
                const offsetX = Math.sin(Date.now() / 200) * 10;
                subtitleElement.style.transform = `translate(${offsetX}px, 0)`;
            }, 50);
        }
    });
}