// Script para verificar configuración de Cloudinary
// Ejecuta esto en la consola del navegador para debug

console.log('🔍 Verificando configuración de Cloudinary...');

// 1. Verificar CLOUD_NAME
const CLOUD_NAME = 'drznmyqg8';
console.log('Cloud Name:', CLOUD_NAME);

// 2. Probar URL de Cloudinary
const testUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
console.log('API URL:', testUrl);

// 3. Lista de presets comunes que podrían funcionar
const commonPresets = [
  'ml_default',
  'default',
  'unsigned_default',
  'innovapaz_products'
];

console.log('Presets a probar:', commonPresets);

// 4. Función para probar un preset
async function testPreset(presetName) {
  console.log(`\n🧪 Probando preset: ${presetName}`);
  
  // Crear un archivo de prueba (pixel transparente 1x1)
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'test.png');
      formData.append('upload_preset', presetName);
      formData.append('cloud_name', CLOUD_NAME);
      
      try {
        const response = await fetch(testUrl, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Preset "${presetName}" FUNCIONA!`);
          console.log('URL generada:', data.secure_url);
          resolve({ success: true, preset: presetName, url: data.secure_url });
        } else {
          const error = await response.json();
          console.log(`❌ Preset "${presetName}" falló:`, error.error?.message || response.statusText);
          resolve({ success: false, preset: presetName, error: error.error?.message });
        }
      } catch (err) {
        console.log(`❌ Error de red con preset "${presetName}":`, err.message);
        resolve({ success: false, preset: presetName, error: err.message });
      }
    }, 'image/png');
  });
}

// 5. Probar todos los presets
async function findWorkingPreset() {
  console.log('\n🔍 Buscando preset que funcione...\n');
  
  for (const preset of commonPresets) {
    const result = await testPreset(preset);
    if (result.success) {
      console.log(`\n🎉 ¡Encontrado! Usa este preset: "${result.preset}"`);
      console.log(`📝 Actualiza cloudinaryService.ts con:`);
      console.log(`UPLOAD_PRESET: '${result.preset}'`);
      return result.preset;
    }
    // Esperar un poco entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ Ningún preset funcionó. Necesitas crear "innovapaz_products" en Cloudinary.');
  console.log('👉 Ve a: https://cloudinary.com/console/settings/upload');
}

// Ejecutar test
findWorkingPreset();

console.log('\n📋 INSTRUCCIONES:');
console.log('1. Ejecuta este script en la consola del navegador');
console.log('2. Si encuentra un preset que funcione, úsalo temporalmente');
console.log('3. Crea el preset "innovapaz_products" para uso permanente');
console.log('4. Configúralo como "Unsigned" en Cloudinary Dashboard');