<template>
    <v-btn
      fab
      icon
      color="white"
      class="current-location-btn"
      :style="{ bottom: `${bottomPosition}px` }"
      @click="$emit('center-map')"
    >
      <v-icon color="blue">mdi-crosshairs-gps</v-icon>
    </v-btn>
  </template>
  
  <script>
  export default {
    name: "CurrentLocationButton",
    props: {
      bottomPosition: {
        type: Number,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .current-location-btn {
    position: fixed;
    right: 16px;
    z-index: 1000;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: bottom 0.2s ease;
  }
  </style>