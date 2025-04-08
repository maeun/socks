// 모든 picker 이미지를 가져옵니다
const requirePickerImages = require.context(
    "@/assets/pickers",
    false,
    /\.png$/
  );
  const pickerImagePaths = requirePickerImages.keys().map(requirePickerImages);
  
  /**
   * Kakao 지도 스크립트 로드 함수
   * @param {Function} callback - 스크립트 로드 후 실행할 콜백 함수
   */
  export function initKakaoMapScript(callback) {
    if (window.kakao && window.kakao.maps) {
      callback();
    } else {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=5ae6046cd1cdf2b9b22ab5dc66bac24c&autoload=false";
      script.onload = () => window.kakao.maps.load(callback);
      document.head.appendChild(script);
    }
  }
  
  /**
   * 랜덤 picker 이미지 가져오기
   * @returns {String} 랜덤 이미지 경로
   */
  export function getRandomPickerImage() {
    const randomIndex = Math.floor(Math.random() * pickerImagePaths.length);
    return pickerImagePaths[randomIndex];
  }
  
  /**
   * 마커 생성 함수
   * @param {Number} latitude - 위도
   * @param {Number} longitude - 경도
   * @param {Object} map - 카카오맵 객체
   * @returns {Object} 생성된 마커 객체
   */
  export function createMarker(latitude, longitude, map) {
    const markerImage = new kakao.maps.MarkerImage(
      getRandomPickerImage(),
      new kakao.maps.Size(70, 70),
      { offset: new kakao.maps.Point(20, 40) }
    );
    const position = new kakao.maps.LatLng(latitude, longitude);
    const marker = new kakao.maps.Marker({ position, image: markerImage });
  
    marker.setMap(map);
    return marker;
  }