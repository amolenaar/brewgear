$(document).bind('mobileinit', function() {
  console.log('javascript mobile init');
  opt = $.mobile; //page.prototype.options
  opt.defaultPageTransition = 'slide';
  opt.loadingMessage = 'Laden...';

  // disable default interactions:
  opt.ajaxEnabled = false;
  opt.pushStateEnabled = false;
  opt.linkBindingEnabled = false;
  opt.hashListeningEnabled = false;
});
