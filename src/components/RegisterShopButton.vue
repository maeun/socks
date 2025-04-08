<template>
    <div class="register-button-container">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            color="primary"
            class="register-shop-btn"
            elevation="3"
            v-bind="attrs"
            v-on="on"
            @click="$emit('open-form')"
          >
            <v-icon>mdi-store-plus</v-icon>
          </v-btn>
        </template>
        <span>양말 가게 등록하기</span>
      </v-tooltip>
    </div>
  </template>
  
  <script>
  export default {
    name: "RegisterShopButton",
    emits: ['open-form']
  };
  </script>
  
  <style scoped>
  .register-button-container {
    position: fixed;
    right: 16px;
    top: 16px;
    z-index: 1000;
  }
  
  .register-shop-btn {
    background: linear-gradient(45deg, #1976d2, #42a5f5);
    box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
    transition: all 0.3s ease;
  }
  
  .register-shop-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 8px -1px rgba(0,0,0,.2), 0 8px 12px 0 rgba(0,0,0,.14), 0 2px 20px 0 rgba(0,0,0,.12);
  }
  </style>