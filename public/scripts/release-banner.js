// Site banner: counts down to the 3.0 release, then announces it.
// To move the date or change the wording, edit RELEASE below and nothing else.
(function () {
  var RELEASE = {
    date: '2026-09-15T00:00:00',
    before: function (days) {
      var when = days === 1 ? 'tomorrow' : 'in ' + days + ' days';
      return 'Jjodel 3.0 lands on 15 September, ' + when +
        '. <a href="/whats-new/">See what is coming</a>.';
    },
    after: 'Jjodel 3.0 is out. <a href="/whats-new/">See what is new</a>.'
  };

  function render() {
    var slot = document.querySelector('.sl-banner');
    if (!slot) return;
    var now = new Date();
    var target = new Date(RELEASE.date);
    var days = Math.ceil((target - now) / 86400000);
    slot.innerHTML = days > 0 ? RELEASE.before(days) : RELEASE.after;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
