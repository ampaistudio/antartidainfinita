(function () {
  "use strict";

  var data = window.AI_CONTENT;
  if (!data) return;

  var langKey = "ai_lang";
  var themeKey = "ai_theme";
  var fontKey = "ai_font_scale";

  var currentLang = localStorage.getItem(langKey) || data.language || "es";
  var currentTheme = localStorage.getItem(themeKey) || data.theme || "dark";
  var currentFont = localStorage.getItem(fontKey) || data.fontScale || "normal";

  function t(key) {
    var dict = data.i18n[currentLang] || data.i18n.es;
    return dict[key] || key;
  }

  function setHtmlState() {
    document.documentElement.setAttribute("lang", currentLang);
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.documentElement.setAttribute("data-font-scale", currentFont);
  }

  function renderI18n() {
    var nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      var value = t(key);
      if (value.indexOf("<br>") > -1) {
        node.innerHTML = value;
      } else {
        node.textContent = value;
      }
    });
  }

  function renderStats() {
    var grid = document.getElementById("stats-grid");
    if (!grid) return;
    grid.innerHTML = "";
    data.shared.stats.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "stat";
      card.innerHTML =
        '<div class="stat-number">' + item.value + "</div>" +
        '<div class="stat-label">' + t(item.key) + "</div>";
      grid.appendChild(card);
    });
  }

  function renderRoute() {
    var pointsWrap = document.getElementById("route-points");
    var listWrap = document.getElementById("route-list");
    if (!pointsWrap || !listWrap) return;

    pointsWrap.innerHTML = "";
    data.shared.routePoints.forEach(function (point, index) {
      var pointNode = document.createElement("div");
      pointNode.className = "ruta-point";
      pointNode.innerHTML =
        '<div class="ruta-dot' + (point.highlight ? " highlight" : "") + '"></div>' +
        "<div>" +
        '<div class="ruta-name">' + t(point.nameKey) + "</div>" +
        '<div class="ruta-coord">' + t(point.coordKey) + "</div>" +
        "</div>";
      pointsWrap.appendChild(pointNode);

      if (index < data.shared.routePoints.length - 1) {
        var connector = document.createElement("div");
        connector.className = "ruta-connector";
        pointsWrap.appendChild(connector);
      }
    });

    listWrap.innerHTML = "";
    data.shared.routeList.forEach(function (itemKey) {
      var li = document.createElement("li");
      li.textContent = t(itemKey);
      listWrap.appendChild(li);
    });
  }

  function renderTeam() {
    var wrap = document.getElementById("team-grid");
    if (!wrap) return;
    wrap.innerHTML = "";
    data.shared.team.forEach(function (member) {
      var card = document.createElement("article");
      card.className = "team-card";
      card.innerHTML =
        '<div class="team-number">' + member.number + "</div>" +
        '<div class="team-head">' +
        '<img class="team-photo" src="' + member.image + '" alt="' + t(member.nameKey) + '">' +
        "<div>" +
        '<h3 class="team-name">' + t(member.nameKey) + "</h3>" +
        '<p class="team-role">' + t(member.roleKey) + "</p>" +
        "</div>" +
        "</div>" +
        '<p class="team-bio">' + t(member.bioKey) + "</p>";
      wrap.appendChild(card);
    });
  }

  function renderPress() {
    var wrap = document.getElementById("press-grid");
    if (!wrap) return;
    wrap.innerHTML = "";
    data.shared.press.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "press-card";
      card.innerHTML =
        '<h3 class="press-title">' + item.title + "</h3>" +
        '<p class="press-meta">' + item.source + " · " + item.date + "</p>" +
        '<p class="press-summary">' + item.summary + "</p>" +
        '<a class="press-link" href="' + item.url + '" target="_blank" rel="noopener noreferrer">Ver articulo</a>';
      wrap.appendChild(card);
    });
  }

  function renderInstagram() {
    var wrap = document.getElementById("instagram-grid");
    if (!wrap) return;
    wrap.innerHTML = "";
    data.shared.instagram.forEach(function (url) {
      var block = document.createElement("blockquote");
      block.className = "instagram-media";
      block.setAttribute("data-instgrm-permalink", url);
      block.setAttribute("data-instgrm-version", "14");
      block.innerHTML = '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + "</a>";
      wrap.appendChild(block);
    });

    if (data.shared.instagram.length > 0) {
      var scriptId = "instagram-embed-script";
      if (!document.getElementById(scriptId)) {
        var script = document.createElement("script");
        script.id = scriptId;
        script.async = true;
        script.src = "https://www.instagram.com/embed.js";
        document.body.appendChild(script);
      } else if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    }
  }

  function renderSponsors() {
    var track = document.getElementById("sponsor-track");
    if (!track) return;
    track.innerHTML = "";

    var sponsors = data.shared.sponsors.slice();
    sponsors.forEach(function (item) {
      var anchor = document.createElement("a");
      anchor.className = "sponsor-item";
      anchor.href = item.url || "#";
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.setAttribute("aria-label", item.name);
      anchor.innerHTML = '<img src="' + item.logo + '" alt="' + item.name + '">';
      track.appendChild(anchor);
    });

    if (sponsors.length > 2) {
      sponsors.forEach(function (item) {
        var clone = document.createElement("a");
        clone.className = "sponsor-item";
        clone.href = item.url || "#";
        clone.target = "_blank";
        clone.rel = "noopener noreferrer";
        clone.setAttribute("aria-label", item.name + " clone");
        clone.setAttribute("aria-hidden", "true");
        clone.innerHTML = '<img src="' + item.logo + '" alt="">';
        track.appendChild(clone);
      });
      track.classList.add("is-animated");
    } else {
      track.classList.remove("is-animated");
    }
  }

  function applyHeroMedia() {
    var video = document.getElementById("hero-video");
    var image = document.getElementById("hero-image");
    if (!video || !image) return;

    image.src = data.heroMedia.image;
    if (data.heroMedia.video) {
      video.src = data.heroMedia.video;
      video.classList.add("is-visible");
      video.addEventListener("error", function () {
        video.classList.remove("is-visible");
      });
    } else {
      video.classList.remove("is-visible");
    }
  }

  function applyButtonsState() {
    document.getElementById("lang-es").classList.toggle("active", currentLang === "es");
    document.getElementById("lang-en").classList.toggle("active", currentLang === "en");
    document.getElementById("font-normal").classList.toggle("active", currentFont === "normal");
    document.getElementById("font-large").classList.toggle("active", currentFont === "large");
    document.getElementById("font-xl").classList.toggle("active", currentFont === "xl");
  }

  function bindNavMenu() {
    var button = document.getElementById("menu-toggle");
    var links = document.getElementById("nav-links");
    if (!button || !links) return;

    button.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("is-open");
      });
    });
  }

  function bindControls() {
    document.getElementById("lang-es").addEventListener("click", function () {
      currentLang = "es";
      localStorage.setItem(langKey, currentLang);
      renderAll();
    });
    document.getElementById("lang-en").addEventListener("click", function () {
      currentLang = "en";
      localStorage.setItem(langKey, currentLang);
      renderAll();
    });
    document.getElementById("theme-toggle").addEventListener("click", function () {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem(themeKey, currentTheme);
      renderAll();
    });
    document.getElementById("font-normal").addEventListener("click", function () {
      currentFont = "normal";
      localStorage.setItem(fontKey, currentFont);
      renderAll();
    });
    document.getElementById("font-large").addEventListener("click", function () {
      currentFont = "large";
      localStorage.setItem(fontKey, currentFont);
      renderAll();
    });
    document.getElementById("font-xl").addEventListener("click", function () {
      currentFont = "xl";
      localStorage.setItem(fontKey, currentFont);
      renderAll();
    });
  }

  function renderIce() {
    var field = document.getElementById("iceField");
    if (!field) return;
    field.innerHTML = "";
    for (var i = 0; i < 35; i += 1) {
      var dot = document.createElement("div");
      dot.className = "ice-dot";
      var size = Math.random() * 4 + 1;
      dot.style.cssText =
        "width:" + size + "px;" +
        "height:" + size + "px;" +
        "left:" + (Math.random() * 100) + "%;" +
        "bottom:" + (Math.random() * -20) + "%;" +
        "animation-duration:" + (Math.random() * 15 + 10) + "s;" +
        "animation-delay:" + (Math.random() * 10) + "s;";
      field.appendChild(dot);
    }
  }

  function renderAll() {
    setHtmlState();
    renderI18n();
    renderStats();
    renderRoute();
    renderTeam();
    renderPress();
    renderInstagram();
    renderSponsors();
    applyHeroMedia();
    applyButtonsState();
  }

  bindNavMenu();
  bindControls();
  renderAll();
  renderIce();
})();
