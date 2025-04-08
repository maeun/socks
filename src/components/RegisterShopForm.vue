<template>
    <v-dialog v-model="localVisible" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          양말 가게 등록
          <v-spacer></v-spacer>
          <v-btn icon @click="closeForm">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="shopData.ownerName"
              label="사장님 이름"
              :rules="[v => !!v || '사장님 이름을 입력해주세요']"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="shopData.phoneNumber"
              label="핸드폰 번호"
              :rules="[
                v => !!v || '핸드폰 번호를 입력해주세요',
                v => /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(v) || '올바른 핸드폰 번호 형식이 아닙니다'
              ]"
              placeholder="01012345678"
              hint="'-' 없이 숫자만 입력해도 됩니다"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="shopData.shopName"
              label="가게 이름"
              :rules="[v => !!v || '가게 이름을 입력해주세요']"
              required
            ></v-text-field>
  
            <div class="location-info">
              <p class="location-text">
                <v-icon small color="blue">mdi-map-marker</v-icon>
                {{ locationText }}
              </p>
              <v-btn
                color="primary"
                text
                small
                @click="selectCurrentLocation"
                :disabled="isLocationSelected"
              >
                현재 위치로 설정
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            :disabled="!isFormValid || !isLocationSelected"
            @click="submitForm"
          >
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
            longitude: null
          }
        }
      };
    },
    computed: {
      locationText() {
        if (this.isLocationSelected) {
          return '위치가 설정되었습니다';
        }
        return '위치를 설정해주세요';
      }
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
            longitude: null
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
      submitForm() {
        if (this.isFormValid && this.isLocationSelected) {
          this.$emit('register-shop', { ...this.shopData });
          this.closeForm();
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .location-info {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }
  
  .location-text {
    display: flex;
    align-items: center;
    margin: 0;
  }
  
  .location-text .v-icon {
    margin-right: 8px;
  }
  </style>