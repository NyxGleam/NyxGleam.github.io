document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('subtitleFile');
    const output = document.getElementById('output');
  
    if (fileInput.files.length === 0) {
      output.textContent = 'Please select a subtitle file.';
      return;
    }
  
    const file = fileInput.files[0];
    const reader = new FileReader();
  
    reader.onload = function(event) {
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
    // Procesar VTT (traducción de la lógica de C++)
    return 'Processed VTT content.';
  }
  
  function processSRT(content) {
    // Procesar SRT
    return 'Processed SRT content.';
  }
  
  function processASS(content) {
    // Procesar ASS
    return 'Processed ASS content.';
  }  