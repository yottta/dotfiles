(function() {
  var HighlightSelected, Point, Range, path, _ref;

  path = require('path');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  HighlightSelected = require('../lib/highlight-selected');

  describe("HighlightSelected", function() {
    var activationPromise, editor, editorElement, hasMinimap, hasStatusBar, highlightSelected, minimap, minimapHS, minimapModule, statusBar, workspaceElement, _ref1;
    _ref1 = [], activationPromise = _ref1[0], workspaceElement = _ref1[1], minimap = _ref1[2], statusBar = _ref1[3], editor = _ref1[4], editorElement = _ref1[5], highlightSelected = _ref1[6], minimapHS = _ref1[7], minimapModule = _ref1[8];
    hasMinimap = atom.packages.getAvailablePackageNames().indexOf('minimap') !== -1 && atom.packages.getAvailablePackageNames().indexOf('minimap-highlight-selected') !== -1;
    hasStatusBar = atom.packages.getAvailablePackageNames().indexOf('status-bar') !== -1;
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return atom.project.setPaths([path.join(__dirname, 'fixtures')]);
    });
    afterEach(function() {
      highlightSelected.deactivate();
      if (minimapHS != null) {
        minimapHS.deactivate();
      }
      return minimapModule != null ? minimapModule.deactivate() : void 0;
    });
    describe("when opening a coffee file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('status-bar').then(function(pack) {
            return statusBar = workspaceElement.querySelector("status-bar");
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('highlight-selected').then(function(_arg) {
            var mainModule;
            mainModule = _arg.mainModule;
            return highlightSelected = mainModule;
          });
        });
        if (hasMinimap) {
          waitsForPromise(function() {
            return atom.packages.activatePackage('minimap').then(function(_arg) {
              var mainModule;
              mainModule = _arg.mainModule;
              return minimapModule = mainModule;
            });
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('minimap-highlight-selected').then(function(_arg) {
              var mainModule;
              mainModule = _arg.mainModule;
              return minimapHS = mainModule;
            });
          });
        }
        waitsForPromise(function() {
          return atom.workspace.open('sample.coffee').then(function(editor) {
            return editor;
          }, function(error) {
            throw error.stack;
          });
        });
        return runs(function() {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      describe("updates debounce when config is changed", function() {
        beforeEach(function() {
          spyOn(highlightSelected.areaView, 'debouncedHandleSelection');
          return atom.config.set('highlight-selected.timeout', 20000);
        });
        return it('calls createDebouce', function() {
          return expect(highlightSelected.areaView.debouncedHandleSelection).toHaveBeenCalled();
        });
      });
      describe("when a whole word is selected", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 2), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        it("adds the decoration to all words", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
        });
        it("creates the highlight selected status bar element", function() {
          expect(workspaceElement.querySelector('status-bar')).toExist();
          return expect(workspaceElement.querySelector('.highlight-selected-status')).toExist();
        });
        it("updates the status bar with highlights number", function() {
          var content;
          content = workspaceElement.querySelector('.highlight-selected-status').innerHTML;
          return expect(content).toBe('Highlighted: 4');
        });
        return describe("when the status bar is disabled", function() {
          beforeEach(function() {
            return atom.config.set('highlight-selected.showInStatusBar', false);
          });
          return it("highlight isn't attached", function() {
            expect(workspaceElement.querySelector('status-bar')).toExist();
            return expect(workspaceElement.querySelector('.highlight-selected-status')).not.toExist();
          });
        });
      });
      describe("when hide highlight on selected word is enabled", function() {
        beforeEach(function() {
          return atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true);
        });
        describe("when a single line is selected", function() {
          beforeEach(function() {
            var range;
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the decoration only no selected words", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
          });
        });
        return describe("when multi lines are selected", function() {
          beforeEach(function() {
            var range1, range2;
            range1 = new Range(new Point(8, 2), new Point(8, 8));
            range2 = new Range(new Point(9, 2), new Point(9, 8));
            editor.setSelectedBufferRanges([range1, range2]);
            return advanceClock(20000);
          });
          return it("adds the decoration only no selected words", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
          });
        });
      });
      describe("leading whitespace doesn't get used", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 0), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("doesn't add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
        });
      });
      describe("will highlight non whole words", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', false);
          range = new Range(new Point(10, 13), new Point(10, 17));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });
      describe("will not highlight non whole words", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(10, 13), new Point(10, 17));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
      describe("will not highlight less than minimum length", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.minimumLength', 7);
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("doesn't add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
        });
      });
      describe("will not highlight words in different case", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
      describe("will highlight words in different case", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.ignoreCase', true);
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(5);
        });
        describe("adds background to selected", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-selected.highlightBackground', true);
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the background to all highlights", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected.background .region')).toHaveLength(4);
          });
        });
        return describe("adds light theme to selected", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-selected.lightTheme', true);
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the background to all highlights", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected.light-theme .region')).toHaveLength(4);
          });
        });
      });
      if (hasMinimap) {
        return describe("minimap highlight selected still works", function() {
          beforeEach(function() {
            var range;
            editor = atom.workspace.getActiveTextEditor();
            minimap = minimapModule.minimapForEditor(editor);
            spyOn(minimap, 'decorateMarker').andCallThrough();
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it('adds a decoration for the selection in the minimap', function() {
            return expect(minimap.decorateMarker).toHaveBeenCalled();
          });
        });
      }
    });
    return describe("when opening a php file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('highlight-selected').then(function(_arg) {
            var mainModule;
            mainModule = _arg.mainModule;
            return highlightSelected = mainModule;
          });
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.php').then(function(editor) {
            return editor;
          }, function(error) {
            throw error.stack;
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-php');
        });
        return runs(function() {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      describe("being able to highlight variables with '$'", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(1, 2), new Point(1, 7));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("finds 3 regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });
      return describe("being able to highlight variables when not selecting '$'", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(1, 3), new Point(1, 7));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("finds 4 regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVtcC8uYXRvbS9wYWNrYWdlcy9oaWdobGlnaHQtc2VsZWN0ZWQvc3BlYy9oaWdobGlnaHQtc2VsZWN0ZWQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBRFIsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSwyQkFBUixDQUZwQixDQUFBOztBQUFBLEVBTUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUEsR0FBQTtBQUM1QixRQUFBLDRKQUFBO0FBQUEsSUFBQSxRQUN1RSxFQUR2RSxFQUFDLDRCQUFELEVBQW9CLDJCQUFwQixFQUFzQyxrQkFBdEMsRUFBK0Msb0JBQS9DLEVBQ0MsaUJBREQsRUFDUyx3QkFEVCxFQUN3Qiw0QkFEeEIsRUFDMkMsb0JBRDNDLEVBQ3NELHdCQUR0RCxDQUFBO0FBQUEsSUFHQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBZCxDQUFBLENBQ1gsQ0FBQyxPQURVLENBQ0YsU0FERSxDQUFBLEtBQ2MsQ0FBQSxDQURkLElBQ3FCLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQWQsQ0FBQSxDQUNoQyxDQUFDLE9BRCtCLENBQ3ZCLDRCQUR1QixDQUFBLEtBQ1ksQ0FBQSxDQUw5QyxDQUFBO0FBQUEsSUFPQSxZQUFBLEdBQWUsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBZCxDQUFBLENBQ2IsQ0FBQyxPQURZLENBQ0osWUFESSxDQUFBLEtBQ2UsQ0FBQSxDQVI5QixDQUFBO0FBQUEsSUFVQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FB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

//# sourceURL=/home/jump/.atom/packages/highlight-selected/spec/highlight-selected-spec.coffee
