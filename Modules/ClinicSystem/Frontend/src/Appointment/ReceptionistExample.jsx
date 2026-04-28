import React from 'react';
import '../Appointment/ReceptionistSidebar.css';

const ReceptionistExample = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '20px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>
          ✨ Sidebar الجديد للـ Receptionist ✨
        </h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          تم إنشاء sidebar متقدم قابل للفتح والإغلاق مع تصميم مطابق لـ doctor sidebar
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ color: '#1e40af', marginBottom: '1rem' }}>🎯 الميزات الجديدة</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>✅ قابل للفتح والإغلاق</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ تصميم مطابق للـ doctor</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ أزرار خاصة بالـ receptionist</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ دعم كامل للموبايل</li>
          </ul>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ color: '#059669', marginBottom: '1rem' }}>📋 المكونات الخاصة</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>🏠 لوحة التحكم</li>
            <li style={{ marginBottom: '0.5rem' }}>📅 المواعيد</li>
            <li style={{ marginBottom: '0.5rem' }}>👤 طلبات المرضى</li>
            <li style={{ marginBottom: '0.5rem' }}>📊 التقارير</li>
            <li style={{ marginBottom: '0.5rem' }}>⚙️ الإعدادات</li>
          </ul>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>🎨 التصميم</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>🌟 Glassmorphism effects</li>
            <li style={{ marginBottom: '0.5rem' }}>🎭 أنيميشن سلس</li>
            <li style={{ marginBottom: '0.5rem' }}>🎨 ألوان متناسقة</li>
            <li style={{ marginBottom: '0.5rem' }}>📱 Responsive design</li>
          </ul>
        </div>
      </div>

      <div style={{
        background: '#f8fafc',
        padding: '2rem',
        borderRadius: '15px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>📖 كيفية الاستخدام</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: '#3b82f6',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>1</div>
            <span>انقر على زر القائمة الجانبية في أعلى اليسار لفتح الـ sidebar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: '#10b981',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>2</div>
            <span>استخدم أزرار التنقل المختلفة (لوحة التحكم، المواعيد، طلبات المرضى، إلخ)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: '#f59e0b',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>3</div>
            <span>انقر على أي مكان خارج الـ sidebar أو الزر مرة أخرى للإغلاق</span>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        borderRadius: '15px',
        color: 'white'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>🎉 تم الانتهاء بنجاح!</h4>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Sidebar الـ receptionist جاهز للاستخدام بجميع المزايا المطلوبة
        </p>
      </div>
    </div>
  );
};

export default ReceptionistExample;
