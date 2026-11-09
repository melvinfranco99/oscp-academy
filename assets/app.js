/* OSCP Academy — motor común: navegación, tema, progreso, cuestionarios, terminal animada */
const NAV = [
  {sec:"Inicio"},
  {id:"index", f:"index.html", t:"Portada y ruta", n:"★"},
  {id:"como-estudiar", f:"como-estudiar.html", t:"Cómo estudiar este curso", n:"?"},
  {sec:"Nivel 1 · Bases"},
  {id:"m00", f:"m00-fundamentos.html", t:"Fundamentos de ciberseguridad", n:"0"},
  {id:"m01", f:"m01-linux.html", t:"Linux esencial", n:"1"},
  {id:"m02", f:"m02-windows.html", t:"Windows esencial", n:"2"},
  {id:"m03", f:"m03-redes.html", t:"Redes desde cero", n:"3"},
  {id:"m04", f:"m04-scripting.html", t:"Bash, Python y PowerShell", n:"4"},
  {sec:"Nivel 2 · Pentesting"},
  {id:"m05", f:"m05-metodologia.html", t:"Metodología y reconocimiento", n:"5"},
  {id:"m06", f:"m06-enumeracion.html", t:"Escaneo y enumeración", n:"6"},
  {id:"m07", f:"m07-web.html", t:"Vulnerabilidades web", n:"7"},
  {id:"m08", f:"m08-explotacion.html", t:"Explotación y shells", n:"8"},
  {id:"m09", f:"m09-contrasenas.html", t:"Contraseñas y hashes", n:"9"},
  {sec:"Nivel 3 · Nivel OSCP"},
  {id:"m10", f:"m10-privesc-linux.html", t:"Escalada en Linux", n:"10"},
  {id:"m11", f:"m11-privesc-windows.html", t:"Escalada en Windows", n:"11"},
  {id:"m12", f:"m12-active-directory.html", t:"Active Directory", n:"12"},
  {id:"m13", f:"m13-pivoting.html", t:"Pivoting y túneles", n:"13"},
  {sec:"Nivel 4 · Examen"},
  {id:"m14", f:"m14-reporte.html", t:"Cómo hacer el reporte", n:"14"},
  {id:"plantilla", f:"plantilla-reporte.html", t:"Plantilla de reporte", n:"📄"},
  {id:"m15", f:"m15-examen.html", t:"Estrategia del examen", n:"15"},
  {id:"simulacro", f:"simulacro.html", t:"Simulacro final", n:"🏁"},
  {sec:"Referencia"},
  {id:"glosario", f:"glosario.html", t:"Glosario y comandos", n:"📖"},
  {id:"recursos", f:"recursos.html", t:"Vídeos, labs y recursos", n:"🎬"},
];
const MODS = NAV.filter(x => x.id && /^m\d+/.test(x.id));

