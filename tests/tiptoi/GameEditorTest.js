define(['psc-tests-assert', 'joose', 'tiptoi/GameEditor'], function(t, Joose) {
  
  module("tiptoi.GameEditor");
  
  var setup = function(test, options) {
    var service = new (Joose.Class({
      has: {
        pulledCalled: {is: 'rw', required: false, isPrivate: false, init: false}
      },
      
      methods: {
        pullUploadFiles: function(requester) {
          this.pulledCalled = true;
          return [
            {
              "name":"emptyColumn.xlsx",
              "size":9126,
              "type":"application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "url":"/files/uploads/game/3/emptyColumn.xlsx",
              "delete_url":"/upload-manager/api/game/3/?file=emptyColumn.xlsx&_method=DELETE",
              "delete_type":"POST"
            }
          ];
        }
      }
    }))();
    
    var $widget = $('#visible-fixture').empty().html(
      '<div class="game-editor"><fieldset><div class="content game-files"></div></fieldset></div>'
    );
    
    var gameEditor = new tiptoi.GameEditor($.extend({
      service: service,
      apiUrl: '/upload-manager/api/game/102',
      widget: $widget,
      hasFiles: true
    }, options||{}));
    
    return t.setup(test, {gameEditor: gameEditor, $grid: $widget.find('div.game-files'), '$fixture': $('#visible-fixture')});
  };

  test("whe hasFiles is true the table is rendered and service is pulled", function() {
    setup(this);
    
    var grid = this.gameEditor.getFiles(), $table;
    
    this.assertjQueryLength(1, $table = this.$fixture.find('div.game-files table'));
    this.assertTrue(this.gameEditor.getService().pulledCalled, 'service was called for uploaded files');
    
    var row1 = grid.getRow(1);
    this.assertEquals(1, grid.getRows().length);
  });

  test("whe hasFiles is false the table is not rendered and service is not pulled", function() {
    setup(this, { hasFiles: false });
    
    var grid = this.gameEditor.getFiles(), $table;
    
    this.assertjQueryLength(0, $table = this.$fixture.find('div.game-files table'));
    this.assertFalse(this.gameEditor.getService().pulledCalled, 'service was not called for uploaded files');
  });
});