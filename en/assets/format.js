// American-English formatting — euro, percent, hours, weeks.
// Amounts stay in euro (the company is Dutch) but use en-US grouping.

window.PA = window.PA || {};

window.PA.format = (function () {
  var euroFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  var usFmt = new Intl.NumberFormat("en-US");

  return {
    euro: function (v) {
      return euroFmt.format(v);
    },
    percent: function (v) {
      // Show negative values with a typographic minus.
      var s = Math.round(v).toString();
      if (s.charAt(0) === "-") s = "−" + s.slice(1);
      return s + "%";
    },
    uren: function (v) {
      return usFmt.format(v) + " hrs";
    },
    weken: function (v) {
      return v === 1 ? "1 week" : v + " weeks";
    },
  };
})();
