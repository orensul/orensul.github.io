(function () {
  var STATS_URL = "/scholar-stats.json";

  function formatUpdated(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function renderStat(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = (value == null || isNaN(value)) ? "—" : value;
  }

  function renderChart(container, perYear) {
    if (!container) return;
    container.innerHTML = "";

    var entries = Object.keys(perYear || {})
      .map(function (y) { return { year: parseInt(y, 10), count: perYear[y] }; })
      .filter(function (e) { return !isNaN(e.year); })
      .sort(function (a, b) { return a.year - b.year; });

    if (entries.length === 0) {
      var empty = document.createElement("div");
      empty.className = "scholar-chart-empty";
      empty.textContent = "Per-year breakdown will appear after the next scheduled update.";
      container.appendChild(empty);
      return;
    }

    var max = entries.reduce(function (m, e) { return Math.max(m, e.count); }, 0) || 1;

    entries.forEach(function (e) {
      var col = document.createElement("div");
      col.className = "scholar-bar-col";

      var barWrap = document.createElement("div");
      barWrap.className = "scholar-bar-wrap";

      var count = document.createElement("span");
      count.className = "scholar-bar-count";
      count.textContent = e.count;
      barWrap.appendChild(count);

      var bar = document.createElement("div");
      bar.className = "scholar-bar";
      bar.style.height = (Math.round((e.count / max) * 100)) + "%";
      bar.setAttribute("title", e.year + ": " + e.count + " citations");
      barWrap.appendChild(bar);

      col.appendChild(barWrap);

      var label = document.createElement("div");
      label.className = "scholar-bar-label";
      label.textContent = e.year;
      col.appendChild(label);

      container.appendChild(col);
    });
  }

  function render(stats) {
    renderStat("scholar-citations", stats.total_citations);
    renderStat("scholar-hindex", stats.h_index);
    renderStat("scholar-i10", stats.i10_index);

    var updatedEl = document.getElementById("scholar-updated");
    if (updatedEl) {
      var pretty = formatUpdated(stats.updated);
      updatedEl.textContent = pretty ? "Updated " + pretty : "";
    }

    renderChart(document.getElementById("scholar-chart"), stats.citations_per_year);
  }

  function init() {
    if (!document.getElementById("scholar-card")) return;
    fetch(STATS_URL, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(render)
      .catch(function (err) {
        console.warn("Failed to load Scholar stats:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
