// Lista de herramientas con sus nombres y rutas
const tools = [
    { name: "🎬 Subtitle Processor", link: "subtitle-processor/" },
    { name: "🔮 Magic Circle Generator", link: "magic-circle-generator/" },
    { name: "🛠️ Another Tool", link: "another-tool/" } // Puedes agregar más aquí
];

// Contenedor donde se agregarán los botones dinámicamente
const toolsContainer = document.getElementById("tools-container");

// Generar los botones dinámicamente
tools.forEach(tool => {
    const button = document.createElement("a");
    button.classList.add("tool-button");
    button.href = tool.link;
    button.textContent = tool.name;
    toolsContainer.appendChild(button);
});