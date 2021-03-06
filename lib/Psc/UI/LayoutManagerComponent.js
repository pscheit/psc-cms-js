define(['joose', 'Psc/UI/WidgetWrapper', 'Psc/UI/EffectsManaging', 'Psc/UI/EffectsManaging', 'Psc/EventDispatching', 'Psc/UI/FormBuilding', 'Psc/UI/MiniButtonPanel'], function(Joose) {
  Joose.Class('Psc.UI.LayoutManagerComponent', {
    isa: Psc.UI.WidgetWrapper,
    
    does: [Psc.UI.EffectsManaging, Psc.UI.FormBuilding, Psc.EventDispatching],
  
    has: {
      widget: { is : 'rw', required: false, isPrivate: false },
      
      type: { is : 'rw', required: false, isPrivate: true},
      label: { is : 'rw', required: false, isPrivate: true},
      
      content: { is : 'rw', required: false, isPrivate: true},
      
      requires: { is : 'rw', required: false, isPrivate: true, init: Joose.I.Object},

      displayLocale: { is : 'rw', required: false, isPrivate: true, init: 'de'}
    },
    
    after: {
      initialize: function () {
        if (!this.$$type) {
          throw new Psc.Exception('type has to be set in before:initialize() in extending LayoutManagerComponent');
        }
      }
    },
    
    methods: {
      /**
       * Initialisiert das HTML des Widgets
       * 
       */
      create: function () {
        var $widget, that = this;
        
        this.widget = $widget = 
          $('<div class="widget '+(this.$$type.toLowerCase())+'"><h3 class="widget-header"></h3><div class="widget-content"></div></div>')
            .addClass('ui-widget ui-widget-content ui-helper-clearfix ui-corner-all')
            .on('click', '> .widget-header span.ui-icon-close', function(e) {
              e.preventDefault();
              that.remove();
          })
          .css('margin-bottom','5px');
        
          $widget.find('.widget-header')
            .html(this.$$label)
            .addClass("ui-helper-reset ui-state-default ui-corner-all" )
            .prepend("<span class='ui-icon ui-icon-close'></span>")
            .css({
              padding: '0.5em 0.5em 0.5em 0.7em'
            })
            .find('.ui-icon')
              .css({
                'float':'right',
                cursor: 'pointer'  
              });
          
          this.createContent();
          $widget.find('.widget-content')
            .append(this.getContent())
            .css('padding', '1.1em');
        
        this.linkWidget();
        
        this.afterCreate();
        
        return this.unwrap();
      },
      
      initLabel: function (guessedLabel) {
        this.$$label = guessedLabel;
      },
      createContent: function () {
        // sollte von jedem ableitenden widget implementiert werden. setzt this.$$content mit einem append()-baren jquery part
      },
      
      // will be called after the content is created and the widget is linked
      afterCreate: function () {
        
      },
      
      createMiniButtonPanel: function (buttons) {
        return new Psc.UI.MiniButtonPanel({buttons: buttons});
      },
      
      createTextarea: function (content, plain) {
        if (!content) content = '';
        
        var html = '<textarea class="paragraph" name="disabled[layout-manager-component]" cols="120" rows="5" style="width: 100%; min-height: 120px">'+content+'</textarea>';
        return plain ? html : $(html);
      },

      createTextfield: function(content, plain) {
        if (!content) content = '';

        var html = '<input type="text" style="width: 100%" name="disabled[layout-manager-component]" value="'+content+'" />';

        return plain ? html : $(html);
      },

      /* knockout - binding -parts */
      createKOTextarea: function (fieldName) {
        var html = '<textarea class="paragraph text ui-widget-content ui-corner-all" data-bind="value: '+fieldName+'.value" name="disabled[layout-manager-component]" cols="120" rows="5" style="width: 100%; min-height: 120px"></textarea>';
        return html;
      },
      
      createKOTextfield: function(fieldName) {
        var html = '<input type="text" class="text ui-widget-content ui-corner-all" style="width: 100%" data-bind="value: '+fieldName+'.value" name="disabled[layout-manager-component]" />';

        return html;
      },

      createSingleImage: function(fieldName) {
        var html = '<div data-bind="singleImage: '+fieldName+'.value"></div>';

        return html;
      },

      createInternalLinkSelection: function (fieldName) {
        var html = '<div data-bind="navigationSelect: '+fieldName+'.value"></div>';

        return html;
      },

      // adds additional properties to serialized, which need to be passed to the backend
      // @param object serialized
      serialize: function(serialized) {
        
      },
      
      // returns true when the component has no user content
      // @return bool
      isEmpty: function() {
        return false;
      },
      
      isEmptyText: function (text) {
        if (!text) return true;

        return text.match(/^[\s]*$/) !== null;
      },
      
      remove: function () {
        var $widget = this.unwrap();
        this.getEffectsManager().disappear($widget, function () {
          $widget.remove();
        });
      },

      // called to remove unecessary items ore empty elements (for multi elements widgets)
      // you can rely that cleanup is called before serialize is called
      // so caches can be filled from cleanup and then returned from serialize
      cleanup: function () {

      },
      
      findContent: function () {
        return this.unwrap().find(' > .widget-content');
      },

      requires: function (lib, alias) {
        this.$$requires[lib] = alias || 'undefined';
        return this;
      },
      _trigger: function (eventName, handlerData) {
        return this.getEventManager().triggerEvent(eventName, {component: this}, handlerData);
      },
      
      toString: function() {
        return "[Psc.UI.LayoutManagerComponent]";
      }
    }
  });
});