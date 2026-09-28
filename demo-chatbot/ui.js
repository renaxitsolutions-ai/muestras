/* Pintado del chat y del panel del dueño. La lógica de la conversación vive en motor.js. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var WA = "https://api.whatsapp.com/send?phone=18293689630&text=" +
    encodeURIComponent("Hola Jeremy, probé la demo del chatbot y quiero uno para mi negocio");

  function escapar(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function formato(t) {
    return escapar(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  }
  function hora() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" : "") + m + " " + ap;
  }
  function bajar() {
    var c = $("mensajes");
    c.scrollTop = c.scrollHeight;
  }
  function burbuja(clase, html) {
    var d = document.createElement("div");
    d.className = "msg " + clase;
    d.innerHTML = html;
    $("mensajes").appendChild(d);
    bajar();
    return d;
  }

  var UI = {
    dinero: function (n, neg) {
      var s = "$" + n.toLocaleString("en-US", { minimumFractionDigits: neg.decimales, maximumFractionDigits: neg.decimales });
      return neg.moneda === "USD" ? s : s + " " + neg.moneda;
    },
    hora: hora,

    preparar: function (neg) {
      $("avatar").textContent = neg.iniciales;
      $("negocioNombre").textContent = neg.nombre;
      $("estado").textContent = "en línea";
      $("mensajes").innerHTML = "";
      $("chips").innerHTML = "";
      $("panelTitulo").textContent = neg.panel.titulo;
      $("listaTitulo").textContent = neg.panel.lista;
      $("statVentaTxt").textContent = neg.panel.venta;
      $("lista").innerHTML = '<li class="vacio">' + escapar(neg.panel.vacio) + "</li>";
      $("actividad").innerHTML = '<li class="vacio">Aquí verá lo que el asistente hace solo: anotar, avisar y recordar.</li>';
      UI.stats(0, null, neg.tipo === "pedido" ? UI.dinero(0, neg) : "0");
      document.querySelectorAll(".opcion").forEach(function (b) {
        b.setAttribute("aria-selected", b.dataset.negocio === neg.id ? "true" : "false");
      });
    },

    bot: function (texto) {
      burbuja("msg--bot", formato(texto) + '<span class="hora">' + hora() + "</span>");
    },
    yo: function (texto) {
      burbuja("msg--yo", formato(texto) + '<span class="hora">' + hora() + " ✓✓</span>");
    },
    sistema: function (texto) {
      burbuja("msg--sistema", formato(texto));
    },

    escribiendo: function (on) {
      var viejo = $("escribiendo");
      if (viejo) viejo.remove();
      $("estado").textContent = on ? "escribiendo…" : "en línea";
      if (on) {
        var d = document.createElement("div");
        d.className = "escribiendo";
        d.id = "escribiendo";
        d.innerHTML = "<i></i><i></i><i></i>";
        $("mensajes").appendChild(d);
        bajar();
      }
    },

    chips: function (lista, alTocar) {
      var c = $("chips");
      c.innerHTML = "";
      (lista || []).forEach(function (txt) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "chip";
        b.textContent = txt;
        b.addEventListener("click", function () { alTocar(txt); });
        c.appendChild(b);
      });
    },

    stats: function (conv, resp, venta) {
      $("statConv").textContent = conv;
      $("statResp").textContent = resp == null ? "—" : resp.toFixed(1) + " s";
      var v = $("statVenta");
      if (v.textContent !== String(venta)) {
        v.textContent = venta;
        v.parentNode.classList.add("sube");
        setTimeout(function () { v.parentNode.classList.remove("sube"); }, 1200);
      }
    },

    item: function (o) {
      var l = $("lista"), vacio = l.querySelector(".vacio");
      if (vacio) vacio.remove();
      l.querySelectorAll(".nuevo").forEach(function (x) { x.classList.remove("nuevo"); });
      var li = document.createElement("li");
      li.className = "item nuevo";
      li.innerHTML = '<span class="item__num">' + escapar(o.num) + "</span>" +
        '<div class="item__det"><b>' + escapar(o.titulo) + "</b><small>" + escapar(o.detalle) + "</small></div>" +
        '<div class="item__tot">' + escapar(o.total) + "<small>" + escapar(o.estado) + "</small></div>";
      l.insertBefore(li, l.firstChild);
    },

    actividad: function (icono, texto) {
      var l = $("actividad"), vacio = l.querySelector(".vacio");
      if (vacio) vacio.remove();
      var li = document.createElement("li");
      li.className = "act";
      li.innerHTML = '<span class="act__ico" aria-hidden="true">' + icono + "</span><span>" + formato(texto) +
        "</span><time>" + hora() + "</time>";
      l.insertBefore(li, l.firstChild);
      while (l.children.length > 6) l.lastChild.remove();
    },

    aviso: function (texto) {
      var a = $("aviso");
      a.innerHTML = "<span>" + formato(texto) + '</span><a href="#panel">Ver panel ↓</a>';
      a.hidden = false;
      clearTimeout(UI._t);
      UI._t = setTimeout(function () { a.hidden = true; }, 6000);
    }
  };

  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = WA;
    a.target = "_blank";
    a.rel = "noopener";
  });
  $("aviso").addEventListener("click", function () { $("aviso").hidden = true; });

  window.UI = UI;
})();
