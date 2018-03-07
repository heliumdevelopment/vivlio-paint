var app;

(function(){
  app = new Gates;

  app.defaultTemplate('templates/basic');

  app.options({
    transition: 'fade',
    transitionSpeed: 300
  });

  // This should be 'gates'
  // Add a catch-all, without having to define
  app.routes(['/about', '/contact']);

  app.gate('/about', 'about');
  app.gate('/', 'home');
  app.gate('about');
  app.gate('account');

  app.gate('/blog', 'blog', 'templates/minimal');
})();
