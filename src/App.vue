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
export default {
  name: "App",
  data() {
    return {
      map: null, // 지도 인스턴스를 저장할 변수
      sheetHeight: 200, // 기본 시트 높이 (픽셀)
      minHeight: 40, // 최소 높이 (핸들만 남는 높이)
      maxHeight: null, // 화면의 65% 높이로 동적 설정
      startY: 0, // 드래그 시작 Y 위치
      startHeight: 0, // 드래그 시작 시 시트 높이
      nearbyShops: [
        {
          id: 1,
          name: "양말나라",
          latitude: 37.566826,
          longitude: 126.9786567,
          distance: 100,
          rating: 4.5,
          address: "서울특별시 중구 퇴계로 100",
        },
        {
          id: 2,
          name: "삭스월드",
          latitude: 37.567012,
          longitude: 126.9795432,
          distance: 200,
          rating: 4.2,
          address: "서울특별시 중구 명동길 45",
        },
        {
          id: 3,
          name: "행복한 양말",
          latitude: 37.565739,
          longitude: 126.9777213,
          distance: 150,
          rating: 4.7,
          address: "서울특별시 중구 충무로 23",
        },
      ],
    };
  },
  computed: {
    // 버튼의 bottom 위치를 동적으로 계산
    buttonBottomPosition() {
      // 현재 시트 높이 + 추가 마진 (16px)
      return this.sheetHeight + 16;
    },
  },
  methods: {
    // 지도 클릭 시 Bottom Sheet 토글
    toggleSheet() {
      if (this.sheetHeight > this.minHeight) {
        // 현재 Sheet이 열려있다면 접기
        this.sheetHeight = this.minHeight;
      } else {
        // Sheet이 접혀있다면 다시 열기
        this.sheetHeight = 200;
      }
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

    // 드래그 시작 처리
    startDrag(event) {
      // 터치 또는 마우스 이벤트 처리
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      this.startY = clientY;
      this.startHeight = this.sheetHeight;

      // 움직임 및 종료 이벤트 리스너 추가
      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("touchmove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
      document.addEventListener("touchend", this.stopDrag);
    },

    // 드래그 중 처리
    onDrag(event) {
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const delta = this.startY - clientY;
      let newHeight = this.startHeight + delta;

      // 최대 높이를 화면의 65%로 설정
      if (this.maxHeight === null) {
        this.maxHeight = Math.floor(window.innerHeight * 0.65);
      }

      // 최소/최대 높이 제한
      newHeight = Math.max(this.minHeight, Math.min(this.maxHeight, newHeight));
      this.sheetHeight = newHeight;
    },

    // 드래그 종료 처리
    stopDrag() {
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("touchmove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
      document.removeEventListener("touchend", this.stopDrag);

      // 높이를 자동으로 조정
      if (this.sheetHeight < this.maxHeight / 2) {
        // 최소 높이로 조정
        this.sheetHeight = this.minHeight;
      } else {
        // 화면의 65% 높이까지 올리기
        this.sheetHeight = this.maxHeight;
      }
    },

    // 지도 초기화
    initMap() {
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3,
      };
      this.map = new kakao.maps.Map(container, options);
    },
  },
  mounted() {
    if (window.kakao && window.kakao.maps) {
      this.initMap();
    } else {
      const script = document.createElement("script");
      /* Kakao Maps API 키를 넣어주세요 */
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(() => {
          this.initMap();
        });
      };
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
