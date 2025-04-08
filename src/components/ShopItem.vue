<template>
    <div class="shop-item">
      <div class="shop-info">
        <h3>{{ shop.name }}</h3>
        <p>
          <v-icon small color="grey">mdi-map-marker</v-icon>
          {{ shop.distance }}m |
          <v-icon small color="grey">mdi-star</v-icon>
          {{ shop.rating }}
        </p>
      </div>
      <v-btn small outlined color="primary" @click="$emit('navigate')">
        길 찾기
      </v-btn>
    </div>
  </template>
  
  <script>
  export default {
    name: "ShopItem",
    props: {
      shop: {
        type: Object,
        required: true
      }
    },
    emits: ['navigate']
  };
  </script>
  
  <style scoped>
  .shop-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
  }
  
  .shop-item:last-child {
    border-bottom: none;
  }
  
  .shop-info h3 {
    margin-bottom: 5px;
  }
  
  .shop-info p {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 0.9em;
  }
  
  .shop-info p .v-icon {
    margin-right: 4px;
  }
  </style>