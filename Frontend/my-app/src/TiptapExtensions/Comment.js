// src/TiptapExtensions/Comment.js
import { Mark } from '@tiptap/core';

export const Comment = Mark.create({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }];
  },

  renderHTML({ mark, HTMLAttributes }) {
    return ['span', { 
      'data-comment-id': mark.attrs.id, 
      style: 'background-color: yellow;', 
      ...HTMLAttributes 
    }, 0];
  },

  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },
});
