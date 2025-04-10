<template>
  <v-app>
    <MapComponent
      :usersLocation="usersLocation"
      :registeredShops="registeredShops"
      @toggle-sheet="toggleSheet"
      ref="mapComponent"
    />

    <CurrentLocationButton
      :bottom-position="buttonBottomPosition"
      @center-map="centerMapOnCurrentLocation"
    />

    <RegisterShopButton @open-form="showRegisterForm = true" />

    <RegisterShopForm
      v-model:visible="showRegisterForm"
      @register-shop="handleRegisterShop"
    />

    <BottomSheet
      v-model:sheet-height="sheetHeight"
      :min-height="minHeight"
      :max-height="maxHeight"
    >
      <h2>근처 양말 가게</h2>
      <ShopList :shops="nearbyShops" @navigate="navigateToShop" />
    </BottomSheet>
  </v-app>
</template>

<script>
import { database } from "./firebase";
import { ref as dbRef, onValue, push, set } from "firebase/database";
import MapComponent from "@/components/MapComponent.vue";
import CurrentLocationButton from "@/components/CurrentLocationButton.vue";
import RegisterShopButton from "@/components/RegisterShopButton.vue";
import RegisterShopForm from "@/components/RegisterShopForm.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import ShopList from "@/components/ShopList.vue";

export default {
  name: "App",
  components: {
    MapComponent,
    CurrentLocationButton,
    RegisterShopButton,
    RegisterShopForm,
    BottomSheet,
    ShopList,
  },
  data() {
    return {
      sheetHeight: 200,
      minHeight: 40,
      maxHeight: null,
      usersLocation: {},
      registeredShops: {},
      showRegisterForm: false,
      nearbyShops: [
        {
          id: 1,
          name: "양말천국",
          distance: 120,
          rating: 4.5,
        },
        {
          id: 2,
          name: "컬러풀 삭스",
          distance: 350,
          rating: 4.2,
        },
        {
          id: 3,
          name: "편안한 발",
          distance: 450,
          rating: 4.7,
        },
      ],
    };
  },
  computed: {
    buttonBottomPosition() {
      return this.sheetHeight + 16;
    },
  },
  methods: {
    toggleSheet() {
      this.sheetHeight =
        this.sheetHeight > this.minHeight ? this.minHeight : 200;
    },

    centerMapOnCurrentLocation() {
      this.$refs.mapComponent.centerOnCurrentLocation();
    },

    navigateToShop(shop) {
      console.log(`Navigating to ${shop.name}`);
    },

    registerShop(shopData) {
      // Firebase에 가게 정보 저장
      const shopsRef = dbRef(database, "/shops");
      const newShopRef = push(shopsRef);

      const newShop = {
        ownerName: shopData.ownerName,
        phoneNumber: shopData.phoneNumber,
        name: shopData.shopName,
        location: {
          latitude: shopData.location.latitude,
          longitude: shopData.location.longitude,
        },
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };

      set(newShopRef, newShop)
        .then(() => {
          this.$refs.mapComponent.addShopMarker(newShop);
          alert(`${shopData.shopName} 가게가 성공적으로 등록되었습니다!`);
        })
        .catch((error) => {
          console.error("Error adding shop:", error);
          alert("가게 등록에 실패했습니다. 다시 시도해주세요.");
        });
    },
  },
  mounted() {
    // Firebase에서 사용자 위치 데이터 가져오기
    const usersRef = dbRef(database, "/");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.usersLocation = data;
        console.log("사용자 위치 데이터 업데이트됨");
      } else {
        console.log("사용자 데이터가 존재하지 않습니다.");
      }
    });

    // Firebase에서 등록된 가게 데이터 가져오기
    const shopsRef = dbRef(database, "/shops");
    onValue(shopsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.registeredShops = data;
        console.log("등록된 가게 데이터 업데이트됨");
      }
    });

    // 화면 크기에 따라 최대 높이 설정
    this.maxHeight = Math.floor(window.innerHeight * 0.65);
  },
};
</script>

<style>
html,
body,
#app,
.v-application {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  overscroll-behavior: none;
}

/* 스크롤바 숨기기 */
::-webkit-scrollbar {
  display: none;
}

* {
  -ms-overflow-style: none; /* IE와 Edge를 위한 설정 */
  scrollbar-width: none; /* Firefox를 위한 설정 */
}
</style>
