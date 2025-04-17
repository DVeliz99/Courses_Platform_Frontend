export var Global = {
  //url base
  url: 'https://coursesplatformbackend-production.up.railway.app/api/',
  htmlEntities: function (str: any) {
    // Crear un elemento DOM temporal para extraer solo el texto
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent || "";
  }
}