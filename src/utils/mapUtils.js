/**
 * 카카오맵 API 스크립트를 로드하고 초기화하는 함수
 * @param {Function} callback - 스크립트 로드 완료 후 실행할 콜백 함수
 */
export const initKakaoMapScript = (callback) => {
  // 이미 정상적으로 초기화된 경우
  if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
    callback("success");
    return;
  }

  // 스크립트가 이미 로드 중인지 확인
  const existingScript = document.querySelector(
    'script[src*="dapi.kakao.com"]'
  );

  if (existingScript) {
    // 이미 스크립트가 로드 중이면 로드 완료 후 콜백 실행
    const checkKakaoInterval = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        clearInterval(checkKakaoInterval);
        callback("success");
      }
    }, 100);

    // 10초 후에도 로드되지 않으면 timeout 처리
    setTimeout(() => {
      clearInterval(checkKakaoInterval);
      if (!(window.kakao && window.kakao.maps && window.kakao.maps.services)) {
        console.error("카카오맵 API 로드 타임아웃");
        callback("timeout");
      }
    }, 10000);

    return;
  }

  // 새로 스크립트 로드
  const script = document.createElement("script");
  script.src =
    "//dapi.kakao.com/v2/maps/sdk.js?appkey=5ae6046cd1cdf2b9b22ab5dc66bac24c&libraries=services&autoload=false";
  script.async = true;

  script.onload = () => {
    // 스크립트 로드 후 카카오맵 초기화
    window.kakao.maps.load(() => {
      if (window.kakao.maps.services) {
        callback("success");
      } else {
        console.error("카카오맵 services 라이브러리 로드 실패");
        callback("error");
      }
    });
  };

  script.onerror = () => {
    console.error("카카오맵 API 스크립트 로드 실패");
    callback("error");
  };

  document.head.appendChild(script);
};

/**
 * 카카오맵 인스턴스 생성 함수
 * @param {String} elementId - 지도를 표시할 DOM 요소의 ID
 * @param {Object} options - 지도 생성 옵션
 * @param {Function} callback - 지도 생성 후 실행할 콜백 함수
 */
export const createKakaoMap = (elementId, options = {}, callback) => {
  initKakaoMapScript((status) => {
    if (status === "success") {
      const container = document.getElementById(elementId);
      const defaultOptions = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청
        level: 3, // 기본 확대 레벨
      };

      const mapOptions = { ...defaultOptions, ...options };
      const map = new window.kakao.maps.Map(container, mapOptions);

      callback(map);
    } else {
      console.error("지도를 생성할 수 없습니다.");
    }
  });
};

/**
 * 지도에 마커를 생성하는 함수
 * @param {Object} map - 카카오맵 인스턴스
 * @param {Object} position - 마커 위치 (latitude, longitude)
 * @param {Object} options - 마커 옵션 (이미지, 클릭 이벤트 등)
 * @returns {Object} 생성된 마커 객체
 */
export const createMarker = (map, position, options = {}) => {
  // 카카오맵 LatLng 객체 생성
  const markerPosition = new window.kakao.maps.LatLng(
    position.latitude || position.lat,
    position.longitude || position.lng
  );

  // 기본 마커 옵션
  const defaultOptions = {
    position: markerPosition,
    clickable: true,
  };

  // 사용자 지정 마커 이미지가 있는 경우
  if (options.imageUrl) {
    const imageSize = options.imageSize || { width: 24, height: 35 };
    const imageOption = options.imageOption || {
      offset: new window.kakao.maps.Point(12, 35),
    };

    const markerImage = new window.kakao.maps.MarkerImage(
      options.imageUrl,
      new window.kakao.maps.Size(imageSize.width, imageSize.height),
      imageOption
    );

    defaultOptions.image = markerImage;
  }

  // 최종 마커 옵션
  const markerOptions = { ...defaultOptions, ...options };

  // 마커 생성
  const marker = new window.kakao.maps.Marker(markerOptions);

  // 지도에 마커 추가
  marker.setMap(map);

  // 클릭 이벤트 핸들러 설정
  if (options.onClick) {
    window.kakao.maps.event.addListener(marker, "click", () => {
      options.onClick(marker, position);
    });
  }

  return marker;
};

/**
 * 마커에 인포윈도우를 추가하는 함수
 * @param {Object} map - 카카오맵 인스턴스
 * @param {Object} marker - 마커 객체
 * @param {String} content - 인포윈도우에 표시할 HTML 컨텐츠
 * @param {Object} options - 인포윈도우 옵션
 * @returns {Object} 생성된 인포윈도우 객체
 */
export const createInfoWindow = (map, marker, content, options = {}) => {
  const defaultOptions = {
    content: content,
    removable: options.removable || false,
  };

  // 위치 지정 (기본값: 마커 위)
  if (options.position) {
    defaultOptions.position = new window.kakao.maps.LatLng(
      options.position.latitude || options.position.lat,
      options.position.longitude || options.position.lng
    );
  }

  const infowindow = new window.kakao.maps.InfoWindow({
    ...defaultOptions,
    ...options,
  });

  // 인포윈도우를 지도에 표시
  if (options.showNow) {
    infowindow.open(map, marker);
  }

  // 마커 클릭 시 인포윈도우 표시 이벤트 설정
  if (options.openOnClick) {
    window.kakao.maps.event.addListener(marker, "click", function () {
      infowindow.open(map, marker);
    });
  }

  return infowindow;
};
