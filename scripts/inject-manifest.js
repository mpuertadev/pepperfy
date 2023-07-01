/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../manifest.json');
const destinationFolder = path.join(__dirname, '../dist');
const destinationFile = path.join(destinationFolder, 'manifest.json');

// Verificar si el archivo fuente existe
if (fs.existsSync(sourceFile)) {
  // Verificar si la carpeta de destino existe, si no, crearla
  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
  }

  // Copiar el archivo
  fs.copyFile(sourceFile, destinationFile, (err) => {
    if (err) {
      console.error('Error while injecting manifest:', err);
    } else {
      console.log('Manifest injected successfully');
    }
  });
} else {
  console.error('Manifest file not found');
}
