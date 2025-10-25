// 이메일 발송 서비스 (개발용 - 실제 운영에서는 Firebase Functions 사용 권장)
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "../js/firebase-init.js";

// 이메일 발송 함수 (개발용)
export async function sendNewsletterEmail(newsletterId, newsletterData) {
  try {
    console.log('뉴스레터 이메일 발송 시작:', newsletterId);
    
    // 구독자 목록 가져오기
    const subscribers = await getSubscribers();
    console.log('구독자 수:', subscribers.length);
    
    // 각 구독자에게 이메일 발송 (개발용 - 실제로는 서버에서 처리)
    for (const subscriber of subscribers) {
      await sendEmailToSubscriber(subscriber, newsletterData);
    }
    
    console.log('뉴스레터 이메일 발송 완료');
    return { success: true, sentCount: subscribers.length };
    
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    throw error;
  }
}

// 구독자 목록 가져오기
async function getSubscribers() {
  try {
    const q = query(
      collection(db, 'subscribers'),
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const subscribers = [];
    querySnapshot.forEach((doc) => {
      subscribers.push({ id: doc.id, ...doc.data() });
    });
    
    return subscribers;
  } catch (error) {
    console.error('구독자 목록 가져오기 실패:', error);
    return [];
  }
}

// 개별 구독자에게 이메일 발송 (개발용)
async function sendEmailToSubscriber(subscriber, newsletterData) {
  // 실제 운영에서는 여기서 이메일 서비스 API를 호출
  // 예: SendGrid, Mailgun, AWS SES 등
  
  console.log(`이메일 발송 시뮬레이션: ${subscriber.email}`);
  console.log('제목:', newsletterData.title);
  console.log('내용:', newsletterData.content.substring(0, 100) + '...');
  
  // 개발용 지연 (실제 API 호출 시뮬레이션)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return { success: true, email: subscriber.email };
}

// 이메일 템플릿 생성
export function createEmailTemplate(newsletterData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${newsletterData.title}</title>
      <style>
        body { font-family: 'Noto Sans KR', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .unsubscribe { margin-top: 20px; text-align: center; }
        .unsubscribe a { color: #7c3aed; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Sori Newsletter</h1>
      </div>
      <div class="content">
        <h2>${newsletterData.title}</h2>
        <div style="white-space: pre-wrap;">${newsletterData.content}</div>
      </div>
      <div class="footer">
        <p>이 이메일은 Sori 앱의 뉴스레터 구독자에게 발송되었습니다.</p>
        <div class="unsubscribe">
          <a href="https://sorikorea.com/unsubscribe?email={{EMAIL}}">구독 해제</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 실제 이메일 발송을 위한 Firebase Functions 호출 (권장)
export async function sendNewsletterViaFunctions(newsletterId, newsletterData) {
  try {
    // Firebase Functions 엔드포인트 호출
    const response = await fetch('https://your-region-your-project.cloudfunctions.net/sendNewsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newsletterId,
        newsletterData
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Firebase Functions 호출 실패:', error);
    throw error;
  }
}
