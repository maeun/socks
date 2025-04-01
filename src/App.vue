<template>
  <v-app>
    <div id="map" class="map" @click="toggleSheet"></div>

    <!-- 현재 위치로 이동하는 버튼 (동적 위치, 부드러운 전환) -->
    <v-btn
      fab
      icon
      color="white"
      class="current-location-btn"
      :style="{ bottom: `${buttonBottomPosition}px` }"
      @click="centerMapOnCurrentLocation"
    >
      <v-icon color="blue">mdi-crosshairs-gps</v-icon>
    </v-btn>

    <!-- 커스텀 바텀 시트 (Vuetify v-bottom-sheet 대신 사용) -->
    <div class="custom-bottom-sheet" :style="{ height: `${sheetHeight}px` }">
      <div
        class="drag-handle"
        @mousedown="startDrag"
        @touchstart="startDrag"
      ></div>
      <div v-if="sheetHeight > minHeight" class="sheet-content">
        <h2>근처 양말 가게</h2>
        <div v-if="nearbyShops.length > 0" class="shop-list">
          <div v-for="shop in nearbyShops" :key="shop.id" class="shop-item">
            <div class="shop-info">
              <h3>{{ shop.name }}</h3>
              <p>
                <v-icon small color="grey">mdi-map-marker</v-icon>
                {{ shop.distance }}m |
                <v-icon small color="grey">mdi-star</v-icon>
                {{ shop.rating }}
              </p>
            </div>
            <v-btn small outlined color="primary" @click="navigateToShop(shop)">
              길 찾기
            </v-btn>
          </div>
        </div>
        <p v-else>주변에 양말 가게가 없습니다.</p>
      </div>
    </div>
  </v-app>
</template>

<script>
import { database } from "./firebase";
import { ref as dbRef, onValue } from "firebase/database";

// 모든 picker 이미지를 가져옵니다
const requirePickerImages = require.context(
  "@/assets/pickers",
  false,
  /\.png$/
);
const pickerImagePaths = requirePickerImages.keys().map(requirePickerImages);

export default {
  name: "App",
  data() {
    return {
      map: null,
      marker: null,
      sheetHeight: 200,
      minHeight: 40,
      maxHeight: null,
      startY: 0,
      startHeight: 0,
      markers: [],
      usersLocation: {}, // ✅ data로 이동함
      nearbyShops: [
        // 기존 데이터 그대로 유지
      ],
    };
  },
  computed: {
    buttonBottomPosition() {
      return this.sheetHeight + 16;
    },
  },
  methods: {
    clearMarkers() {
      this.markers.forEach((marker) => marker.setMap(null));
      this.markers = [];
    },

    // ✅ 이 부분이 정확한 코드입니다.
    addUserMarkers(userLocations) {
      this.clearMarkers();

      Object.entries(userLocations).forEach(([, coords]) => {
        const latitude = parseFloat(coords.latitude);
        const longitude = parseFloat(coords.longitude);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          const marker = this.createMarker(latitude, longitude);
          this.markers.push(marker);
        }
      });
    },

    getRandomPickerImage() {
      const randomIndex = Math.floor(Math.random() * pickerImagePaths.length);
      return pickerImagePaths[randomIndex];
    },

    toggleSheet() {
      this.sheetHeight =
        this.sheetHeight > this.minHeight ? this.minHeight : 200;
    },

    centerMapOnCurrentLocation() {
      if (navigator.geolocation) {
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

    startDrag(event) {
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      this.startY = clientY;
      this.startHeight = this.sheetHeight;
      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("touchmove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
      document.addEventListener("touchend", this.stopDrag);
    },

    onDrag(event) {
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const delta = this.startY - clientY;
      this.maxHeight = this.maxHeight || Math.floor(window.innerHeight * 0.65);
      this.sheetHeight = Math.max(
        this.minHeight,
        Math.min(this.maxHeight, this.startHeight + delta)
      );
    },

    stopDrag() {
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("touchmove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
      document.removeEventListener("touchend", this.stopDrag);
      this.sheetHeight =
        this.sheetHeight < this.maxHeight / 2 ? this.minHeight : this.maxHeight;
    },

    createMarker(latitude, longitude) {
      const markerImage = new kakao.maps.MarkerImage(
        this.getRandomPickerImage(),
        new kakao.maps.Size(70, 70),
        { offset: new kakao.maps.Point(20, 40) }
      );
      const position = new kakao.maps.LatLng(latitude, longitude);
      const marker = new kakao.maps.Marker({ position, image: markerImage });

      marker.setMap(this.map);
      return marker;
    },

    navigateToShop(shop) {
      console.log(`Navigating to ${shop.name}`);
    },

    initMap() {
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3,
      };
      this.map = new kakao.maps.Map(container, options);

      // ✅ 지도 초기화 이후 Firebase 데이터를 기반으로 마커를 표시
      if (Object.keys(this.usersLocation).length > 0) {
        this.addUserMarkers(this.usersLocation);
      }
    },
  },
  mounted() {
    const usersRef = dbRef(database, "/");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.usersLocation = data;

        Object.entries(this.usersLocation).forEach(([userId, coords]) => {
          console.log(
            `${userId} - Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`
          );
        });

        // ✅ Firebase에서 데이터를 받은 후, 지도 객체가 존재할 때만 마커 추가
        if (this.map) {
          this.addUserMarkers(this.usersLocation);
        }
      } else {
        console.log("사용자 데이터가 존재하지 않습니다.");
      }
    });

    if (window.kakao && window.kakao.maps) {
      this.initMap();
    } else {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=5ae6046cd1cdf2b9b22ab5dc66bac24c&autoload=false";
      script.onload = () => window.kakao.maps.load(() => this.initMap());
      document.head.appendChild(script);
    }
  },
};
</script>

<style>
html,
body,
#app,
.v-application,
.map {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  overscroll-behavior: none;
}

/* 현재 위치 버튼 스타일 */
.current-location-btn {
  position: fixed;
  right: 16px;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: bottom 0.2s ease; /* 부드러운 전환 효과 추가 */
}

/* 커스텀 바텀 시트 스타일 */
.custom-bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transition: height 0.2s ease;
}

/* 드래그 핸들 스타일 */
.drag-handle {
  width: 40px;
  height: 5px;
  border-radius: 999px;
  background-color: #e0e0e0;
  margin: 10px auto;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

/* 시트 내용 스타일 */
.sheet-content {
  padding: 0 16px 16px 16px;
  height: calc(100% - 25px);
  overflow-y: auto;
}

/* 스크롤바 숨기기 */
::-webkit-scrollbar {
  display: none;
}

* {
  -ms-overflow-style: none; /* IE와 Edge를 위한 설정 */
  scrollbar-width: none; /* Firefox를 위한 설정 */
}
.shop-list {
  max-height: 250px;
  overflow-y: auto;
}

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
