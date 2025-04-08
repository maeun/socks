<template>
    <v-btn
      fab
      icon
      color="white"
      class="register-shop-btn"
      @click="$emit('open-form')"
    >
      <v-icon color="green">mdi-plus</v-icon>
    </v-btn>
  </template>
  
  <script>
  export default {
    name: "RegisterShopButton",
    emits: ['open-form']
  };
  </script>
  
  <style scoped>
  .register-shop-btn {
    position: fixed;
    right: 16px;
    top: 16px;
    z-index: 1000;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  </style>