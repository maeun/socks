<template>
    <v-dialog v-model="localVisible" max-width="500px" content-class="register-form-dialog">
      <v-card class="register-form-card">
        <v-card-title class="register-title">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-store</v-icon>
            <span>양말 가게 등록</span>
          </div>
          <v-btn icon @click="closeForm" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="isFormValid">
            <div class="form-section">
              <div class="section-title">
                <v-icon color="primary" small class="mr-2">mdi-account</v-icon>
                <span>사장님 정보</span>
              </div>
              
              <v-text-field
                v-model="shopData.ownerName"
                label="사장님 이름"
                :rules="[v => !!v || '사장님 이름을 입력해주세요']"
                outlined
                dense
                prepend-inner-icon="mdi-account-outline"
                required
                class="mb-2"
              ></v-text-field>
              
              <v-text-field
                v-model="shopData.phoneNumber"
                label="핸드폰 번호"
                :rules="[
                  v => !!v || '핸드폰 번호를 입력해주세요',
                  v => /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(v) || '올바른 핸드폰 번호 형식이 아닙니다'
                ]"
                outlined
                dense
                prepend-inner-icon="mdi-phone"
                placeholder="01012345678"
                hint="'-' 없이 숫자만 입력해도 됩니다"
                required
              ></v-text-field>
            </div>
            
            <div class="form-section">
              <div class="section-title">
                <v-icon color="primary" small class="mr-2">mdi-store-outline</v-icon>
                <span>가게 정보</span>
              </div>
              
              <v-text-field
                v-model="shopData.shopName"
                label="가게 이름"
                :rules="[v => !!v || '가게 이름을 입력해주세요']"
                outlined
                dense
                prepend-inner-icon="mdi-store-outline"
                required
                class="mb-3"
              ></v-text-field>
              
              <div class="location-card">
                <div class="location-header">
                  <div class="d-flex align-center">
                    <v-icon color="blue darken-1" small>mdi-map-marker</v-icon>
                    <span class="ml-2 location-title">가게 위치</span>
                  </div>
                  <v-chip
                    x-small
                    :color="isLocationSelected ? 'success' : 'grey'"
                    text-color="white"
                    class="ml-2"
                  >
                    {{ isLocationSelected ? '위치 설정됨' : '위치 미설정' }}
                  </v-chip>
                </div>
                
                <v-divider class="my-2"></v-divider>
                
                <div class="location-content">
                  <div v-if="isLocationSelected" class="location-info">
                    <div class="d-flex align-center">
                      <v-icon color="green" small>mdi-check-circle</v-icon>
                      <span class="ml-2 text-body-2">위치가 성공적으로 설정되었습니다</span>
                    </div>
                    <div class="location-address text-body-2 mt-1">
                      <v-icon color="blue-grey" x-small class="mr-1">mdi-map</v-icon>
                      {{ shopData.location.address || '주소 불러오는 중...' }}
                    </div>
                    <div class="location-coordinates text-caption text-grey">
                      {{ formatCoordinates(shopData.location.latitude, shopData.location.longitude) }}
                    </div>
                  </div>
                  <div v-else class="text-body-2 text-grey">
                    아래 버튼을 클릭하여 현재 위치를 가게 위치로 설정해주세요
                  </div>
                  
                  <v-btn
                    block
                    :color="isLocationSelected ? 'success' : 'primary'"
                    :outlined="isLocationSelected"
                    :text="isLocationSelected"
                    class="mt-3"
                    @click="selectCurrentLocation"
                  >
                    <v-icon left>{{ isLocationSelected ? 'mdi-map-marker-check' : 'mdi-crosshairs-gps' }}</v-icon>
                    {{ isLocationSelected ? '위치 재설정하기' : '현재 위치로 설정하기' }}
                  </v-btn>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="register-actions">
          <v-btn
            text
            color="grey darken-1"
            @click="closeForm"
          >
            취소
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :disabled="!isFormValid || !isLocationSelected"
            @click="submitForm"
            class="px-5"
          >
            <v-icon left>mdi-check</v-icon>
            등록하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  export default {
    name: "RegisterShopForm",
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:visible', 'register-shop'],
    data() {
      return {
        localVisible: false,
        isFormValid: false,
        isLocationSelected: false,
        shopData: {
          ownerName: '',
          phoneNumber: '',
          shopName: '',
          location: {
            latitude: null,
            longitude: null,
            address: null
          }
        }
      };
    },
    watch: {
      visible(newVal) {
        this.localVisible = newVal;
      },
      localVisible(newVal) {
        this.$emit('update:visible', newVal);
        if (!newVal) {
          this.resetForm();
        }
      }
    },
    methods: {
      closeForm() {
        this.localVisible = false;
      },
      resetForm() {
        this.shopData = {
          ownerName: '',
          phoneNumber: '',
          shopName: '',
          location: {
            latitude: null,
            longitude: null,
            address: null
          }
        };
        this.isLocationSelected = false;
        if (this.$refs.form) {
          this.$refs.form.reset();
        }
      },
      selectCurrentLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.shopData.location.latitude = position.coords.latitude;
              this.shopData.location.longitude = position.coords.longitude;
              this.isLocationSelected = true;
              
              // 위치 정보를 가져온 후 도로명 주소 조회
              this.getAddressFromCoords(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
              console.error("Error getting location:", error);
              alert("위치 정보를 가져오는데 실패했습니다. 위치 사용 권한을 확인해주세요.");
            }
          );
        } else {
          alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
        }
      },
      // 좌표로 주소 검색 (카카오맵 API)
      getAddressFromCoords(lat, lng) {
        // 카카오맵 API가 로드되었는지 확인
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          
          geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              if (result[0].road_address) {
                // 도로명 주소가 있는 경우
                this.shopData.location.address = result[0].road_address.address_name;
              } else {
                // 도로명 주소가 없는 경우 지번 주소 사용
                this.shopData.location.address = result[0].address.address_name;
              }
            } else {
              this.shopData.location.address = "주소를 찾을 수 없습니다";
              console.error("주소 변환 실패:", status);
            }
          });
        } else {
          console.error("카카오맵 API가 로드되지 않았습니다.");
          this.shopData.location.address = "카카오맵 API 로드 실패";
        }
      },
      submitForm() {
        if (this.isFormValid && this.isLocationSelected) {
          this.$emit('register-shop', { ...this.shopData });
          this.closeForm();
        }
      },
      formatCoordinates(lat, lng) {
        if (lat === null || lng === null) return '';
        return `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;
      }
    }
  };
  </script>
  
  <style scoped>
  .register-form-dialog {
    border-radius: 12px;
  }
  
  .register-form-card {
    border-radius: 8px;
    overflow: hidden;
  }
  
  .register-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
  }
  
  .close-btn {
    margin-right: -8px;
  }
  
  .form-section {
    margin-bottom: 24px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-weight: 500;
    color: #333;
  }
  
  .location-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px;
    background-color: #f9f9f9;
  }
  
  .location-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .location-title {
    font-weight: 500;
    font-size: 14px;
  }
  
  .location-content {
    padding: 12px 8px 8px;
  }
  
  .location-info {
    margin-bottom: 8px;
  }
  
  .location-coordinates {
    margin-top: 4px;
    padding-left: 24px;
  }
  
  .location-address {
    padding-left: 24px;
    word-break: keep-all;
    overflow-wrap: break-word;
  }
  
  .register-actions {
    padding: 16px 20px;
  }
  </style>