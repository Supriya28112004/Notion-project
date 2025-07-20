import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const CollaborationCursors = Extension.create({
  name: 'collaborationCursors',
  
  addOptions() {
    return {
      cursors: {},
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    
    return [
      new Plugin({
        key: new PluginKey('collaborationCursors'),
        
        state: {
          init() {
            return DecorationSet.empty;
          },
          
          apply(tr, oldState) {
            const cursors = extension.options.cursors;
            const decorations = [];
            
            Object.entries(cursors).forEach(([userId, cursor]) => {
              if (cursor && typeof cursor.from === 'number' && typeof cursor.to === 'number') {
                try {
                  const doc = tr.doc;
                  
                  // Ensure positions are within document bounds
                  const from = Math.max(0, Math.min(cursor.from, doc.content.size));
                  const to = Math.max(from, Math.min(cursor.to, doc.content.size));
                  
                  // Create cursor decoration
                  const cursorDecoration = Decoration.widget(from, () => {
                    const cursor = document.createElement('span');
                    cursor.className = 'collaboration-cursor';
                    cursor.style.cssText = `
                      position: absolute;
                      width: 2px;
                      height: 20px;
                      background-color: ${cursor.color || '#3b82f6'};
                      margin-left: -1px;
                      pointer-events: none;
                      z-index: 10;
                    `;
                    
                    // Add username label
                    const label = document.createElement('span');
                    label.textContent = cursor.username || 'User';
                    label.className = 'collaboration-cursor-label';
                    label.style.cssText = `
                      position: absolute;
                      top: -25px;
                      left: 0;
                      background-color: ${cursor.color || '#3b82f6'};
                      color: white;
                      padding: 2px 6px;
                      border-radius: 4px;
                      font-size: 12px;
                      white-space: nowrap;
                      pointer-events: none;
                      z-index: 11;
                    `;
                    
                    cursor.appendChild(label);
                    return cursor;
                  }, { 
                    side: 1,
                    key: `cursor-${userId}`,
                  });
                  
                  decorations.push(cursorDecoration);
                  
                  // Add selection decoration if there's a range selection
                  if (from !== to) {
                    const selectionDecoration = Decoration.inline(from, to, {
                      class: 'collaboration-selection',
                      style: `background-color: ${cursor.color || '#3b82f6'}20; border-radius: 2px;`,
                    }, { 
                      key: `selection-${userId}`,
                    });
                    
                    decorations.push(selectionDecoration);
                  }
                } catch (error) {
                  console.warn('Error creating cursor decoration:', error);
                }
              }
            });
            
            return DecorationSet.create(tr.doc, decorations);
          },
        },
        
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});