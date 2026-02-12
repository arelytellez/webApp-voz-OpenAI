/************************************************************
 * CONTROL POR VOZ CON IA
 * API KEY obtenida desde MockAPI
 ************************************************************/

/* ==========================
   VARIABLES GLOBALES
   ========================== */

let OPENAI_API_KEY = null;

const MOCKAPI_URL = "https://698def71aded595c2530911b.mockapi.io/api/v1/apikey";

const estadoMicrofono = document.getElementById("estadoMicrofono");
const estadoSistema = document.getElementById("estadoSistema");
const textoEscuchado = document.getElementById("textoEscuchado");
const ordenRecibida = document.getElementById("ordenRecibida");
const resultado = document.getElementById("resultado");

let suspendido = false;
let temporizadorSuspension;

/* ==========================
   COMANDOS PERMITIDOS
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
   OBTENER API KEY
   ========================== */

async function obtenerApiKey() {
  try {
    const response = await fetch(MOCKAPI_URL);
    const data = await response.json();
    OPENAI_API_KEY = data[0].apikey;
    estadoSistema.textContent = "Sistema listo";
  } catch (error) {
    estadoSistema.textContent = "Error al cargar API Key";
  }
}

/* ==========================
   CONFIGURACIÓN DE VOZ
   ========================== */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "es-MX";
recognition.continuous = true;
recognition.interimResults = true;

/* ==========================
   MICRÓFONO ACTIVO
   ========================== */

recognition.onstart = () => {
  estadoMicrofono.textContent = "🎧 Micrófono activo";
  estadoSistema.textContent = "Escuchando...";
};

/* ==========================
   RESULTADOS DE VOZ
   ========================== */

recognition.onresult = async (event) => {

  reiniciarSuspension();

  let textoParcial = "";
  let textoFinal = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      textoFinal += event.results[i][0].transcript;
    } else {
      textoParcial += event.results[i][0].transcript;
    }
  }

  const textoActual = (textoParcial || textoFinal).toLowerCase().trim();
  textoEscuchado.textContent = textoActual;

  /* Activar con Alexa */
  if (textoActual.includes("alexa")) {
    suspendido = false;
    estadoSistema.textContent = "🔊 Sistema activado";
    resultado.textContent = "Esperando órdenes...";
    ordenRecibida.textContent = "Ninguna";
    return;
  }

  if (suspendido) {
    estadoSistema.textContent = "😴 Suspendido (di 'Alexa')";
    return;
  }

  if (textoParcial) {
    estadoSistema.textContent = "Reconociendo voz...";
    return;
  }

  estadoSistema.textContent = "Procesando orden...";
  await validarOrdenIA(textoFinal.toLowerCase().trim());
};

/* ==========================
   SUSPENSIÓN AUTOMÁTICA
   ========================== */

function reiniciarSuspension() {
  clearTimeout(temporizadorSuspension);

  temporizadorSuspension = setTimeout(() => {
    suspendido = true;
    estadoSistema.textContent = "😴 Suspendido (di 'Alexa')";
    textoEscuchado.textContent = "---";
    ordenRecibida.textContent = "Ninguna";
  }, 5000);
}

/* ==========================
   VALIDACIÓN CON OPENAI
   ========================== */

async function validarOrdenIA(texto) {

  if (!OPENAI_API_KEY) {
    resultado.textContent = "API Key no disponible";
    return;
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
Responde SOLO con:
avanzar, retroceder, detener,
vuelta derecha, vuelta izquierda,
90 derecha, 90 izquierda,
360 derecha, 360 izquierda
o "Orden no reconocida"
`
            },
            { role: "user", content: texto }
          ]
        })
      }
    );

    const data = await response.json();
    const respuesta = data.choices[0].message.content.trim();

    if (comandosValidos.includes(respuesta)) {
      ordenRecibida.textContent = respuesta;
      ordenRecibida.className = "alert alert-success fw-bold";
      resultado.textContent = "Orden válida ejecutada";
    } else {
      ordenRecibida.textContent = "Orden no reconocida";
      ordenRecibida.className = "alert alert-danger fw-bold";
      resultado.textContent = "Orden no reconocida";
    }

  } catch (error) {
    resultado.textContent = "Error al conectar con OpenAI";
  }
}

/* ==========================
   INICIO DE LA APLICACIÓN
   ========================== */

async function iniciarAplicacion() {
  await obtenerApiKey();
  recognition.start();
  reiniciarSuspension();
}

iniciarAplicacion();

