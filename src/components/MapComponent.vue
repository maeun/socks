<template>
    <div id="map" class="map" @click="$emit('toggle-sheet')"></div>
  </template>
  
  <script>
import { createMarker, initKakaoMapScript } from '@/utils/mapUtils';

  export default {
    name: "MapComponent",
    props: {
      usersLocation: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        map: null,
        markers: []
      };
    },
    watch: {
      usersLocation: {
        handler(newVal) {
          if (this.map && Object.keys(newVal).length > 0) {
            this.addUserMarkers(newVal);
          }
        },
        deep: true
      }
    },
    methods: {
      clearMarkers() {
        this.markers.forEach((marker) => marker.setMap(null));
        this.markers = [];
      },
  
      addUserMarkers(userLocations) {
        this.clearMarkers();
  
        Object.entries(userLocations).forEach(([, coords]) => {
          const latitude = parseFloat(coords.latitude);
          const longitude = parseFloat(coords.longitude);
          if (!isNaN(latitude) && !isNaN(longitude)) {
            const marker = createMarker(latitude, longitude, this.map);
            this.markers.push(marker);
          }
        });
      },
  
      centerOnCurrentLocation() {
        if (navigator.geolocation && this.map) {
          navigator.geolocation.getCurrentPosition((position) => {
            const newPos = new kakao.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );
            this.map.setCenter(newPos);
          });
        } else {
          alert("Geolocation is not supported by this browser.");
        }
      },
  
      initMap() {
        const container = document.getElementById("map");
        const options = {
          center: new kakao.maps.LatLng(37.566826, 126.9786567),
          level: 3,
        };
        this.map = new kakao.maps.Map(container, options);
  
        if (Object.keys(this.usersLocation).length > 0) {
          this.addUserMarkers(this.usersLocation);
        }
      }
    },
    mounted() {
      initKakaoMapScript(() => this.initMap());
    }
  };
  </script>
  
  <style scoped>
  .map {
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  </style>