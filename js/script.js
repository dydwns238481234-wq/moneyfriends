// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
    loadFloating();

    initializeIntroLive();
    updateLiveTime();
    setupPartnerLogosScroll();

    setupRequestButtonsPixelTracking();

    setTimeout(() => {
        handleScrollAnimation();
        animateCountUp();
    }, 100);
});

// 헤더 로드 함수
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        const html = await response.text();
        document.getElementById('header-container').innerHTML = html;
        setupMobileMenu();
        // setupHeaderPixelTracking();
    } catch (error) {
        console.error('헤더 로드 중 오류 발생:', error);
    }
}

// 푸터 로드 함수
async function loadFooter() {
    try {
        const response = await fetch('footer.html');
        const html = await response.text();
        document.getElementById('footer-container').innerHTML = html;
    } catch (error) {
        console.error('푸터 로드 중 오류 발생:', error);
    }
}

// 플로팅 로드 함수
async function loadFloating() {
    try {
        const response = await fetch('floating.html');
        const html = await response.text();
        document.getElementById('floating-container').innerHTML = html;
        setupFloatingConsultCount();
        setupFloatingPixelTracking();
    } catch (error) {
        console.error('플로팅 로드 중 오류 발생:', error);
    }
}

// 플로팅 말풍선 랜덤 숫자 (floating.html 삽입 후에만 DOM에 존재)
function setupFloatingConsultCount() {
    var countEl = document.getElementById('floatingConsultCount');
    if (!countEl) return;
    var cookieName = 'moneycon_consult_count_v1';

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : '';
    }

    function setCookie(name, value, expiresAt) {
        var expires = expiresAt ? '; expires=' + expiresAt.toUTCString() : '';
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
    }

    function todayKey() {
        var d = new Date();
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function endOfToday() {
        var d = new Date();
        d.setHours(24, 0, 0, 0);
        return d;
    }

    var min = 20;
    var max = 40;
    var key = todayKey();
    var cached = getCookie(cookieName);
    var n = 0;

    if (cached) {
        var parts = cached.split('|');
        if (parts.length === 2 && parts[0] === key) {
            n = Number(parts[1]);
        }
    }

    if (!Number.isFinite(n) || n < min || n > max) {
        n = Math.floor(Math.random() * (max - min + 1)) + min;
        setCookie(cookieName, key + '|' + String(n), endOfToday());
    }

    countEl.textContent = String(n);
}

// 플로팅 버튼 픽셀 트래킹 바인딩
function setupFloatingPixelTracking() {
    const container = document.getElementById('floating-container');
    if (!container) return;

    // 메타 픽셀이 로드될 때까지 기다림
    function waitForPixelAndSetup() {
        if (typeof fbq === 'function') {
            const callBtn = container.querySelector('#floating-call, .floating-call');
            const kakaoBtn = container.querySelector('#floating-kakao, .floating-kakao');

            if (callBtn) {
                callBtn.addEventListener('click', function() {
                    if (typeof fbq === 'function') {
                        fbq('trackCustom', 'CallButtonClick', { button_name: '전화문의' });
                    }
                });
            }

            if (kakaoBtn) {
                kakaoBtn.addEventListener('click', function() {
                    if (typeof fbq === 'function') {
                        fbq('trackCustom', 'KakaoTalkClick', { value: 3000, currency: 'KRW' });
                    }
                });
            }
        } else {
            // 메타 픽셀이 아직 로드되지 않았으면 100ms 후 다시 시도
            setTimeout(waitForPixelAndSetup, 100);
        }
    }

    waitForPixelAndSetup();
}

