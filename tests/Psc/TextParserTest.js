define(['psc-tests-assert','Psc/TextParser'], function(t) {
  
  // aktueller test siehe sce:
  module("Psc.TextParser");
  
  var setup = function(test) {
    var textParser = new Psc.TextParser({ });
    
    var lines = [
      "sichergestellt, dass Nachhaltigkeit versprechende L�sungen aus der Region Leuchtturmwirkung erzielen und",
      "maghrebinischen St�dten erg�nzt, so dass das Wissen und die Erfahrungen deutscher Kommunen,",
      "CoMun bietet f�r die Partner eine Kombination aus Dialog, Erfahrungsaustausch und technischer Beratung. Das Programm  arbeitet",
      "sowie verschiedenen deutschen St�dten, dem Marseille Center for Mediterranean Integration (CMI"
    ];
    
    var listPoints = [
      "Familienunternehmen mit mehr als 30 Jahren Erfahrung und Wissen",
      "Unternehmergeist durch und durch � langfristige Fortf�hrung des Unternehmens durch S�hne des Firmengr�nders",
      "Mehr als 12 000 zufriedene Kunden weltweit",
      "Umfangreiche Innovationskraft und Erfindertum"
    ];
    
    var numberedListText =
      "1\tFamilienunternehmen mit mehr als 30 Jahren Erfahrung und Wissen \n"+
      "2\tUnternehmergeist durch und durch � langfristige Fortf�hrung des Unternehmens durch S�hne des Firmengr�nders    \n"+
      "3\tMehr als 12 000 zufriedene Kunden weltweit\n"+
      "4\tUmfangreiche Innovationskraft und Erfindertum      \n";
  
    test = t.setup(test, {textParser: textParser, lines: lines, listPoints: listPoints, numberedListText: numberedListText});
    
    test.assertParsing = function(expectedParsedStructure, text) {
      test.assertEquals(
        expectedParsedStructure,
        textParser.parse(text)
      );
    };
  };

  test("parser extracts test paragraph into nodes", function() {
    setup(this);
    
    this.assertParsing(
      [
        {value: this.lines[0], type: "paragraph"},
        {value: this.lines[1], type: "paragraph"},
        {value: this.lines[2], type: "paragraph"}
      ],
      
      this.lines[0]+"\n\n"+
      this.lines[1]+"\n\n"+
      this.lines[2]+"\n"
    );
  });

  test("parser detects a list surounded by text", function() {
    setup(this);
    
    this.assertParsing([
        {value: this.lines[0], type: "paragraph"},
        {value: this.lines[1], type: "paragraph"},
        {value: "Mit dem Vorhaben CoMun f�rdert die:", type: "paragraph"},
        {value: ["list1", "list2"], type: "list"},
        {value: this.lines[2], type: "paragraph"}
      ],

      this.lines[0]+"\n\n"+
      this.lines[1]+"\n\n"+
      "Mit dem Vorhaben CoMun f�rdert die:\n"+
      "-\tlist1\n"+
      "-\tlist2\n"+
      "\n"+
      this.lines[2]
    );
  });
  
  test("parser detects list only in lines", function() {
    setup(this);
    
    this.assertParsing([
        {value: ["list1", "list2", "list3"], type:"list"}
      ],
      
      "\n"+
      " - list1\n"+
      " - list2\n"+
      " - list3\n"
    );
  });

  test("parser detects a wrong formatted headline between paragraph and a list", function() {
    setup(this);
    
    this.assertParsing([
        {value: "Nach Klick auf �Partner� erscheinen zwei Unterrubriken:", type: 'paragraph'},
        {value: ["Technologie", "Internationale Vertriebs-Partner"], type: 'list'},
        
        {value: "Nach Klick auf �Technologie-Partner� erscheint folgender Text", type: 'paragraph'},
        
        {value: "Kanefusa\n"+
                "Kanefusa ist Japans gr��ter Hersteller von Qualit�ts-Werkzeugen f�r die Branchen Metall,\n"+
                "als �beraus verl�sslich und langlebig erwiesen.\n",
         type: 'paragraph'
        }
      ],
      
      "Nach Klick auf �Partner� erscheinen zwei Unterrubriken: \n"+
      "�\tTechnologie \n"+
      "�\tInternationale Vertriebs-Partner   \n"+
      "\n"+
      "Nach Klick auf �Technologie-Partner� erscheint folgender Text \n"+
      "\t\n"+
      "\tKanefusa \n"+
      "\tKanefusa ist Japans gr��ter Hersteller von Qualit�ts-Werkzeugen f�r die Branchen Metall, \n"+
      "\tals �beraus verl�sslich und langlebig erwiesen. \n"+
      "\n"
    );
  });
  
  test("parser detects a correctly formatted headline before an indented block", function() {
    setup(this);
    
    this.assertParsing([
        {value: "Nach Klick auf �Partner� erscheinen zwei Unterrubriken:", type: 'paragraph'},
        {value: ["Technologie", "Internationale Vertriebs-Partner"], type: 'list'},
        
        {value: "Nach Klick auf �Technologie-Partner� erscheint folgender Text", type: 'paragraph'},
        
        {value: "Kanefusa", type: 'headline'},
        {value: 
                "Kanefusa ist Japans gr��ter Hersteller von Qualit�ts-Werkzeugen f�r die Branchen Metall,"+
                "Holzbearbeitung, Papier und Kunststoff. Alle hergestellten S�gebl�tter, Schneiden und",
         type: 'paragraph'
        }
      ],

      "Kanefusa \n"+
      "\tKanefusa ist Japans gr��ter Hersteller von Qualit�ts-Werkzeugen f�r die Branchen Metall, \n"+
      "\tHolzbearbeitung, Papier und Kunststoff. Alle hergestellten S�gebl�tter, Schneiden und \n"
    );
    
    // die headline ist dadurch erkennbar, dass die n�chsten Zeilen eingr�ckt sind mit einem tab
  });
});