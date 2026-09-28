/* Conversación de la demo: intenciones sencillas + flujos de pedido y de cita. */
(function () {
  var N = window.NEGOCIOS, UI = window.UI;
  var neg, st, cola = Promise.resolve();
  var conv = 0, tiempos = [], ventas = 0, citas = 0, numPedido = 1024;
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var NUM = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6 };

  function norm(t) {
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!.,;:()"]/g, " ").replace(/\s+/g, " ").trim();
  }
  function tiene(n, lista) { var s = " " + n; return lista.some(function (k) { return s.indexOf(" " + k) !== -1; }); }
  function palabra(n, lista) { var s = " " + n + " "; return lista.some(function (k) { return s.indexOf(" " + k + " ") !== -1; }); }
  function r(textos, chips, luego) { return { textos: [].concat(textos), chips: chips || [], luego: luego }; }
  function $$(n) { return UI.dinero(n, neg); }

  /* Busca productos o servicios; si dos claves se pisan, gana la más larga. */
  function buscar(n) {
    var s = " " + n, hallados = [];
    neg.items.forEach(function (it) {
      it.claves.forEach(function (k) {
        var i = s.indexOf(" " + k);
        if (i !== -1) hallados.push({ it: it, ini: i, fin: i + k.length + 1 });
      });
    });
    hallados.sort(function (a, b) { return (b.fin - b.ini) - (a.fin - a.ini); });
    var usados = [], out = [];
    hallados.forEach(function (h) {
      var pisa = usados.some(function (u) { return h.ini < u.fin && u.ini < h.fin; });
      if (pisa || out.some(function (o) { return o.it === h.it; })) return;
      usados.push(h);
      var antes = s.slice(0, h.ini).trim().split(" ").slice(-2), cant = 1;
      antes.forEach(function (w) { if (/^\d+$/.test(w)) cant = Math.min(+w, 20); else if (NUM[w]) cant = NUM[w]; });
      out.push({ it: h.it, cant: cant, ini: h.ini });
    });
    return out.sort(function (a, b) { return a.ini - b.ini; });
  }

  function totalCarrito() { return st.carrito.reduce(function (t, c) { return t + c.it.precio * c.cant; }, 0); }
  function resumenCarrito() { return st.carrito.map(function (c) { return c.cant + " × " + c.it.nombre; }).join(", "); }

  /* ---------- Restaurante: pedido ---------- */
  function agregar(enc) {
    enc.forEach(function (e) {
      var ya = st.carrito.filter(function (c) { return c.it === e.it; })[0];
      if (ya) ya.cant += e.cant; else st.carrito.push({ it: e.it, cant: e.cant });
    });
    st.paso = "carrito"; st.ultimo = null;
    var txt = "Anotado ✍️ " + enc.map(function (e) { return "**" + e.cant + " × " + e.it.nombre + "**"; }).join(" y ") +
      ".\nVa en **" + $$(totalCarrito()) + "**. ¿Algo más o cerramos el pedido?";
    return r(txt, ["Eso es todo", "Agregar yuca frita", "Ver la carta"]);
  }
  function pasoPedido(t, n) {
    if (st.paso === "carrito") {
      var enc = buscar(n);
      if (enc.length && !tiene(n, ["cuanto", "precio", "cuesta", "vale"])) return agregar(enc);
      if (tiene(n, ["eso es todo", "es todo", "nada mas", "seria todo", "cerrar", "cerramos", "finalizar", "ya esta", "listo"]) || palabra(n, ["ya", "nada"])) {
        if (!st.carrito.length) return r("Todavía no me ha pedido nada 🙂. ¿Qué le anoto?", ["Ver la carta", "Quiero la parrillada"]);
        st.paso = "entrega";
        return r("Perfecto. ¿Lo pasa a buscar o se lo enviamos?", ["Paso a buscarlo", "Envío a domicilio"]);
      }
      return null;
    }
    if (st.paso === "entrega") {
      if (tiene(n, ["buscar", "recoger", "retir", "paso", "local", "voy"])) { st.envio = false; st.paso = "nombre"; return r("Listo, lo recoge en el local. ¿A nombre de quién lo anoto?"); }
      if (tiene(n, ["envio", "domicilio", "delivery", "enviar", "envien", "traer", "llevar", "casa", "mandar"])) { st.envio = true; st.paso = "direccion"; return r("¿A qué dirección se lo enviamos? 🛵"); }
      return r("¿Lo recoge en el local o se lo enviamos a domicilio?", ["Paso a buscarlo", "Envío a domicilio"]);
    }
    if (st.paso === "direccion") {
      if (n.length < 5) return r("Necesito la dirección un poco más completa para el repartidor. ¿Me la escribe?");
      st.direccion = t.slice(0, 80); st.paso = "nombre";
      return r("Anotada la dirección. ¿A nombre de quién va el pedido?");
    }
    if (st.paso === "nombre") return pedirConfirmacion(t);
    if (st.paso === "confirmar") {
      if (tiene(n, ["confirm", "dale", "correcto", "perfecto", "de una", "claro", "listo"]) || palabra(n, ["si", "ok", "va", "sip"])) return crearPedido();
      if (tiene(n, ["cambiar", "corregir", "otra cosa", "empezar"]) || palabra(n, ["no"])) {
        st.carrito = []; st.paso = "carrito";
        return r("Sin problema, lo armamos de nuevo. ¿Qué le gustaría pedir?", ["Ver la carta", "Quiero la parrillada"]);
      }
      return r("¿Confirmo el pedido?", ["Sí, confirmar", "Cambiar algo"]);
    }
    return null;
  }
  function nombreDe(t) {
    var n = t.replace(/^(soy|me llamo|mi nombre es|a nombre de|es para|para)\s+/i, "").replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñü\s]/g, "").trim();
    n = n.split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(); }).join(" ");
    return n || "Cliente";
  }
  function pedirConfirmacion(t) {
    st.nombre = nombreDe(t); st.paso = "confirmar";
    var lineas = st.carrito.map(function (c) { return "• " + c.cant + " × " + c.it.nombre + " — " + $$(c.it.precio * c.cant); }).join("\n");
    return r("Este es su pedido, **" + st.nombre + "**:\n" + lineas + "\n**Total: " + $$(totalCarrito()) + "**" +
      (st.envio ? " + envío según la zona\n🛵 " + st.direccion : "\n🏠 Lo recoge en el local") + "\n¿Lo confirmo?", ["Sí, confirmar", "Cambiar algo"]);
  }
  function crearPedido() {
    var total = totalCarrito(), num = "#" + (++numPedido), nombre = st.nombre, envio = st.envio, resumen = resumenCarrito();
    ventas += total; st.carrito = []; st.paso = null;
    return r(["¡Listo, **" + nombre + "**! ✅ Pedido **" + num + "** confirmado.",
      envio ? "Sale en unos 20 minutos y le aviso por aquí cuando vaya en camino. ¡Buen provecho! 🔥" : "Estará listo en unos 20 minutos. Le aviso por aquí apenas esté. ¡Buen provecho! 🔥"],
      ["Ver la carta", "Formas de pago"], function () {
        UI.item({ num: num, titulo: nombre + " · " + (envio ? "Envío" : "Recoge"), detalle: resumen, total: $$(total), estado: "Nuevo" });
        UI.actividad("🧾", "Pedido " + num + " anotado en su hoja de pedidos");
        UI.actividad("💬", "Aviso al dueño por WhatsApp: **" + num + " · " + $$(total) + "**");
        UI.actividad(envio ? "🛵" : "⏱️", envio ? "Dirección enviada al repartidor" : "Cliente avisado: listo en 20 min");
        pintarStats();
        UI.aviso("Nuevo pedido **" + num + "** · " + $$(total));
      });
  }

  /* ---------- Barbería: cita ---------- */
  function iniciarCita(servicio) {
    st.cita = { servicio: servicio || null };
    if (!servicio) { st.paso = "servicio"; return r("¡Con gusto! ¿Qué servicio le agendo?", ["Corte de cabello", "Corte + barba", "Fade", "Barba y perfilado"]); }
    st.paso = "dia";
    return r("Va: **" + servicio.nombre + "** (" + $$(servicio.precio) + " · " + servicio.dura + "). ¿Para qué día?", opcionesDia());
  }
  function opcionesDia() {
    var hoy = new Date(), op = [];
    if (hoy.getDay() !== neg.cerradoDia && hoy.getHours() < neg.horaCierra - 2) op.push("Hoy");
    for (var i = 1; op.length < 3 && i < 8; i++) {
      var d = new Date(hoy); d.setDate(hoy.getDate() + i);
      if (d.getDay() !== neg.cerradoDia) op.push(i === 1 ? "Mañana" : DIAS[d.getDay()].charAt(0).toUpperCase() + DIAS[d.getDay()].slice(1));
    }
    return op;
  }
  function leerDia(n) {
    var hoy = new Date(), d = null, dicho = "";
    if (tiene(n, ["pasado manana"])) { d = new Date(hoy); d.setDate(hoy.getDate() + 2); }
    else if (palabra(n, ["hoy"])) { d = new Date(hoy); dicho = "hoy"; }
    else if (palabra(n, ["manana"])) { d = new Date(hoy); d.setDate(hoy.getDate() + 1); dicho = "mañana"; }
    else DIAS.forEach(function (nom, i) {
      if (d || !palabra(n, [norm(nom)])) return;
      d = new Date(hoy); d.setDate(hoy.getDate() + ((i - hoy.getDay() + 7) % 7 || 7));
    });
    if (!d) return null;
    return { fecha: d, texto: (dicho ? dicho + ", " : "el ") + DIAS[d.getDay()] + " " + d.getDate(), hoy: dicho === "hoy" };
  }
  function leerHora(n) {
    if (tiene(n, ["mediodia"])) return { h: 12, m: 0 };
    var x = n.match(/(\d{1,2})(?:[:h ](\d{2}))?\s*(am|pm|a m|p m|de la tarde|de la noche|de la manana)?/);
    if (!x) return null;
    var h = +x[1], m = x[2] ? +x[2] : 0, suf = x[3] || "";
    if (/p|tarde|noche/.test(suf) && h < 12) h += 12;
    else if (!suf && h >= 1 && h <= 8) h += 12;
    if (h > 23 || m > 59) return null;
    return { h: h, m: m };
  }
  function textoHora(o) { var h = o.h % 12 || 12; return h + ":" + (o.m < 10 ? "0" : "") + o.m + (o.h >= 12 ? " pm" : " am"); }

  function pasoCita(t, n) {
    if (st.paso === "servicio") {
      var enc = buscar(n);
      if (enc.length) return iniciarCita(enc[0].it);
      if (tiene(n, ["corte", "cortar", "pelo", "cabello"])) return iniciarCita(neg.items[0]);
      return null;
    }
    if (st.paso === "dia") {
      var dia = leerDia(n);
      if (!dia) return r("¿Qué día le queda mejor?", opcionesDia());
      if (dia.fecha.getDay() === neg.cerradoDia) return r("Los domingos cerramos 🙏. ¿Le sirve otro día?", opcionesDia());
      if (dia.hoy && new Date().getHours() >= neg.horaCierra - 2) return r("Hoy ya estamos por cerrar. ¿Se la dejo para otro día?", opcionesDia());
      st.cita.dia = dia; st.paso = "hora";
      var horas = neg.horasSugeridas.filter(function (hs) { return !dia.hoy || leerHora(norm(hs)).h > new Date().getHours(); });
      return r("Para " + dia.texto + " tengo libre a estas horas. ¿Cuál le acomoda?", horas.length ? horas : ["6:30 pm"]);
    }
    if (st.paso === "hora") {
      var ho = leerHora(n);
      if (!ho) return r("¿A qué hora le gustaría? Por ejemplo: **4:00 pm**.", neg.horasSugeridas);
      if (ho.h < neg.horaAbre || ho.h >= neg.horaCierra) return r("A esa hora estamos cerrados. Atendemos de **10:00 am a 8:00 pm**. ¿Otra hora?", neg.horasSugeridas);
      st.cita.hora = textoHora(ho); st.paso = "nombre";
      return r("Perfecto, " + st.cita.hora + ". ¿A nombre de quién la agendo?");
    }
    if (st.paso === "nombre") {
      st.nombre = nombreDe(t); st.paso = "confirmar";
      var c = st.cita;
      return r("Así queda su cita, **" + st.nombre + "**:\n✂️ " + c.servicio.nombre + " — " + $$(c.servicio.precio) + " · " + c.servicio.dura +
        "\n📅 " + c.dia.texto.charAt(0).toUpperCase() + c.dia.texto.slice(1) + " a las " + c.hora + "\n¿La confirmo?", ["Sí, confirmar", "Cambiar algo"]);
    }
    if (st.paso === "confirmar") {
      if (tiene(n, ["confirm", "dale", "correcto", "perfecto", "de una", "claro", "listo"]) || palabra(n, ["si", "ok", "va", "sip"])) return crearCita();
      if (tiene(n, ["cambiar", "corregir", "otra"]) || palabra(n, ["no"])) return iniciarCita(null);
      return r("¿Confirmo la cita?", ["Sí, confirmar", "Cambiar algo"]);
    }
    return null;
  }
  function crearCita() {
    var c = st.cita, nombre = st.nombre;
    citas++; st.paso = null; st.cita = null;
    return r(["¡Listo, **" + nombre + "**! ✅ Su cita quedó confirmada para **" + c.dia.texto + " a las " + c.hora + "**.",
      "Le mando un recordatorio 2 horas antes. Si le surge algo, me escribe por aquí y la movemos. ¡Lo esperamos! 💈"],
      ["Ver servicios y precios", "Formas de pago"], function () {
        UI.item({ num: c.hora.replace(" ", ""), titulo: nombre + " · " + c.servicio.nombre, detalle: c.dia.texto + " · " + c.servicio.dura, total: $$(c.servicio.precio), estado: "Confirmada" });
        UI.actividad("📅", "Cita guardada en el calendario del negocio");
        UI.actividad("💬", "Aviso al barbero por WhatsApp: **" + nombre + ", " + c.hora + "**");
        UI.actividad("⏰", "Recordatorio al cliente programado 2 h antes");
        pintarStats();
        UI.aviso("Nueva cita: **" + nombre + "** · " + c.hora);
      });
  }

  /* ---------- Respuestas generales ---------- */
  function lista() {
    if (neg.tipo === "pedido") {
      return r("Esta es la carta de hoy 🔥\n" + neg.items.map(function (i) { return "• **" + i.nombre + "** — " + $$(i.precio); }).join("\n") +
        "\n¿Qué le anoto? Puede escribirlo tal cual, por ejemplo: **2 churrascos y una yuca**.", ["Quiero la parrillada", "Quiero un churrasco", "Pollo a la brasa"]);
    }
    return r("Estos son nuestros servicios 💈\n" + neg.items.map(function (i) { return "• **" + i.nombre + "** — " + $$(i.precio) + " · " + i.dura; }).join("\n") +
      "\n¿Le agendo alguno?", ["Agendar corte + barba", "Agendar un fade", "Agendar una cita"]);
  }
  function humano() {
    st.fallos = 0;
    return r("Le paso con una persona del equipo 🙋. En horario de atención le responde en unos minutos. Mientras, ¿le ayudo con algo más?",
      neg.chipsInicio.slice(0, 3), function () { UI.actividad("🙋", "Conversación pasada a una persona del equipo"); });
  }
  function responder(t, n) {
    if (tiene(n, ["cancelar", "empezar de nuevo", "olvidalo"])) { st.paso = null; st.carrito = []; st.cita = null; return r("Listo, lo dejamos sin efecto. ¿En qué más le ayudo?", neg.chipsInicio); }
    if (tiene(n, ["persona", "humano", "asesor", "encargado", "hablar con alguien", "operador"])) return humano();
    if (st.paso) {
      var rp = neg.tipo === "pedido" ? pasoPedido(t, n) : pasoCita(t, n);
      if (rp) { st.fallos = 0; return rp; }
    }
    var enc = buscar(n), pregunta = tiene(n, ["cuanto", "precio", "cuesta", "vale", "costo", "tienen", "hay", "incluye"]);
    if (st.ultimo && (palabra(n, ["si", "sip", "dale"]) || tiene(n, ["anota", "agenda", "lo quiero", "la quiero"]))) {
      var ult = st.ultimo; st.ultimo = null;
      return neg.tipo === "pedido" ? agregar(ult) : iniciarCita(ult[0].it);
    }
    if (neg.tipo === "pedido") {
      if (enc.length && !pregunta) return agregar(enc);
      if (tiene(n, ["pedido", "pedir", "ordenar", "orden", "encargar"])) {
        st.paso = "carrito";
        return r("¡Con gusto! ¿Qué le gustaría pedir? Puede escribirlo tal cual, por ejemplo: **2 churrascos y una yuca**.", ["Quiero la parrillada", "Quiero un churrasco", "Ver la carta"]);
      }
    } else if (tiene(n, ["cita", "turno", "agend", "reserv", "apart", "espacio", "disponib"])) {
      return iniciarCita(enc.length ? enc[0].it : (tiene(n, ["corte"]) ? neg.items[0] : null));
    }
    for (var i = 0; i < neg.faq.length; i++) if (tiene(n, neg.faq[i].claves)) return r(neg.faq[i].respuesta, neg.faq[i].chips);
    if (enc.length) {
      st.ultimo = enc;
      var e = enc[0].it;
      return neg.tipo === "pedido"
        ? r("El **" + e.nombre + "** cuesta **" + $$(e.precio) + "** (" + e.desc + "). ¿Se lo anoto?", ["Sí, anótalo", "Ver la carta"])
        : r("**" + e.nombre + "**: " + $$(e.precio) + ", dura " + e.dura + ". ¿Se lo agendo?", ["Sí, agéndalo", "Ver servicios y precios"]);
    }
    if (tiene(n, ["carta", "menu", "que tienen", "que venden", "platos", "servicio", "precio", "lista", "que ofrecen", "que hacen", "cuanto"])) return lista();
    if (tiene(n, ["horario", "hora", "abren", "cierran", "abierto", "atienden", "dias"])) return r(neg.horario, neg.chipsInicio.slice(0, 2));
    if (tiene(n, ["donde", "direccion", "ubicacion", "ubicad", "llegar", "mapa"])) return r(neg.ubicacion, neg.chipsInicio.slice(0, 2));
    if (tiene(n, ["pago", "pagar", "tarjeta", "efectivo", "transferencia", "formas de pago"])) return r(neg.pago, neg.chipsInicio.slice(0, 2));
    if (tiene(n, ["gracias", "excelente", "genial", "chevere", "buenisimo"])) return r("¡A la orden! 🙌 Aquí estoy para lo que necesite.", neg.chipsInicio.slice(0, 2));
    if (tiene(n, ["hola", "buenas", "buenos", "buen dia", "saludos", "que tal"]) || palabra(n, ["hey", "ola"])) return r("¡Hola! 😊 ¿En qué le puedo ayudar?", neg.chipsInicio);
    st.fallos = (st.fallos || 0) + 1;
    if (st.paso === "carrito") return r("Ese no lo encuentro en la carta 🤔. ¿Le muestro lo que tenemos hoy?", ["Ver la carta", "Eso es todo"]);
    if (st.fallos >= 2) return humano();
    return r("Esa no la tengo clara todavía 🙏. Le puedo ayudar con esto, o si prefiere le paso con una persona:", neg.chipsInicio.concat(["Hablar con una persona"]));
  }

  /* ---------- Cola de mensajes con "escribiendo…" ---------- */
  function pintarStats() {
    var prom = tiempos.length ? tiempos.reduce(function (a, b) { return a + b; }, 0) / tiempos.length : null;
    UI.stats(conv, prom, neg.tipo === "pedido" ? $$(ventas) : String(citas));
  }
  function esperar(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function decir(resp, sesion) {
    cola = cola.then(function () {
      var p = Promise.resolve();
      resp.textos.forEach(function (txt, i) {
        p = p.then(function () {
          if (sesion !== st.sesion) return;
          UI.escribiendo(true);
          var ms = Math.min(1700, Math.max(650, 380 + txt.length * 11));
          if (i === 0) tiempos.push(ms / 1000);
          return esperar(ms).then(function () { if (sesion === st.sesion) { UI.escribiendo(false); UI.bot(txt); } });
        });
      });
      return p.then(function () {
        if (sesion !== st.sesion) return;
        UI.chips(resp.chips, recibir);
        if (resp.luego) resp.luego();
        pintarStats();
      });
    });
  }
  function recibir(texto) {
    texto = String(texto).trim();
    if (!texto) return;
    UI.yo(texto);
    UI.chips([]);
    if (!st.contado) { conv++; st.contado = true; pintarStats(); }
    decir(responder(texto, norm(texto)), st.sesion);
  }

  function iniciar(id) {
    neg = N[id] || N.brasa;
    st = { carrito: [], sesion: Math.random(), fallos: 0 };
    ventas = 0; citas = 0; tiempos = []; conv = 0;
    UI.preparar(neg);
    decir(r(neg.saludo, neg.chipsInicio), st.sesion);
  }

  document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var inp = document.getElementById("entrada");
    recibir(inp.value);
    inp.value = "";
    inp.focus();
  });
  document.getElementById("reiniciar").addEventListener("click", function () { iniciar(neg.id); });
  document.querySelectorAll(".opcion").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.negocio === neg.id) return;
      iniciar(b.dataset.negocio);
      history.replaceState(null, "", b.dataset.negocio === "navaja" ? "#barberia" : "#restaurante");
    });
  });

  window.DemoChat = { recibir: recibir, iniciar: iniciar, estado: function () { return st; } };
  iniciar(/barberia|navaja|cita/.test(location.hash) ? "navaja" : "brasa");
})();
