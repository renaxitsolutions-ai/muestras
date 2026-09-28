/* Negocios de la demo. Son ficticios (los mismos de las demos de páginas web). */
window.NEGOCIOS = {
  brasa: {
    id: "brasa",
    nombre: "Brasa Norte",
    iniciales: "BN",
    tipo: "pedido",
    moneda: "USD",
    decimales: 2,
    horario: "Abrimos de **martes a domingo, de 12:00 pm a 11:00 pm**. Los lunes descansamos.",
    ubicacion: "Estamos en **Ciudad de Panamá**. Si quiere, le mando la ubicación exacta para llegar con el mapa.",
    pago: "Aceptamos **efectivo, tarjeta y transferencia**. Si pide por aquí, puede pagar al recoger.",
    saludo: "¡Hola! 👋 Bienvenido a **Brasa Norte**, parrilla al carbón. Soy el asistente virtual. Le puedo mostrar la carta, tomarle un pedido o resolver dudas. ¿Qué le provoca hoy?",
    chipsInicio: ["Ver la carta", "Quiero hacer un pedido", "¿Hacen envíos?", "Horario"],
    panel: { titulo: "Pedidos de hoy", lista: "Pedidos", venta: "Ventas", vacio: "Cuando confirme un pedido en el chat, aparece aquí al instante." },
    items: [
      { nombre: "Parrillada para dos", precio: 44.15, desc: "carne, pollo, chorizo y chuleta", claves: ["parrillada", "para dos", "parrilla"] },
      { nombre: "Churrasco", precio: 23.17, desc: "con chimichurri de la casa", claves: ["churrasco"] },
      { nombre: "Punta de anca", precio: 24.95, desc: "al punto que pida", claves: ["punta de anca", "anca", "punta"] },
      { nombre: "Costillas BBQ", precio: 21.87, desc: "cocidas lento y terminadas al fuego", claves: ["costilla", "bbq", "ribs"] },
      { nombre: "Chuleta ahumada", precio: 20.87, desc: "gruesa, con punto de ahumado", claves: ["chuleta"] },
      { nombre: "Pollo a la brasa", precio: 16.20, desc: "marinado desde el día anterior", claves: ["pollo"] },
      { nombre: "Pinchos mixtos", precio: 15.85, desc: "de res y pollo, con verduras", claves: ["pincho"] },
      { nombre: "Yuca frita", precio: 7.36, desc: "crujiente, con mojo", claves: ["yuca"] },
      { nombre: "Maduros al horno", precio: 6.18, desc: "con queso rallado", claves: ["maduro", "platano"] },
      { nombre: "Ensalada de la casa", precio: 6.09, desc: "para acompañar la carne", claves: ["ensalada"] }
    ],
    faq: [
      { claves: ["envio", "domicilio", "delivery", "llevan", "mandan", "envian", "a casa"], respuesta: "¡Sí, hacemos envíos! 🛵 El costo depende de la zona y se lo confirmo al tomar el pedido. ¿Le armo uno?", chips: ["Quiero hacer un pedido", "Ver la carta"] },
      { claves: ["grupo", "cumpleanos", "evento", "reserv", "mesa"], respuesta: "Claro. Para grupos de más de 8 personas le pedimos avisar con un día de anticipación y le guardamos el espacio. ¿Para cuántas personas sería?", chips: ["Ver la carta", "Hablar con una persona"] },
      { claves: ["vegetarian", "vegano", "gluten", "sin carne", "celiac"], respuesta: "Sí tenemos opciones: la **ensalada de la casa**, la **yuca frita** y los **maduros al horno**. Y siempre adaptamos lo que se pueda. 🥗", chips: ["Ver la carta", "Quiero hacer un pedido"] },
      { claves: ["demora", "tarda", "cuanto tiempo", "listo en"], respuesta: "Un pedido suele estar listo en **15 a 20 minutos**. Con envío, súmele el tiempo de camino según la zona.", chips: ["Quiero hacer un pedido"] },
      { claves: ["recomienda", "mas pedido", "especialidad", "favorit", "que me recomiendas", "sugier"], respuesta: "La favorita de la casa es la **Parrillada para dos** ($44.15). Si viene solo, el **Churrasco** con chimichurri ($23.17) no falla. 🔥", chips: ["Quiero la parrillada", "Quiero un churrasco", "Ver la carta"] }
    ]
  },

  navaja: {
    id: "navaja",
    nombre: "Navaja Fina Barber Club",
    corto: "Navaja Fina",
    iniciales: "NF",
    tipo: "cita",
    moneda: "MXN",
    decimales: 0,
    horario: "Atendemos de **lunes a sábado, de 10:00 am a 8:00 pm**. Los domingos cerramos.",
    ubicacion: "Estamos en **Ciudad de México**. Al confirmar la cita le mando la ubicación para llegar con el mapa.",
    pago: "Aceptamos **efectivo, tarjeta y transferencia**.",
    saludo: "¡Qué tal! 💈 Bienvenido a **Navaja Fina Barber Club**. Soy el asistente virtual. Le agendo su cita en un minuto, le paso precios o resuelvo dudas. ¿En qué le ayudo?",
    chipsInicio: ["Agendar una cita", "Ver servicios y precios", "Horario", "¿Atienden niños?"],
    panel: { titulo: "Citas de hoy", lista: "Agenda", venta: "Citas", vacio: "Cuando agende una cita en el chat, aparece aquí al instante." },
    horaAbre: 10, horaCierra: 20, cerradoDia: 0,
    horasSugeridas: ["10:30 am", "12:00 pm", "4:00 pm", "6:30 pm"],
    items: [
      { nombre: "Corte de cabello", precio: 250, dura: "40 min", claves: ["corte de cabello", "corte normal", "cortarme el pelo", "cortar el pelo", "corte sencillo"] },
      { nombre: "Corte + barba", precio: 400, dura: "1 h", claves: ["corte y barba", "corte + barba", "corte con barba", "completo", "paquete"] },
      { nombre: "Fade / degradado", precio: 300, dura: "45 min", claves: ["fade", "degradado", "desvanecido"] },
      { nombre: "Diseño o línea", precio: 350, dura: "50 min", claves: ["diseno", "linea", "raya"] },
      { nombre: "Corte de niño", precio: 200, dura: "30 min", claves: ["nino", "hijo", "infantil", "menor"] },
      { nombre: "Barba y perfilado", precio: 200, dura: "30 min", claves: ["barba", "perfilado"] },
      { nombre: "Afeitado clásico", precio: 200, dura: "40 min", claves: ["afeitado", "rasurado", "navaja"] },
      { nombre: "Perfilado de cejas", precio: 100, dura: "15 min", claves: ["ceja"] },
      { nombre: "Mascarilla facial", precio: 250, dura: "30 min", claves: ["mascarilla", "facial"] },
      { nombre: "Tinte o cubrecanas", precio: 550, dura: "1 h 15", claves: ["tinte", "canas", "color"] }
    ],
    faq: [
      { claves: ["nino", "ninos", "hijo", "menor"], respuesta: "¡Claro! A los niños los atendemos con paciencia y sin dramas. El **corte de niño** (menores de 12) cuesta **$200 MXN** y dura unos 30 minutos. ¿Le agendo uno?", chips: ["Agendar corte de niño", "Ver servicios y precios"] },
      { claves: ["sin cita", "llegar sin", "puedo llegar", "tengo que reservar", "walk"], respuesta: "Puede llegar, pero con cita lo atendemos **a la hora exacta, sin esperar**. ¿Se la agendo?", chips: ["Agendar una cita"] },
      { claves: ["cuanto dura", "demora", "tarda", "tiempo"], respuesta: "Entre **40 minutos y una hora**, según el servicio. Aquí no trabajamos con prisa. ✂️", chips: ["Ver servicios y precios", "Agendar una cita"] },
      { claves: ["recomienda", "mas pedido", "favorit", "sugier"], respuesta: "El más pedido es **Corte + barba** ($400 MXN): sale listo para lo que sea. Si solo quiere refrescar, el **Fade** ($300 MXN) queda impecable.", chips: ["Agendar corte + barba", "Agendar un fade"] }
    ]
  }
};
