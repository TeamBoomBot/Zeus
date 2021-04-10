(function ($) {
  "use strict";
  AOS.init();
})(jQuery);

$(function () {
  $('[data-toggle="popover"]').popover();
});

$(window).on("load", function () {
  $(".loader-wrapper").fadeOut("fast");
});
