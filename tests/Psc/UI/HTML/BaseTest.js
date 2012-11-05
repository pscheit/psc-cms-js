define(['psc-tests-assert','Psc/UI/HTML/Base'], function(t) {
  
  module("Psc.UI.HTML.Base");
  
  var setup = function (test) {
    return t.setup(test, {
      htmlClass: Joose.Class({
        
        does: [Psc.UI.HTML.Base],
        
        methods: {
          refresh: function () {
            
          }
        }
      })
    });
  };

  test("acceptance", function() {
    setup(this);
    var htmlParent = new this.htmlClass();
    
    var $div = htmlParent.tag('div', {
      'class': ['ui-widget', 'ui-row'],
      'title': 'my title'
    });
    
    this.assertEquals('<div title="my title" class="ui-widget ui-row"></div>', $('#qunit-fixture').empty().append($div).html());
  });
});