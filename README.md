#  EZPack AI EXTENSION

**EZPack AI** es un asistente de inteligencia artificial ligero y multiplataforma que vive directamente en tu navegador. Diseñado para ser rápido, seguro y funcional incluso sin conexión a internet (para tareas básicas).

Combina comandos locales (matemáticas, biología, hora) con el poder de la IA en la nube de **Google Gemini**, además de una herramienta nativa para **resumir videos de YouTube**.

##  Características principales

-  **Integración con Google Gemini:** Respuestas inteligentes para cualquier pregunta (requiere API Key gratuita).
-  **Resumidor de YouTube:** Extrae la transcripción del video que estés viendo y genera un resumen (100% local, no requiere API Key).
-  **Calculadora avanzada:** Parser matemático seguro (soporta funciones como `sqrt`, `sin`, `cos`, `log`, etc.).
-  **Base de conocimiento de Biología:** Respuestas rápidas sobre células, ADN, fotosíntesis, etc.
-  **Multi-idioma:** Interfaz y respuestas adaptadas a **Español, Inglés y Portugués**.
-  **Modos de personalidad:** Amigable, Mate (Matemáticas), Experta, Omni y Meme.
-  **Tema Claro/Oscuro:** Interfaz adaptable a tus preferencias.
-  **Privacidad:** Tu API Key y el historial se guardan localmente en tu navegador (`chrome.storage`), nunca en servidores externos (salvo las peticiones directas a la API de Google).

---

##  Instalación (Navegadores basados en Chromium)

Funciona en **Google Chrome, Microsoft Edge, Brave, Opera y Vivaldi**.

1. Descarga o clona este repositorio en tu computadora.
2. Abre tu navegador y ve a la página de extensiones:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Activa el **Modo de desarrollador** (interruptor en la esquina superior derecha).
4. Haz clic en el botón **"Cargar descomprimida"** (Load unpacked).
5. Selecciona la carpeta del proyecto (`ezpack-ai-extension`).
6. ¡Listo! El icono 📦 aparecerá en tu barra de herramientas. Fija la extensión para tenerla siempre a mano.

---

##  Instalación (Mozilla Firefox)

1. Abre Firefox y ve a: `about:debugging#/runtime/this-firefox`.
2. Haz clic en **"Cargar complemento temporal..."** (Load Temporary Add-on).
3. Navega hasta la carpeta del proyecto y selecciona el archivo `manifest.json`.
4. La extensión se cargará y aparecerá en tu barra de herramientas.

> *Nota: Las extensiones temporales en Firefox se eliminan al cerrar el navegador. Para instalarla permanentemente, necesitas firmarla en addons.mozilla.org.*

---

##  Instalación en Safari (macOS)

Instalar una extensión en Safari requiere usar **Xcode** (solo disponible en macOS).

### Requisitos previos
- macOS 11.0 o superior.
- Xcode instalado (puedes descargarlo gratis desde la Mac App Store).
- Herramientas de línea de comandos de Xcode instaladas (`xcode-select --install`).

### Pasos

1. Abre la aplicación **Terminal** en tu Mac.
2. Navega a la carpeta que contiene el proyecto y ejecuta el convertidor de Apple:
   ```bash
   xcrun safari-web-extension-converter /ruta/a/la/carpeta/ezpack-ai-extension
   ```
   (Reemplaza /ruta/a/la/carpeta/ con la ruta real donde descargaste el proyecto)

   3. El comando generará un proyecto de Xcode y te pedirá confirmación. Acepta

   4. Se abrirá **Xcode** automáticamente con el proyecto de la extensión

   5. En Xcode, ve al menú superior y selecciona tu equipo de desarrollo (Signing & Capabilities). Si no tienes uno, puedes usar tu Apple ID personal

   6. Presiona el botón de Play (▶) en la esquina superior izquierda para compilar y ejecutar

   7. Se abrirá Safari. Ve a Safari > Ajustes (o Preferencias) > Extensiones

   8. Marca la casilla junto a EZPack AI EXTENSION para activarla

   9. Listo

   ## Como crear tu API Key de Gemini (Gratis)

   Para que EZPack AI pueda responder preguntas abiertas (usando inteligencia artificial real), necesitas una clave de API de Google. Es 100% gratuita y no requiere tarjeta de crédito

   - Ve a [Google AI Studio](https://aistudio.google.com/) e inicia sesión con tu cuenta de Google

   - Haz clic en el botón "Create API key" (Crear clave de API)

   - En el campo Key name (Nombre de la clave), ponle un nombre descriptivo, por ejemplo: EZPack AI - Extensión

   - En Import Project (Importar proyecto), selecciona la opción de crear un proyecto nuevo y llámalo ezpack-ai-extension

   - Haz clic en "Create key" (Crear clave)

   - Copia la clave generada. Empezará con las letras `AIza....` Guárdala en un lugar seguro

   - Abre la extensión EZPack AI en tu navegador

   - Haz clic en el icono de Ajustes (⚙️)

   - Pega tu clave AIza... en el campo de texto y haz clic en Guardar

   > ⚠️ Nota sobre límites: El nivel gratuito de Gemini permite un número generoso de peticiones por minuto y por día. Si ves un error 429, significa que has alcanzado el límite temporal; solo espera un minuto y vuelve a intentarlo

## Guía rápida de uso

Una vez instalada y configurada, puedes escribirle o usar los botones de acceso rápido:

Preguntas abiertas: "Explícame la teoría de la relatividad como si tuviera 10 años" (Usa Gemini).

Matemáticas: "mate: sqrt(16) + 5 * 3" (Local, instantáneo).

Biología: "biologia ¿qué es el ADN?" (Local, instantáneo).

YouTube: Abre cualquier video de YouTube, abre EZPack AI y haz clic en "📺 Resumir video".

Utilidades locales: "hora", "fecha", "dado", "contraseña 16", "uuid", "chiste".

##  Tecnologías utilizadas
Manifest V3: Estándar moderno para extensiones de navegador.

Vanilla JavaScript: Sin dependencias externas ni frameworks, para un rendimiento máximo.

Google Gemini API: Modelos gemini-3.8-flash para respuestas de IA.

HTML/CSS: Interfaz de usuario personalizada y ligera.

## Licencia
Este proyecto está bajo la Licencia MIT. Eres libre de usarlo, modificarlo y distribuirlo.

## Capturas de pantalla

<img width="420" height="577" alt="Captura de pantalla 2026-10-18 172544" src="https://github.com/user-attachments/assets/8326068d-3318-43a1-9e8b-6923f8c62e92" />


