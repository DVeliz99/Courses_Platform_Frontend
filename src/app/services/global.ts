export var Global = {
  //url base
  url: 'http://backend.rest/api/',
  htmlEntities: function (str: any) {
    // Crear un elemento DOM temporal para extraer solo el texto
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent || "";
  }
}