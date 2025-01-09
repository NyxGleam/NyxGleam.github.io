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
        } else {
            processedOutput = 'Unsupported file format.';
        }

        output.textContent = processedOutput;
        Prism.highlightElement(output);
    };

    reader.readAsText(file);
});

// Funciones de procesamiento (igual que antes)
function processVTT(content) {
    // Implementación aquí
    return 'Processed VTT content in Lua format.';
}

function processSRT(content) {
    // Implementación aquí
    return 'Processed SRT content in Lua format.';
}

function processASS(content) {
    // Implementación aquí
    return 'Processed ASS content in Lua format.';
}