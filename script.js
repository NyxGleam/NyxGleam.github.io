document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('subtitleFile');
    const output = document.getElementById('output');

    if (fileInput.files.length === 0) {
        output.textContent = 'Please select a subtitle file.';
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
        } else {
            processedOutput = 'Unsupported file format.';
        }

        output.textContent = processedOutput;
    };

    reader.readAsText(file);
});

function processVTT(content) {
    const lines = content.split('\n');
    const regex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;
    let result = 'do\n';
    let subtitleNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const match = regex.exec(lines[i]);
        if (match) {
            const startTime = match[1];
            const endTime = match[2];
            const startSeconds = timeToSeconds(startTime);
            const endSeconds = timeToSeconds(endTime) - 1.0;
            const duration = endSeconds - startSeconds;

            let subtitleText = '';
            while (lines[++i] && lines[i].trim() !== '') {
                subtitleText += (subtitleText ? ' ' : '') + lines[i].trim();
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
    let result = 'do\n';
    let subtitleNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const match = regex.exec(lines[i]);
        if (match) {
            const startTime = `${match[1]}.${match[2]}`;
            const endTime = `${match[3]}.${match[4]}`;
            const startSeconds = timeToSeconds(startTime);
            const endSeconds = timeToSeconds(endTime) - 1.0;
            const duration = endSeconds - startSeconds;

            let subtitleText = '';
            while (lines[++i] && lines[i].trim() !== '') {
                subtitleText += (subtitleText ? ' ' : '') + lines[i].trim();
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
    let result = 'do\n';
    let subtitleNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const match = regex.exec(lines[i]);
        if (match) {
            const startTime = match[1];
            const endTime = match[2];
            const startSeconds = timeToSeconds(startTime);
            const endSeconds = timeToSeconds(endTime) - 1.0;
            const duration = endSeconds - startSeconds;

            let subtitleText = lines[i].substr(lines[i].lastIndexOf(',') + 1).trim();
            subtitleText = subtitleText.replace(cleanupRegex, '');

            result += `    createSubtitle("Line${subtitleNumber}", "${escapeString(subtitleText)}", ${startSeconds.toFixed(3)}, ${duration.toFixed(3)}, 0.02, 0.02)\n`;
            subtitleNumber++;
        }
    }

    result += 'end';
    return result;
}

function timeToSeconds(time) {
    const [h, m, s] = time.split(':');
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
}

function escapeString(str) {
    return str.replace(/"/g, '\\"');
}