<template>
    <section class="rich-text">
      <div class="content" v-html="sanitizedHtml"></div>
    </section>
  </template>
  
  <script>
  import DOMPurify from 'dompurify';

  export default {
    name: "RichText",
    props: {
      html: {
        type: String,
        required: true,
      },
    },
    computed: {
      sanitizedHtml() {
        return DOMPurify.sanitize(this.html, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
          ALLOWED_ATTR: ['href', 'target', 'rel'],
          ALLOW_DATA_ATTR: false,
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .rich-text .content { line-height: 1.6; }
  </style>
  