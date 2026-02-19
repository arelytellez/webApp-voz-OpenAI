let OPENAI_API_KEY = null;
const MOCKAPI_URL = "https://698def71aded595c2530911b.mockapi.io/api/v1/apikey";

const estadoMicrofono = document.getElementById("estadoMicrofono");
const estadoSistema = document.getElementById("estadoSistema");
const textoEscuchado = document.getElementById("textoEscuchado");
const ordenRecibida = document.getElementById("ordenRecibida");
const boton = document.getElementById("btnActivar");

/* ==========================
   COMANDOS
========================== */
const comandosValidos = [
  "avanzar",
  "retroceder",
  "detener",
  "vuelta derecha",
  "vuelta izquierda",
  "90 derecha",
  "90 izquierda",
  "360 derecha",
  "360 izquierda"
];

/* ==========================
   VOZ (NO BLOQUEANTE)
========================== */
function hablar(texto) {
  window.speechSynthesis.cancel();

  const mensaje = new SpeechSynthesisUtterance(texto);
  mensaje.lang = "es-ES";
  mensaje.rate = 1;

  window.speechSynthesis.speak(mensaje);
}

/* ==========================
   API KEY
========================== */
async function obtenerApiKey() {
  try {
    const response = await fetch(MOCKAPI_URL);
    const data = await response.json();
    OPENAI_API_KEY = data[0].apikey;
  } catch (error) {
    estadoSistema.textContent = "Error al cargar API Key";
  }
}

/* ==========================
   RECONOCIMIENTO
========================== */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "es-ES";
recognition.continuous = true;
recognition.interimResults = false;

recognition.onstart = () => {
  estadoMicrofono.textContent = "🎧 Micrófono activo";
};

recognition.onerror = (event) => {
  estadoSistema.textContent = "Error micrófono: " + event.error;
};

/* 🔥 Reinicio automático */
recognition.onend = () => {
  recognition.start();
};

recognition.onresult = (event) => {

  const texto = event.results[event.results.length - 1][0].transcript
    .toLowerCase()
    .trim();

  textoEscuchado.textContent = texto;

  // Solo ejecutar si incluye "nova"
  if (!texto.includes("nova")) return;

  const comandoEncontrado = comandosValidos.find(cmd =>
    texto.includes(cmd)
  );

  if (comandoEncontrado) {

    ordenRecibida.textContent = comandoEncontrado;
    estadoSistema.textContent = "Orden ejecutada";

    enviarComandoAlCarrito(comandoEncontrado);

  } else {
    estadoSistema.textContent = "Comando no reconocido";
  }
};

/* ==========================
   ENVÍO AL CARRITO
========================== */
function enviarComandoAlCarrito(comando) {
  console.log("Enviando al carrito:", comando);

  // Aquí conectas tu Arduino
}

/* ==========================
   INICIAR
========================== */
async function iniciarAplicacion() {

  boton.disabled = true;
  boton.innerText = "Nova Activada";

  estadoSistema.textContent = "Inicializando sistema...";

  await obtenerApiKey();

  // 🔥 MOSTRAR MENSAJE EN PANTALLA
  estadoSistema.textContent = "Di: Nova + comando";

  // 🔥 OPCIONAL: mensaje hablado (no bloquea)
  hablar("Hola, soy Nova, tu asistente de voz. Estoy lista para recibir tus instrucciones.Recuerda comenzar cada comando diciendo mi nombre");

  recognition.start();
}

boton.addEventListener("click", iniciarAplicacion);


