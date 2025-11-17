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
        return DOMPurify.sanitize(this.html);
      },
    },
  };
  </script>
  
  <style scoped>
  .rich-text .content { line-height: 1.6; }
  </style>
  