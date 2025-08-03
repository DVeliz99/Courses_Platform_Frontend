export var Global = {
  //url base
  url: 'https://web-production-2cfbd.up.railway.app/',
  htmlEntities: function (str: any) {
    // Crear un elemento DOM temporal para extraer solo el texto
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent || "";
  }
}