// request 페이지 상담 버튼 픽셀 트래킹 바인딩
function setupRequestButtonsPixelTracking() {
    // 메타 픽셀이 로드될 때까지 기다림
    function waitForPixelAndSetup() {
        if (typeof fbq === 'function') {
            const phoneBtn = document.querySelector('.request-button-link.phone');
            const kakaoBtn = document.querySelector('.request-button-link.kakao');

            if (phoneBtn) {
                phoneBtn.addEventListener('click', function(e) {
                    // 기본 동작 차단 (즉시 전화 앱 열림 방지)
                    e.preventDefault();

                    // 픽셀 이벤트 전송
                    if (typeof fbq === 'function') {
                        fbq('trackCustom', 'CallButtonClick', { button_name: '전화문의' });
                    }

                    // 이벤트 전송 후 링크 실행 (150ms 지연)
                    setTimeout(function() {
                        window.location.href = phoneBtn.getAttribute('href');
                    }, 150);
                });
            }

            if (kakaoBtn) {
                kakaoBtn.addEventListener('click', function(e) {
                    // 기본 동작 차단 (즉시 새 탭 열림 방지)
                    e.preventDefault();

                    // 픽셀 이벤트 전송
                    if (typeof fbq === 'function') {
                        fbq('trackCustom', 'KakaoTalkClick', { value: 3000, currency: 'KRW' });
                    }

                    // 이벤트 전송 후 링크 실행 (150ms 지연)
                    const kakaoUrl = kakaoBtn.getAttribute('href');
                    setTimeout(function() {
                        window.open(kakaoUrl, '_blank');
                    }, 150);
                });
            }
        } else {
            // 메타 픽셀이 아직 로드되지 않았으면 100ms 후 다시 시도
            setTimeout(waitForPixelAndSetup, 100);
        }
    }

    waitForPixelAndSetup();
}

// 메타 CAPI Lead 전송 (카톡 상담 버튼 클릭 시점)
function sendMetaLead() {
    const eventId = 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2);

    // 1. 메타 픽셀 발사 (브라우저)
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            value: 50000,
            currency: 'KRW'
        }, { eventID: eventId });
    }

    // 2. CAPI 서버로 전송 (서버사이드)
    fetch('https://moneyfriends-capi.vercel.app/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event_id: eventId,
            event_name: 'Lead',
            url: window.location.href,
            fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || null,
            fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] || null
        })
    }).catch(() => {}); // 실패해도 카톡 이동은 정상 진행
}

// 동적 삽입되는 플로팅(floating.html)까지 포함해 카톡 버튼 클릭을 누락 없이 캐치
document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button');
    if (!el) return;

    const href = el.getAttribute('href') || '';

    const isKakaoButton =
        el.matches('.floating-kakao, .request-button-link.kakao') ||
        (typeof href === 'string' && (href.includes('pf.kakao') || href.includes('vo.la/')));

    if (isKakaoButton) sendMetaLead();
});

// 모바일 메뉴 설정 함수
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const closeBtn = document.querySelector('.close-btn');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        closeBtn.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });

        const menuItems = document.querySelectorAll('.nav-list a');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// 새로운 실시간 테이블 데이터 (main-introduce용)
const introLiveData = [
    { name: '최**', product: '휴대폰 스마트론', amount: '200,000원' },
    { name: '김**', product: '신용카드 스마트론', amount: '7,500,000원' },
    { name: '이**', product: '휴대폰 스마트론', amount: '750,000원' },
    { name: '윤**', product: '휴대폰 스마트론', amount: '1,000,000원' },
    { name: '김**', product: '신용카드 스마트론', amount: '10,000,000원' },
    { name: '이**', product: '신용카드 스마트론', amount: '5,000,000원' },
    { name: '박**', product: '신용카드 스마트론', amount: '8,000,000원' },
    { name: '최**', product: '휴대폰 스마트론', amount: '100,000원' },
    { name: '한**', product: '신용카드 스마트론', amount: '3,000,000원' },
    { name: '서**', product: '휴대폰 스마트론', amount: '1,000,000원' },
    { name: '차**', product: '신용카드 스마트론', amount: '700,000원' },
    { name: '이**', product: '신용카드 스마트론', amount: '15,000,000원' },
    { name: '장**', product: '신용카드 스마트론', amount: '6,000,000원' },
    { name: '김**', product: '신용카드 스마트론', amount: '3,800,000원' },
];

