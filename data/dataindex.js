/* data/dataindex.js – 통합 버전 (2025.10) */

// 전역으로 쓸 통합 데이터 객체
window.SoriDataIndex = window.SoriDataIndex || {};

// 각 카테고리 파일이 로드된 후, 이 파일이 마지막에 불리므로 병합 처리
(function(){
  try {
    const out = {};

    // 카테고리별 데이터가 존재하면 복사
    if (window.SoriDaily)  out.daily  = Array.isArray(window.SoriDaily)  ? window.SoriDaily  : [];
    if (window.SoriTravel) out.travel = Array.isArray(window.SoriTravel) ? window.SoriTravel : [];
    if (window.SoriDrama)  out.drama  = Array.isArray(window.SoriDrama)  ? window.SoriDrama  : [];

    // 전역 병합
    window.SoriDataIndex = Object.assign({}, window.SoriDataIndex, out);

    console.log("[SoriDataIndex]", window.SoriDataIndex);
  } catch (e) {
    console.error("Failed to build data index", e);
  }
})();
