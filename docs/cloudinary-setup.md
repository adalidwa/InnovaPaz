# Configuración de Cloudinary para INNOVAPAZ

## 📋 Instrucciones para Configurar Cloudinary

### 1. Crear Upload Preset

1. Ve a tu dashboard de Cloudinary: https://cloudinary.com/console
2. Navega a **Settings** → **Upload**
3. Scroll hacia abajo hasta **Upload presets**
4. Haz click en **Add upload preset**

### 2. Configurar el Preset

**Preset name:** `innovapaz_products`

**Upload preset settings:**

- **Signing Mode:** `Unsigned` (Importante!)
- **Folder:** `innovapaz/products` (opcional, para organizar)
- **Resource Type:** `Image`
- **Access Mode:** `Public`

**Transformation settings:**

- **Format:** `Auto`
- **Quality:** `Auto`
- **Max file size:** `5MB`
- **Max image width:** `1000px`
- **Max image height:** `1000px`

**Advanced settings:**

- **Allowed formats:** `jpg,png,gif,webp`
- **Unique filename:** `true`
- **Overwrite:** `false`

### 3. Guardar el Preset

1. Haz click en **Save**
2. Copia el nombre del preset: `innovapaz_products`

### 4. Credenciales Utilizadas

```env
CLOUDINARY_CLOUD_NAME=drznmyqg8
CLOUDINARY_API_KEY=986445914219553
CLOUDINARY_API_SECRET=JWQ11gXHgFluIQEcx4Sgd3QIeT0
```

⚠️ **Nota:** Para upload unsigned solo necesitamos el `CLOUD_NAME` en el
frontend.

### 5. ¿Cómo Funciona?

1. El usuario selecciona una imagen desde el componente `ImageUpload`
2. La imagen se sube directamente a Cloudinary usando el preset
   `innovapaz_products`
3. Cloudinary devuelve la URL de la imagen optimizada
4. La URL se guarda en la base de datos junto con el producto

### 6. Optimizaciones Automáticas

Las imágenes se optimizan automáticamente:

- **Resize:** 400x400px para productos
- **Quality:** Auto (adapta calidad según velocidad de red)
- **Format:** Auto (WebP en navegadores compatibles, JPG en otros)

### 7. URLs Generadas

**Original:**
`https://res.cloudinary.com/drznmyqg8/image/upload/v1234567890/sample.jpg`

**Optimizada:**
`https://res.cloudinary.com/drznmyqg8/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v1234567890/sample.jpg`

---

## 🛠️ Para Desarrolladores

### Estructura del Componente ImageUpload

```typescript
interface ImageUploadProps {
  label?: string;
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  disabled?: boolean;
}
```

### Validaciones Implementadas

- ✅ Solo archivos de imagen (jpg, png, gif, webp)
- ✅ Tamaño máximo: 5MB
- ✅ Preview local antes de subir
- ✅ Manejo de errores
- ✅ Estado de carga

### Uso en Formularios

```tsx
<ImageUpload
  label='Imagen del Producto'
  currentImage={formData.image}
  onImageUpload={(url) => setFormData({ ...formData, image: url })}
  disabled={loading}
/>
```

---

## 🔧 Troubleshooting

### Error: "Upload preset must be whitelisted"

- Verifica que el preset `innovapaz_products` esté configurado como **Unsigned**

### Error: "Invalid API key"

- Verifica que el `CLOUD_NAME` sea correcto: `drznmyqg8`

### Error: "File too large"

- El límite está en 5MB, verifica el tamaño del archivo

### Imágenes no cargan

- Verifica la URL generada
- Comprueba que Cloudinary esté funcionando: https://cloudinary.com/status