// 실시간 시간 업데이트
function updateLiveTime() {
    const timeElement = document.getElementById('liveTime');
    if (!timeElement) return;

    function update() {
        const now = new Date();
        const month = now.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
        const date = now.getDate();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${month}월 ${date}일 ${hours}:${minutes}`;
    }

    update();
    setInterval(update, 1000);
}

// 새로운 실시간 행 생성 함수
function createIntroLiveRow(data) {
    const productIcon = data.product === '휴대폰 스마트론' ? 'fa-mobile' : data.product === '신용카드 스마트론' ? 'fa-credit-card-alt' : 'fa-gift';
    return `
        <div class="live-row">
            <div class="col-name">
                <span class="name">${data.name}</span>
            </div>
            <div class="col-product">
                <i class="fa-solid ${productIcon}"></i>
                <span class="product-name">${data.product}</span>
            </div>
            <div class="col-amount">${data.amount}</div>
            <div class="col-status"><span class="status-badge">입금완료</span></div>
        </div>
    `;
}

// 새로운 실시간 테이블 초기화
function initializeIntroLive() {
    const liveBody = document.getElementById('introLiveBody');
    if (!liveBody) return;

    // 초기 데이터 생성
    liveBody.innerHTML = introLiveData.map(data => createIntroLiveRow(data)).join('');

    let isAnimating = false;
    const animationDuration = 1000;
    const pauseDuration = 2500;

    function animateLive() {
        if (isAnimating) return;
        isAnimating = true;

        // 새로운 행 생성
        const randomData = introLiveData[Math.floor(Math.random() * introLiveData.length)];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createIntroLiveRow(randomData);
        const newRow = tempDiv.firstElementChild;
        newRow.style.opacity = '0';
        liveBody.appendChild(newRow);

        // 첫 번째 행의 높이 가져오기
        const rows = liveBody.querySelectorAll('.live-row');
        const rowHeight = rows[0].offsetHeight;

        // 애니메이션 시작
        liveBody.style.transition = `transform ${animationDuration}ms ease-in-out`;
        liveBody.style.transform = `translateY(-${rowHeight}px)`;

        // 애니메이션 완료 후
        setTimeout(() => {
            liveBody.style.transition = 'none';
            liveBody.style.transform = 'translateY(0)';
            rows[0].remove();
            newRow.style.opacity = '1';
            isAnimating = false;

            setTimeout(animateLive, pauseDuration);
        }, animationDuration);
    }

    setTimeout(animateLive, pauseDuration);
}

// 스크롤 애니메이션
function handleScrollAnimation() {
    const fadeElements = document.querySelectorAll('.fade-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 화면에 요소가 들어왔을 때
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // 화면에서 요소가 나갔을 때
                if (entry.boundingClientRect.top > 0) {
                    // 위로 스크롤해서 요소가 나간 경우에만 active 클래스 제거
                    entry.target.classList.remove('active');
                }
            }
        });
    }, {
        threshold: 0.3, // 요소가 20% 이상 보일 때 애니메이션 실행
        rootMargin: '-50px 0px' // 상하 50px 여백을 둠
    });

    fadeElements.forEach(element => {
        observer.observe(element);
        // 페이지 로드 시 이미 화면에 보이는 요소들에 대한 처리
        if (element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add('active');
        }
    });
}

// 숫자 카운트업 애니메이션
function animateCountUp() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');

                const target = parseInt(entry.target.dataset.target);
                const unit = entry.target.querySelector('.stat-unit');
                const unitText = unit ? unit.textContent : '';
                const duration = 1000; // 1.5초
                const startTime = performance.now();

                function updateNumber(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // easeOutExpo 이징 함수 적용
                    const easeProgress = 1 - Math.pow(1 - progress, 4);
                    const currentValue = Math.floor(easeProgress * target);

                    // 천 단위 콤마 포맷팅
                    const formattedValue = currentValue.toLocaleString('ko-KR');

                    if (unit) {
                        entry.target.innerHTML = formattedValue + '<span class="stat-unit">' + unitText + '</span>';
                    } else {
                        entry.target.textContent = formattedValue;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateNumber);
                    } else {
                        // 최종 값 설정 (정확한 목표값)
                        const finalValue = target.toLocaleString('ko-KR');
                        if (unit) {
                            entry.target.innerHTML = finalValue + '<span class="stat-unit">' + unitText + '</span>';
                        } else {
                            entry.target.textContent = finalValue;
                        }
                    }
                }

                requestAnimationFrame(updateNumber);
            }
        });
    }, {
        threshold: 0.5
    });

    statNumbers.forEach(el => observer.observe(el));
}

// 모바일 환경에서 파트너 로고 자동 스크롤
function setupPartnerLogosScroll() {
    const partnersWrapper = document.querySelector('.partners-logo-wrapper');
    if (!partnersWrapper) return;

    // 모바일 환경에서만 동작
    if (window.innerWidth <= 768) {
        let scrollPosition = 0;
        const scrollSpeed = 1; // 스크롤 속도 (픽셀/프레임)
        const scrollInterval = 30; // 스크롤 간격 (밀리초)
        const scrollStep = 1; // 한 번에 스크롤할 픽셀 수

        // 자동 스크롤 함수
        function autoScroll() {
            scrollPosition += scrollStep;

            // 스크롤이 끝에 도달하면 처음으로 돌아감
            if (scrollPosition >= partnersWrapper.scrollWidth - partnersWrapper.clientWidth) {
                scrollPosition = 0;
            }

            partnersWrapper.scrollLeft = scrollPosition;
        }

        // 자동 스크롤 시작
        const scrollTimer = setInterval(autoScroll, scrollInterval);

        // 마우스 오버 시 스크롤 일시 중지
        partnersWrapper.addEventListener('mouseenter', () => {
            clearInterval(scrollTimer);
        });

        // 마우스 아웃 시 스크롤 재개
        partnersWrapper.addEventListener('mouseleave', () => {
            setInterval(autoScroll, scrollInterval);
        });

        // 터치 이벤트 처리
        let touchStartX = 0;
        let touchStartScrollLeft = 0;

        partnersWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartScrollLeft = partnersWrapper.scrollLeft;
            clearInterval(scrollTimer);
        });

        partnersWrapper.addEventListener('touchend', () => {
            setInterval(autoScroll, scrollInterval);
        });
    }
}

// FAQ 아코디언
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // 클릭된 항목의 상태만 토글합니다
            item.classList.toggle('active');
        });
    });
});

// 구글 시트 폼 제출 처리
document.addEventListener('DOMContentLoaded', function() {
    // console.log('DOMContentLoaded 이벤트 발생');

    const loanForm = document.getElementById('loanForm');
    const formStatus = document.getElementById('formStatus');

    // console.log('폼 요소:', loanForm);

    if (loanForm) {
        // console.log('폼 이벤트 리스너 등록');

        loanForm.addEventListener('submit', function(e) {
            // console.log('폼 제출 이벤트 발생');

            // 기본 제출 동작 방지
            e.preventDefault();

            // 폼 상태 업데이트
            formStatus.style.display = 'block';
            formStatus.querySelector('.loading').style.display = 'block';
            formStatus.querySelector('.error').style.display = 'none';
            formStatus.querySelector('.success').style.display = 'none';

            // 폼 데이터 수집
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const product = document.getElementById('product').value;
            const privacy = document.getElementById('privacy').checked ? '동의' : '미동의';

            // console.log('폼 데이터:', { name, phone, product, privacy });

            // 구글 스크립트 URL
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxXtS6qxDltI-NE_atO_ya_ji3Ox_1v1Zqhr4b6Rf8dZPtyLQ1aB30_pEwnhBm4rRnnng/exec';

            // URL 파라미터 생성
            const params = new URLSearchParams();
            params.append('name', name);
            params.append('phone', phone);
            params.append('product', product);
            params.append('privacy', privacy);

            const url = scriptURL + '?' + params.toString();
            // console.log('요청 URL:', url);

            // 폼 데이터 전송
            fetch(url, {
                method: 'GET',
                mode: 'no-cors'
            })
            .then(() => {
                // console.log('요청 성공');

                // 성공 메시지 표시
                formStatus.querySelector('.loading').style.display = 'none';
                formStatus.querySelector('.success').style.display = 'block';

                // 3초 후 폼 상태 숨기기
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 3000);

                // 폼 초기화
                loanForm.reset();

                // 성공 알림
                alert('상담 신청이 완료되었습니다!\n담당 상담사가 빠른 시일 내에 연락드리겠습니다.');
            })
            .catch(error => {
                // console.error('요청 오류:', error);

                // 오류 메시지 표시
                formStatus.querySelector('.loading').style.display = 'none';
                formStatus.querySelector('.error').style.display = 'block';

                // 오류 알림
                alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
            });

            return false;
        });
    } else {
        // console.error('폼 요소를 찾을 수 없습니다.');
    }
});

// 팝업 외부 클릭시 닫기
// document.getElementById('privacyPopup').addEventListener('click', function(e) {
//     if (e.target === this) {
//         closePrivacyPopup();
//     }
// });

// function openPrivacyPopup() {
//     document.getElementById('privacyPopup').style.display = 'block';
//     document.body.style.overflow = 'hidden';
// }

// function closePrivacyPopup() {
//     document.getElementById('privacyPopup').style.display = 'none';
//     document.body.style.overflow = 'auto';
// }

// function agreePrivacyPolicy() {
//     document.getElementById('privacy').checked = true;
//     closePrivacyPopup();
// }

