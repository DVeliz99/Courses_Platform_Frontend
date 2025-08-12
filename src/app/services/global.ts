export var Global = {
  //url base
  url: 'https://web-production-12a8eb.up.railway.app/backend/public/api/',
  htmlEntities: function (str: any) {
    // Crear un elemento DOM temporal para extraer solo el texto
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent || "";
  }
}