const store = {
  get(k, d){ try{ const v = localStorage.getItem("oscp:"+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
  set(k, v){ try{ localStorage.setItem("oscp:"+k, JSON.stringify(v)); }catch(e){} }
};

(function theme(){
  const t = store.get("theme", null);
  if (t) document.documentElement.setAttribute("data-theme", t);
})();

function esc(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

function buildLayout(){
  const page = document.body.dataset.page || "index";
  const main = document.querySelector("main");
  const done = store.get("done", {});
  const top = document.createElement("header");
  top.className = "topbar";
  const nDone = MODS.filter(m => done[m.id]).length;
  top.innerHTML = `
    <button class="iconbtn" id="menuBtn" aria-label="Menú">☰</button>
    <a class="brand" href="index.html"><span class="logo">⌁</span>OSCP Academy</a>
    <span class="sp"></span>
    <span class="progress-pill" title="Módulos completados">✔ ${nDone}/${MODS.length} módulos</span>
    <a class="iconbtn" href="glosario.html" title="Glosario" style="display:grid;place-items:center;text-decoration:none">📖</a>
    <button class="iconbtn" id="themeBtn" title="Cambiar tema">◐</button>`;
  const side = document.createElement("nav");
  side.className = "side"; side.id = "side";
  side.innerHTML = NAV.map(x => x.sec ? `<h4>${x.sec}</h4>` :
    `<a href="${x.f}" class="${x.id===page?"active":""} ${done[x.id]?"done":""}"><span class="num">${x.n}</span>${x.t}</a>`).join("");
  const wrap = document.createElement("div");
  wrap.className = "wrap";
  main.parentNode.insertBefore(wrap, main);
  wrap.appendChild(side); wrap.appendChild(main);
  document.body.insertBefore(top, wrap);
  document.getElementById("menuBtn").onclick = () => side.classList.toggle("open");
  document.getElementById("themeBtn").onclick = () => {
    const cur = document.documentElement.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nx = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nx); store.set("theme", nx);
  };
  const act = side.querySelector(".active"); if (act) act.scrollIntoView({block:"center"});

  // pager + marcar completado
  const flat = NAV.filter(x => x.id);
  const i = flat.findIndex(x => x.id === page);
  if (i >= 0 && page !== "index"){
    if (/^m\d+/.test(page)){
      const db = document.createElement("div");
      db.className = "donebar";
      const set = () => { db.innerHTML = store.get("done",{})[page]
        ? `<span class="good">✔ Módulo marcado como completado</span><button class="btn alt">Desmarcar</button>`
        : `<span>¿Has leído el tema y hecho los cuestionarios?</span><button class="btn">Marcar como completado</button>`;
        db.querySelector("button").onclick = () => { const d = store.get("done",{}); d[page] = !d[page]; store.set("done", d); set(); }; };
      set(); main.appendChild(db);
    }
    const pg = document.createElement("div"); pg.className = "pager";
    const p = flat[i-1], n = flat[i+1];
    pg.innerHTML = (p?`<a href="${p.f}"><small>← Anterior</small>${p.t}</a>`:"<span></span>") +
                   (n?`<a class="next" href="${n.f}"><small>Siguiente →</small>${n.t}</a>`:"<span></span>");
    main.appendChild(pg);
  }
}

function copyButtons(){
  document.querySelectorAll("pre").forEach(pre => {
    if (pre.dataset.nocopy !== undefined) return;
    const b = document.createElement("button"); b.className = "copy"; b.textContent = "copiar";
    b.onclick = () => {
      const txt = pre.innerText.replace(/^copiar$/m, "").trim();
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
        () => { b.textContent = "¡copiado!"; setTimeout(() => b.textContent = "copiar", 1300); },
        () => { b.textContent = "selecciona y copia"; });
    };
    pre.appendChild(b);
  });
}

/* Terminal animada: <div class="term" data-title="..."><script type="text/plain">líneas</script></div>
   Líneas que empiezan por "$ " o "# " o "PS> " se escriben como comando; "//" como comentario. */
function terminals(){
  document.querySelectorAll(".term").forEach(t => {
    const src = t.querySelector("script");
    const lines = (src ? src.textContent : "").replace(/^\n/, "").replace(/\s+$/, "").split("\n");
    t.innerHTML = `<div class="bar"><i></i><i></i><i></i><span>${esc(t.dataset.title||"terminal")}</span><button>▶ Reproducir</button></div><div class="screen"><span class="cursor"></span></div>`;
    const screen = t.querySelector(".screen"), btn = t.querySelector("button");
    let running = false;
    btn.onclick = async () => {
      if (running) return; running = true; btn.textContent = "⏵ …"; screen.innerHTML = "";
      for (const L of lines){
        const m = L.match(/^(\$ |# |PS> |kali@kali:~\$ )(.*)$/);
        const div = document.createElement("div"); screen.appendChild(div);
        if (m){
          div.innerHTML = `<span class="p">${esc(m[1])}</span>`;
          const s = document.createElement("span"); div.appendChild(s);
          for (const ch of m[2]){ s.textContent += ch; await new Promise(r => setTimeout(r, 28)); }
          await new Promise(r => setTimeout(r, 350));
        } else if (L.startsWith("//")){
          div.innerHTML = `<span class="c">${esc(L)}</span>`; await new Promise(r => setTimeout(r, 250));
        } else { div.textContent = L; await new Promise(r => setTimeout(r, 70)); }
      }
      screen.insertAdjacentHTML("beforeend", '<span class="cursor"></span>');
      running = false; btn.textContent = "↻ Repetir";
    };
  });
}

/* Cuestionarios: <div class="quiz" data-id="x"></div> + window.QUIZ = { x: {title, qs:[...] } }
   pregunta tipo test:  {q, o:[...], a:índice, e:"explicación"}
   pregunta abierta:   {q, t:1, a:["respuesta", "alternativa"], e} */
function quizzes(){
  const Q = window.QUIZ || {};
  document.querySelectorAll(".quiz").forEach(box => {
    const id = box.dataset.id, data = Q[id]; if (!data) return;
    const page = document.body.dataset.page;
    const key = "best:" + page + ":" + id;
    box.className = "quizbox";
    box.innerHTML = `<h3>📝 ${esc(data.title)}</h3><p style="color:var(--muted);margin-top:0">${data.qs.length} preguntas · mejor nota: <b class="bestv">${store.get(key, "—")}</b></p>` +
      data.qs.map((q, qi) => `<div class="q" data-i="${qi}"><div class="qt">${qi+1}. ${q.q}</div>` +
        (q.t ? `<input type="text" placeholder="Escribe tu respuesta">` :
          q.o.map((o, oi) => `<label><input type="radio" name="${id}-${qi}" value="${oi}"><span>${o}</span></label>`).join("")) +
        `<div class="exp">${q.e || ""}</div></div>`).join("") +
      `<div style="margin-top:14px"><button class="btn chk">Corregir</button> <button class="btn alt rst">Reiniciar</button><span class="score"></span></div>`;
    box.querySelector(".chk").onclick = () => {
      let ok = 0;
      box.querySelectorAll(".q").forEach(qd => {
        const q = data.qs[+qd.dataset.i]; let right = false;
        if (q.t){
          const v = qd.querySelector("input").value.trim().toLowerCase().replace(/\s+/g," ");
          right = q.a.some(a => v === String(a).toLowerCase() || (v.length > 2 && v.includes(String(a).toLowerCase())));
          qd.querySelector(".exp").innerHTML = (right ? "✅ " : "❌ Respuesta esperada: <b>" + esc(q.a[0]) + "</b>. ") + (q.e || "");
        } else {
          const sel = qd.querySelector("input:checked");
          qd.querySelectorAll("label").forEach((l, li) => { l.classList.remove("right","wrong");
            if (li === q.a) l.classList.add("right");
            else if (sel && +sel.value === li) l.classList.add("wrong"); });
          right = sel && +sel.value === q.a;
          qd.querySelector(".exp").innerHTML = (right ? "✅ " : "❌ ") + (q.e || "");
        }
        if (right) ok++;
        qd.classList.add("show");
      });
      const pct = Math.round(ok * 100 / data.qs.length);
      box.querySelector(".score").innerHTML = `${ok}/${data.qs.length} (${pct}%) ` + (pct >= 70 ? '<span class="good">¡Aprobado!</span>' : '<span class="bad">Repasa el tema y repite</span>');
      const prev = parseInt(store.get(key, "0")) || 0;
      if (pct > prev){ store.set(key, pct + "%"); box.querySelector(".bestv").textContent = pct + "%"; }
    };
    box.querySelector(".rst").onclick = () => {
      box.querySelectorAll(".q").forEach(qd => { qd.classList.remove("show");
        qd.querySelectorAll("label").forEach(l => l.classList.remove("right","wrong"));
        qd.querySelectorAll("input").forEach(i => { if (i.type === "radio") i.checked = false; else i.value = ""; }); });
      box.querySelector(".score").textContent = "";
    };
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildLayout(); terminals(); copyButtons(); quizzes();
  if (window.pageInit) window.pageInit();
});
