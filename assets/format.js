// Nederlandse formattering — euro, percentage, uren, weken.

window.PA = window.PA || {};

window.PA.format = (function () {
  var euroFmt = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  var nlFmt = new Intl.NumberFormat("nl-NL");

  return {
    euro: function (v) {
      return euroFmt.format(v);
    },
    percent: function (v) {
      // Toon negatieve waarden met een typografische minus.
      var s = Math.round(v).toString();
      if (s.charAt(0) === "-") s = "−" + s.slice(1);
      return s + "%";
    },
    uren: function (v) {
      return nlFmt.format(v) + " uur";
    },
    weken: function (v) {
      return v === 1 ? "1 week" : v + " weken";
    },
  };
})();
