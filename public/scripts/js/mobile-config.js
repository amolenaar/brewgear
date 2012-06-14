$(document).bind('mobileinit', function() {
  console.log('javascript mobile init');
  opt = $.mobile;
//  opt.defaultPageTransition = 'slide';
//  opt.loadingMessage = 'Laden...';

  //opt.autoInitializePage = false;

  // disable default interactions:
  opt.ajaxEnabled = false;
  opt.pushStateEnabled = false;
  opt.linkBindingEnabled = false;
  opt.hashListeningEnabled = false;

  opt.changePage.defaults.changeHash = false
});
