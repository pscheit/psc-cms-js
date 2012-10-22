define(['psc-tests-assert','Psc/EventManagerMock'], function() {
  module("Psc.EventManagerMock");

  test("onlyAllowedEventsWillBeTriggered", function() {
    var eventManagerMock = new Psc.EventManagerMock({
      allow: ['allowed1'],
      denySilent: false
    });
    
    raises(function () {
      eventManagerMock.triggerEvent('denied1');
    });
    
    eventManagerMock.on('denied1', function(e) {
      fail('denied1 was called');
    });
    
    var called = false;
    eventManagerMock.on('allowed1', function (e) {
      called = true;
    });
    
    eventManagerMock.triggerEvent('allowed1');
    this.assertTrue(called);
  });

  test("eventsWillbeLogged", function() {
    var eventManagerMock = new Psc.EventManagerMock({
      allow: ['allowed1', 'allowed2'],
      denySilent: false
    });
    
    eventManagerMock.triggerEvent('allowed2',{},['add2']);
    eventManagerMock.triggerEvent('allowed1',{},['add1']);
    
    var triggered = eventManagerMock.getTriggered();
    this.assertTrue($.isArray(triggered.allowed1));
    this.assertFalse($.isEmptyObject(triggered.allowed1[0]));
    this.assertEquals('allowed1', triggered.allowed1[0].event.type);
    this.assertEquals(['add1'], triggered.allowed1[0].data);
    
    this.assertTrue($.isArray(triggered.allowed2));
    this.assertFalse($.isEmptyObject(triggered.allowed2[0]));
    this.assertEquals('allowed2', triggered.allowed2[0].event.type);
    this.assertEquals(['add2'], triggered.allowed2[0].data);
  });
  
  test("wasTriggered test", function () {
    var eventManagerMock = new Psc.EventManagerMock({
      allow: ['allowed1', 'allowed2'],
      denySilent: false
    });
    
    eventManagerMock.triggerEvent('allowed2',{},['add2']);
    eventManagerMock.triggerEvent('allowed1',{isnot:'evaluated'},['nope']);
    
    this.assertNotFalse(eventManagerMock.wasTriggered('allowed2', ['add2']));
    this.assertNotFalse(eventManagerMock.wasTriggered('allowed1', ['nope']));
    
    this.assertFalse(eventManagerMock.wasTriggered('denied1'));
    this.assertFalse(eventManagerMock.wasTriggered('allowed1',['close']));
    
  });

  test("wasTriggered callback test", function() {
    var eventManagerMock = new Psc.EventManagerMock({
      allow: ['allowed1', 'allowed2'],
      denySilent: false
    });
    
    eventManagerMock.triggerEvent('allowed2',{},['add2']);
    eventManagerMock.triggerEvent('allowed1',{isnot:'evaluated'},['nope']);
    
    this.assertTrue(eventManagerMock.wasTriggered('allowed2', 1));
    this.assertNotFalse(eventManagerMock.wasTriggered('allowed2', function (e, param1) {
      return param1 === 'add2' && e.type === 'allowed2';
    }));
    
    this.assertTrue(eventManagerMock.wasTriggered('whatever',0));
  });

  test("wasTriggered num+callback test", function() {
    var eventManagerMock = new Psc.EventManagerMock({
      allow: ['allowed1', 'allowed2'],
      denySilent: false
    });
    
    eventManagerMock.triggerEvent('allowed2',{},['add2']);
    eventManagerMock.triggerEvent('allowed1',{isnot:'evaluated'},['nope']);
    
    this.assertNotFalse(
      eventManagerMock.wasTriggered('allowed2', 1, function (e, param1) {
        return param1 === 'add2' && e.type === 'allowed2';
      })
    );
  });
  
});