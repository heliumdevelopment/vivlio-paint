/*
 Gates
 Author: Nick Mealey
*/
(function($){
  if (!$){
    throw "Gates requires jQuery as a dependency";
  }
  
  // Format route
  function formatRoute(route) {
    return "/" + route.replace(/^\//, "");
  }
  
  // Template object
  function Template(path){
    this.path = path;
  }
  
  // Create a new gate
  function Gate(route, path, template){
    // The input route
    this.route = formatRoute(route);
    
    // The path to the view
    this.path = path;
    
    // The path to the teplate file
    this.template =  template;

  }
  
  // Main Gates contructor
  Gates = function(){
    // Self object
    self = this;
    
    // Default options
    this.defaults = {
      extension: ".html",
      viewsPath: "views/",
      transitionSpeed: 300,
      transition: false
    };
    
    // Set options
    this.options = function(options){
      if(options){
        return $.extend(self.defaults, options);
      }
    }
    
    // A collection of gates
    this.gates = [];
    
    // The current template being displayed
    this.activeTemplate;
    
    // Set base template
    this.defaultTemplate = function(template){
      if(template){
        self.template = new Template(template);
      }
      
      return self.template;
    };
    
    // Formates true path of a route
    function formatPath(route){
      return route + self.defaults.extension;
    }
    
    // Create a gate
    this.gate = function(route, path, template){
      // Format the route
      route = formatRoute(route);
      
      // Check if a template was given, if not set from default
      if(template){
        template = new Template(template);
      } else {
        template = self.defaultTemplate();
      }
      
      if(!path){
        path = route;
      }
      
      // Create a new gate
      var gate = new Gate(route, path, template);
      
      // Push it to gates
      this.gates.push(gate);
      
      // Check if this gate is the current route
      if (self.find(route).route == currentRoute()){
        self.route(currentRoute());
      }
    };
    
    // Find a gate
    this.find = function(q){
      // Format search
      q = formatRoute(q);
      
      // Loop through gates and find the 'one'
      for (var i=0; i < self.gates.length; i++) {
        var gate = self.gates[i];
        if(gate.route == q){
          return gate;
        }
      };
      
      // If we couldn't find it, throw an error
      console.log("route for \""+q+"\" was not found.");
    };
    
    // Route to page
    this.route = function(route){
      route = formatRoute(route);
      
      // First, find that route
      var route = self.find(route);
      
      if(route) {
        
        // Set no cache
        $.ajaxSetup({
          cache: false
        });
        
        // Get view file
        function getView(callback){
          $.ajax({
            url: self.defaults.viewsPath + formatPath(route.path),
            method: 'GET',
            success: function(response){
              callback(response);
            },
            error: function(err){
              console.log(err);
            }
          });
        }
        
        // Get a partial
        function getPartial(path, callback){
          // Check if we've already loaded this partial
          $.ajax({
            url: formatPath(path),
            method: 'GET',
            success: function(response){
              callback(response);
            },
            error: function(err){
              console.log(err);
            }
          });
        }
        
        // Get a template
        function getTemplate(path, callback){
          if(path != self.activeTemplate){
            // Get the template file
            $.ajax({
              url: formatPath(path),
              method: 'GET',
              success: function(response){
                callback(response);
                self.activeTemplate = path;
              },
              error: function(err){
                console.log(err);
              }
            });
          } else {
            callback(false);
          }
        } // End getTemplate
        
        // Find and set any partials inside container
        function findPartials(elem){
          elem.find('*[data-gates-partial]').each(function(index, _partial){
            var path = $(this).attr('data-gates-partial');
            getPartial(path, function(partialResponse){
                $(_partial).html(partialResponse);
            });
          });
        }
        
        // Make it all happen
        getTemplate(route.template.path, function(templateResponse){
          // Check first if template is being used
          if(templateResponse){
            var template = $('<wrapper/>').html(templateResponse);
            
            // Find any partials
            findPartials(template);
            
          } else {
            var template = $('*[data-gates-template]');
          }
          
          // Get the view
          getView(function(viewResponse){
            
            // Set view
            var render = template.find('*[data-gates-render]');
            
            // Set view
            var view = render.html(viewResponse).end();
            
            // Find partials
            findPartials(render)
            
            // Remove the wrapper we created
            view = view.children();

            // Append it all to the page
            $('*[data-gates-template]').html(view)
            
            // Check for transitions
            switch(self.defaults.transition){
              case 'fade':
                render.hide().fadeIn(self.defaults.transitionSpeed);
                break;
            }

          }); // End getView
        }); //end getTemplate
        
        
      }
    };
    
    // Setup basic routes
    this.routes = function(routes){
      for (var i=0; i < routes.length; i++){
        var path = routes[i];
        
        // Create the gate
        self.gate(path);
      };
    };
    
    // Get the route from url
    var currentRoute = function(){
      return window.location.hash.replace("#", '');
    }
    
    $(window).on('hashchange', function(){
      // Only route if the hash begins with a slash
      var route = currentRoute();
      if(/^\//.test(route)){
        self.route(route);
      }
    });
  };
  
  // On first load, forward to root
  if(!window.location.hash){
    window.location.hash = "/";
  }
  
  return Gates;
})(jQuery);