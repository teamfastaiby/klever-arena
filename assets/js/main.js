/* Клевер Арена — меню, скролл-видео, 3D-наклон, FAQ, заявка в WhatsApp */
(function () {
  "use strict";

  var WA = "375291265836"; // +375 (29) 126-58-36

  /* шапка */
  var hdr = document.querySelector(".hdr");
  function onScroll() {
    if (!hdr) return;
    if (window.scrollY > 24) hdr.classList.add("is-stuck");
    else hdr.classList.remove("is-stuck");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* мобильное меню */
  var burger = document.getElementById("burger"), drawer = document.getElementById("drawer"), dclose = document.getElementById("drawerClose");
  function setDrawer(open) {
    if (!drawer) return;
    drawer.setAttribute("data-open", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setDrawer(true); });
  if (dclose) dclose.addEventListener("click", function () { setDrawer(false); });
  if (drawer) drawer.addEventListener("click", function (e) { if (e.target === drawer) setDrawer(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });

  /* появление блоков */
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && rv.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* скролл-видео: прокрутка управляет временем */
  var scrolly = document.querySelector(".scrolly");
  var scrub = document.querySelector(".scrolly__video");
  var bar = document.querySelector(".scrolly__bar i");
  if (scrolly && scrub) {
    var duration = 0, ready = false, target = 0, current = 0, raf = null;

    function measure() { if (isFinite(scrub.duration) && scrub.duration > 0) { duration = scrub.duration; ready = true; } }
    scrub.addEventListener("loadedmetadata", measure);
    scrub.addEventListener("canplay", measure);
    measure();

    function progress() {
      var r = scrolly.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -r.top / total));
    }

    function tick() {
      raf = null;
      if (!ready) return;
      var p = progress();
      if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
      target = p * (duration - 0.06);
      current += (target - current) * 0.16;
      if (Math.abs(target - current) < 0.01) current = target;
      try { if (Math.abs(scrub.currentTime - current) > 0.02) scrub.currentTime = current; } catch (e) {}
      if (Math.abs(target - current) > 0.005) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    scrub.addEventListener("loadedmetadata", kick);
    scrub.addEventListener("canplay", kick);
    kick();

    /* если браузер не даёт скрабить — просто пусть играет по кругу */
    scrub.addEventListener("error", function () { scrub.setAttribute("loop", ""); scrub.play().catch(function () {}); });
  }

  /* 3D-наклон карточек */
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (fine) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "translateY(-6px) rotateX(" + (-py * 7).toFixed(2) + "deg) rotateY(" + (px * 7).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* FAQ */
  document.querySelectorAll(".faq__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq__i");
      var open = item.getAttribute("data-open") === "true";
      item.parentElement.querySelectorAll('.faq__i[data-open="true"]').forEach(function (o) { if (o !== item) o.setAttribute("data-open", "false"); });
      item.setAttribute("data-open", open ? "false" : "true");
      q.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  /* заявка -> WhatsApp */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (id) { var el = document.getElementById(id); return el ? String(el.value || "").trim() : ""; };
      var labels = { name: "Имя", phone: "Телефон", what: "Что интересует", when: "Когда", message: "Комментарий" };
      var lines = ["Заявка на сайте «Клевер Арена»:"];
      Object.keys(labels).forEach(function (k) {
        var v = get("f-" + k);
        if (v) lines.push(labels[k] + ": " + v);
      });
      var extra = form.getAttribute("data-form");
      if (extra) lines.push(extra);
      var out = form.querySelector(".formout");
      if (out) out.textContent = "Открываем WhatsApp с готовым сообщением…";
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n")), "_blank");
      if (out) out.textContent = "Открыли WhatsApp — останется нажать «Отправить». Если срочно, звоните: +375 (29) 126-58-36.";
    });
  });

  /* подсветка активного пункта меню */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a, .drawer a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path) a.setAttribute("aria-current", "page");
  });
})();
