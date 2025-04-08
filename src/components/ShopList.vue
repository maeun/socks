<template>
    <div v-if="shops.length > 0" class="shop-list">
      <ShopItem 
        v-for="shop in shops" 
        :key="shop.id" 
        :shop="shop" 
        @navigate="$emit('navigate', shop)"
      />
    </div>
    <p v-else>주변에 양말 가게가 없습니다.</p>
  </template>
  
  <script>
  import ShopItem from './ShopItem.vue';
  
  export default {
    name: "ShopList",
    components: {
      ShopItem
    },
    props: {
      shops: {
        type: Array,
        default: () => []
      }
    },
    emits: ['navigate']
  };
  </script>
  
  <style scoped>
  .shop-list {
    max-height: 250px;
    overflow-y: auto;
  }
  </style>