let OPENAI_API_KEY = null;
const MOCKAPI_URL = "https://698def71aded595c2530911b.mockapi.io/api/v1/apikey";

const estadoMicrofono = document.getElementById("estadoMicrofono");
const estadoSistema = document.getElementById("estadoSistema");
const textoEscuchado = document.getElementById("textoEscuchado");
const ordenRecibida = document.getElementById("ordenRecibida");
const resultado = document.getElementById("resultado");
const boton = document.getElementById("btnActivar");

let sistemaActivo = false;

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
   VOZ
========================== */
function hablar(texto, callback = null) {
  const mensaje = new SpeechSynthesisUtterance(texto);
  mensaje.lang = "es-ES";

  mensaje.onend = () => {
    if (callback) callback();
  };

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

recognition.onresult = (event) => {
  const texto = event.results[event.results.length - 1][0].transcript
    .toLowerCase()
    .trim();

  textoEscuchado.textContent = texto;

  /* ACTIVACIÓN */
  if (texto.includes("nova")) {
    sistemaActivo = true;
    estadoSistema.textContent = "Sistema activado";
    hablar("Te escucho");
    return;
  }

  if (!sistemaActivo) {
    estadoSistema.textContent = "Di 'Nova' para activarme";
    return;
  }

  /* BUSCAR COMANDO */
  const comandoEncontrado = comandosValidos.find(cmd =>
    texto.includes(cmd)
  );

  if (comandoEncontrado) {
    ordenRecibida.textContent = comandoEncontrado;
    estadoSistema.textContent = "Orden ejecutada";
    hablar("Orden " + comandoEncontrado);
  } else {
    estadoSistema.textContent = "Orden no reconocida";
  }

  sistemaActivo = false;
};

/* ==========================
   INICIAR
========================== */
async function iniciarAplicacion() {

  boton.disabled = true;
  boton.innerText = "Nova Activada";

  await obtenerApiKey();

  hablar(
    "Hola, soy Nova, tu asistente de voz. Estoy lista para recibir tus instrucciones.",
    () => {
      recognition.start();
      estadoSistema.textContent = "Di 'Nova' para activarme";
    }
  );
}

boton.addEventListener("click", iniciarAplicacion);



