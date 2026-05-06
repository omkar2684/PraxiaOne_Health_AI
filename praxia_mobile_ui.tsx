import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput
} from 'react-native';

// --- THEME ---
const COLORS = {
  primary: '#1E8449', // Praxia Green
  secondary: '#2C3E50', // Dark Blue/Slate
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#333333',
  textMuted: '#7F8C8D',
  border: '#E0E0E0',
  white: '#FFFFFF',
  success: '#27AE60',
  warning: '#F39C12',
  info: '#2980B9',
  danger: '#E74C3C',
  badgeBg: '#E9F7EF',
  badgeText: '#27AE60',
};

const { width } = Dimensions.get('window');

// --- MAIN APP (State Router) ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');

  const navigate = (screen: string) => setCurrentScreen(screen);

  return (
    <SafeAreaView style={styles.safeArea}>
      {currentScreen === 'Welcome' && <WelcomeScreen navigate={navigate} />}
      {currentScreen === 'DataSources' && <DataSourcesScreen navigate={navigate} />}
      {currentScreen === 'ConnectData' && <ConnectDataScreen navigate={navigate} />}
      {currentScreen === 'HealthScore' && <HealthScoreScreen navigate={navigate} />}
      {currentScreen === 'Assistant' && <AssistantScreen navigate={navigate} />}
      {currentScreen === 'Forecast' && <ForecastScreen navigate={navigate} />}
      {currentScreen === 'Recommendation' && <RecommendationScreen navigate={navigate} />}
      {currentScreen === 'CareConnection' && <CareConnectionScreen navigate={navigate} />}
      {currentScreen === 'Journey' && <JourneyScreen navigate={navigate} />}
    </SafeAreaView>
  );
}

// --- SCREEN 1: WELCOME ROUTE ---
const WelcomeScreen = ({ navigate }: { navigate: any }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.headerCentered}>
        <Text style={styles.logoText}>🍵 PraxiaOne</Text>
        <Text style={styles.tagline}>AI-Driven Personalized Health</Text>
      </View>

      <View style={styles.heroBanner}>
        <View style={styles.heroOverlay}>
             <Text style={styles.heroTitle}>Your Health,</Text>
             <Text style={styles.heroTitle}>Your Data,</Text>
             <Text style={styles.heroTitle}>Your Way</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigate('DataSources')}>
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featureGrid}>
        <FeatureItem icon="📊" title="Personalized Wellness Insights" desc="" />
        <FeatureItem icon="🔒" title="Secure Data Integration" desc="EHR, Labs, Wearables, DNA" />
        <FeatureItem icon="💡" title="AI-Assisted Guidance" desc="Smart Health Recommendations" />
        <FeatureItem icon="🩺" title="Optional Telehealth Access" desc="Connect with Providers" />
      </View>

      <View style={styles.hipaaBlock}>
        <Text style={styles.hipaaText}>✅ HIPAA Compliant  🔒 Secure & Encrypted</Text>
        <TouchableOpacity style={styles.hipaaBtn}>
          <Text style={styles.hipaaBtnText}>View Controlled Consent</Text>
        </TouchableOpacity>
        <View style={styles.legalLinksRow}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
          <Text style={styles.legalLink}>Terms of Service</Text>
          <Text style={styles.legalLink}>Contact Us</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// --- SCREEN 2: DATA SOURCES ---
const DataSourcesScreen = ({ navigate }: { navigate: any }) => {
  return (
    <View style={styles.containerFlex}>
      <View style={styles.navHeader}>
        <Text style={styles.logoTextSmall}>🍵 PraxiaOne</Text>
        <Text style={styles.hamburger}>☰</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.screenTitle}>Your Data Sources</Text>
        
        <View style={styles.card}>
            <DataSourceItem icon="⚕️" name="Amazon One Medical" status="Connected" isLast={false} />
            <DataSourceItem icon="❤️" name="Apple Health" status="Connected" isLast={false} />
            <DataSourceItem icon="📱" name="Fitbit" status="Connected" isLast={false} />
            <DataSourceItem icon="📡" name="5G Device" status="Connected" isLast={true} />
        </View>

        <TouchableOpacity style={styles.btnOutline} onPress={() => navigate('ConnectData')}>
          <Text style={styles.btnOutlineText}>+ Connect More</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnPrimary, { marginTop: 15 }]} onPress={() => navigate('HealthScore')}>
          <Text style={styles.btnPrimaryText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBar active="Dashboard" navigate={navigate} />
    </View>
  );
};

// --- SCREEN 3: CONNECT DATA ---
const ConnectDataScreen = ({ navigate }: { navigate: any }) => {
  return (
    <View style={styles.containerFlex}>
      <View style={styles.backHeader}>
        <TouchableOpacity onPress={() => navigate('DataSources')}>
          <Text style={styles.backText}>← Connect Data</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>
          Add more data from a compatible device or upload results to improve your insights.
        </Text>
        
        <View style={[styles.card, { marginTop: 10 }]}>
            <ConnectItem icon="⌚" name="Smart Watch" action="Connect >" type="connect" isLast={false} />
            <ConnectItem icon="💍" name="Smart Ring" action="Connect >" type="connect" isLast={false} />
            <ConnectItem icon="🧪" name="Lab Results" action="Upload ↑" type="upload" isLast={false} />
            <ConnectItem icon="📋" name="Care Plan" action="Upload ↑" type="upload" isLast={false} />
            <ConnectItem icon="📑" name="Health Report" action="Self Submit ↑" type="upload" isLast={true} />
        </View>
      </ScrollView>

      <BottomTabBar active="" navigate={navigate} />
    </View>
  );
};

// --- SCREEN 4: HEALTH SCORE ---
const HealthScoreScreen = ({ navigate }: { navigate: any }) => {
  return (
    <View style={styles.containerFlex}>
      <View style={styles.navHeaderCentered}>
        <Text style={styles.screenTitleCenter}>Your Health Score</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.gaugeContainer}>
           <View style={styles.gaugeArc}>
              <Text style={styles.gaugeScore}>78</Text>
              <Text style={styles.gaugeSub}>/100</Text>
              <View style={styles.badgeSuccess}><Text style={styles.badgeText}>Good</Text></View>
           </View>
        </View>

        <Text style={styles.sectionHeader}>Key Factors</Text>
        
        <View style={styles.card}>
            <FactorItem icon="💧" color={COLORS.warning} name="Glucose" value="118 mg/dL" isLast={false} />
            <FactorItem icon="🏃" color={COLORS.success} name="Activity" value="72 / 100" isLast={false} />
            <FactorItem icon="🌙" color={COLORS.info} name="Sleep" value="7h 20m" isLast={true} />
        </View>

        <TouchableOpacity style={[styles.btnSecondary, { marginTop: 20 }]} onPress={() => navigate('Assistant')}>
          <Text style={styles.btnSecondaryText}>View Details</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBar active="Dashboard" navigate={navigate} />
    </View>
  );
};

// --- SCREEN 5: AI ASSISTANT ---
const AssistantScreen = ({ navigate }: { navigate: any }) => {
  return (
    <View style={styles.containerFlex}>
      <View style={styles.assistantBanner}>
         <Text style={{fontSize:40, textAlign: 'center'}}>👩‍⚕️</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.chatGreeting}>
          Hi Maria! Let's take a closer look at your health data and find ways to improve your score.
        </Text>
        
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
             <Text style={styles.insightTitle}>🟡 Glucose</Text>
             <View style={styles.badgeNeutral}><Text style={styles.badgeNeutralText}>Balanced Diet</Text></View>
          </View>
          <Text style={styles.insightBody}>Avoid high-sugar foods and stick to a balanced diet to keep glucose levels in check.</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
             <Text style={styles.insightTitle}>🏃 Activity</Text>
             <View style={styles.badgeNeutral}><Text style={styles.badgeNeutralText}>More Steps</Text></View>
          </View>
          <Text style={styles.insightBody}>Aim for 8,000 steps a day to boost your score.</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
             <Text style={styles.insightTitle}>🌙 Sleep</Text>
             <View style={styles.badgeNeutral}><Text style={styles.badgeNeutralText}>Bedtime Routine</Text></View>
          </View>
          <Text style={styles.insightBody}>Try to go to bed and wake up at the same time each day for better sleep.</Text>
        </View>

        <TouchableOpacity style={[styles.btnPrimary, {marginBottom: 20}]} onPress={() => navigate('Forecast')}>
          <Text style={styles.btnPrimaryText}>Got it, thanks!</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.chatInputRow}>
         <TextInput style={styles.chatInput} placeholder="Type your message..." placeholderTextColor={COLORS.textMuted} />
         <Text style={styles.chatMic}>🎤</Text>
         <View style={styles.chatSend}><Text style={{color:'#fff', fontSize: 16}}>✨</Text></View>
      </View>
    </View>
  );
}

// --- SCREEN 6: FORECAST ---
const ForecastScreen = ({ navigate }: { navigate: any }) => {
  return (
    <View style={styles.containerFlex}>
       <View style={styles.backHeaderCenter}>
        <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigate('Assistant')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitleCenter}>8-Week Forecast</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
           <Text style={styles.forecastSub}>If nothing changes</Text>
           <Text style={styles.forecastScore}>Score → <Text style={{color: COLORS.danger}}>72</Text></Text>
           
           <View style={styles.chartPlaceholder}>
              <Text style={{color: COLORS.danger, fontWeight:'bold'}}>📉</Text>
           </View>
           <View style={{flexDirection:'row', justifyContent:'space-between'}}>
             <Text style={styles.chartLabel}>Today</Text>
             <Text style={styles.chartLabel}>8 wks</Text>
           </View>
        </View>

        <Text style={styles.sectionHeader}>What if you...</Text>
        
        <View style={styles.card}>
           <View style={[styles.listItem, styles.noBorder, {paddingBottom:10}]}>
             <Text style={styles.listIcon}>🏃</Text>
             <Text style={[styles.listTitle, {flex: 1}]}>Walk 30 min/day</Text>
             <Text style={styles.listTitle}>→ Score <Text style={{color: COLORS.success}}>82</Text></Text>
           </View>
           <View style={[styles.listItem, styles.noBorder, {paddingVertical:10}]}>
             <Text style={styles.listIcon}>🌙</Text>
             <Text style={[styles.listTitle, {flex: 1}]}>Improve Sleep</Text>
             <Text style={styles.listTitle}>→ Score <Text style={{color: COLORS.success}}>85</Text></Text>
           </View>
           
           <View style={styles.insightCardInside}>
             <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>🌙 Sleep</Text>
                <View style={styles.badgeNeutral}><Text style={styles.badgeNeutralText}>Bedtime Routine</Text></View>
             </View>
             <Text style={styles.insightBody}>Try to go to bed and wake up at the same time each day for better sleep.</Text>
           </View>

           <TouchableOpacity style={[styles.btnPrimary, {marginTop: 15, marginBottom: 5}]} onPress={() => navigate('Recommendation')}>
              <Text style={styles.btnPrimaryText}>Simulate Changes</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabBar active="Trends" navigate={navigate} />
    </View>
  );
};

// --- SCREEN 7: RECOMMENDATION ---
const RecommendationScreen = ({ navigate }: { navigate: any }) => {
  return (
    <View style={styles.containerFlex}>
       <View style={styles.backHeaderCenter}>
        <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigate('Forecast')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitleCenter}>Recommended Action</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={{alignItems:'center', marginTop: 30, marginBottom: 20}}>
           <View style={styles.hugeIconCircle}>
              <Text style={styles.hugeIcon}>🏃</Text>
           </View>
           <Text style={styles.hugeTitle}>Walk 30 Minutes Daily</Text>
           <Text style={styles.hugeSubtitle}>Highest impact to improve score and reduce glucose risk</Text>
        </View>

        <View style={styles.impactCard}>
           <Text style={styles.impactTitle}>Impact in 8 weeks</Text>
           <View style={styles.impactRow}>
              <Text style={styles.impactValueScore}>+8 pts</Text>
              <Text style={styles.impactValueStat}>-20% Glucose</Text>
           </View>
        </View>

        <TouchableOpacity style={[styles.btnPrimary, {marginTop: 30}]} onPress={() => navigate('CareConnection')}>
           <Text style={styles.btnPrimaryText}>Start Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btnSecondaryTransparent, {marginTop: 10}]}>
           <Text style={styles.btnSecondaryTextMuted}>See Alternatives</Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomTabBar active="Trends" navigate={navigate} />
    </View>
  );
};

// --- SCREEN 8: CARE ESCALATION ---
const CareConnectionScreen = ({ navigate }: { navigate: any }) => {
  return (
    <View style={styles.containerFlex}>
       <View style={styles.backHeaderCenter}>
        <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigate('Recommendation')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitleCenter}>Time to Connect</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.careMessage}>
          Based on your health trend, speaking with a provider is recommended.
        </Text>
        
        <View style={[styles.card, {padding: 15, marginTop: 20}]}>
           <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={styles.doctorAvatar}>👨‍⚕️</Text>
              <View style={{marginLeft: 15}}>
                 <Text style={styles.doctorName}>Dr. James Smith</Text>
                 <Text style={styles.doctorSpec}>Internal Medicine</Text>
                 <Text style={styles.doctorAvail}>✅ Available this week</Text>
              </View>
           </View>
           
           <TouchableOpacity style={[styles.btnPrimary, {marginTop: 20}]} onPress={() => navigate('Journey')}>
             <Text style={styles.btnPrimaryText}>Book Visit</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={[styles.btnSecondary, {marginTop: 10}]}>
             <Text style={styles.btnSecondaryText}>Message Doctor</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={[styles.btnSecondaryTransparent, {marginTop: 15}]}>
             <Text style={styles.btnSecondaryTextMuted}>Skip for now</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// --- SCREEN 9: JOURNEY FLOW ---
const JourneyScreen = ({ navigate }: { navigate: any }) => {
  return (
    <View style={styles.containerFlex}>
       <View style={styles.backHeaderCenter}>
        <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => navigate('CareConnection')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitleCenter}>Your Journey</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
           <JourneyItem icon="🔄" title="Connect Data" dot={true} />
           <JourneyItem icon="📊" title="Health Score" value="78" active={true} />
           <JourneyItem icon="💡" title="Understand Why" />
           <JourneyItem icon="🧪" title="Simulate Changes" />
           <JourneyItem icon="🏃" title="Take Action" />
           <JourneyItem icon="📈" title="Track Progress" />
           <JourneyItem icon="👨‍⚕️" title="Get Care" isLast={true} />
        </View>
      </ScrollView>
    </View>
  );
};


// --- REUSABLE COMPONENTS ---

const FeatureItem = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    {desc ? <Text style={styles.featureDesc}>{desc}</Text> : null}
  </View>
);

const DataSourceItem = ({ icon, name, status, isLast }: { icon: string, name: string, status: string, isLast: boolean }) => (
  <View style={[styles.listItem, isLast && styles.noBorder]}>
    <Text style={styles.listIcon}>{icon}</Text>
    <View style={styles.listTextContainer}>
      <Text style={styles.listTitle}>{name}</Text>
      <Text style={styles.listStatus}>✅ {status}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </View>
);

const ConnectItem = ({ icon, name, action, type, isLast }: { icon: string, name: string, action: string, type: string, isLast: boolean }) => (
  <View style={[styles.listItem, isLast && styles.noBorder]}>
    <Text style={styles.listIcon}>{icon}</Text>
    <Text style={[styles.listTitle, { flex: 1 }]}>{name}</Text>
    <TouchableOpacity style={[styles.actionBtn, type === 'upload' && styles.actionBtnAlt]}>
      <Text style={styles.actionBtnText}>{action}</Text>
    </TouchableOpacity>
  </View>
);

const FactorItem = ({ icon, color, name, value, isLast }: { icon: string, color: string, name: string, value: string, isLast: boolean }) => (
  <View style={[styles.listItem, isLast && styles.noBorder]}>
    <Text style={[styles.listIcon, { color: color }]}>{icon}</Text>
    <Text style={[styles.listTitle, { flex: 1 }]}>{name}</Text>
    <Text style={styles.listValue}>{value}  ›</Text>
  </View>
);

const JourneyItem = ({ icon, title, value, dot, active, isLast }: any) => (
  <View style={styles.journeyItem}>
    <View style={styles.journeyLineContainer}>
      <View style={[styles.journeyCircle, active && styles.journeyCircleActive]}>
         <Text style={styles.journeyIcon}>{icon}</Text>
      </View>
      {!isLast && <View style={styles.journeyLine} />}
    </View>
    <View style={[styles.journeyContent, active && styles.journeyContentActive]}>
       <Text style={[styles.journeyTitle, active && styles.journeyTitleActive]}>{title}</Text>
       {value && <Text style={styles.journeyValue}>{value}</Text>}
       {dot && <Text style={styles.journeyDot}>✅</Text>}
    </View>
  </View>
);

const BottomTabBar = ({ active, navigate }: { active: string, navigate: any }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity style={styles.tabItem} onPress={() => navigate('DataSources')}>
      <Text style={[styles.tabIcon, active === 'Dashboard' && styles.tabActive]}>🏠</Text>
      <Text style={[styles.tabLabel, active === 'Dashboard' && styles.tabActive]}>Dashboard</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => navigate('Forecast')}>
      <Text style={[styles.tabIcon, active === 'Trends' && styles.tabActive]}>📈</Text>
      <Text style={[styles.tabLabel, active === 'Trends' && styles.tabActive]}>Trends</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => navigate('CareConnection')}>
      <Text style={[styles.tabIcon, active === 'Care' && styles.tabActive]}>🏥</Text>
      <Text style={[styles.tabLabel, active === 'Care' && styles.tabActive]}>Care</Text>
    </TouchableOpacity>
  </View>
);

// --- STYLESHEET ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  containerFlex: { flex: 1, backgroundColor: COLORS.surface },
  content: { padding: 20 },
  
  // Header
  headerCentered: { alignItems: 'center', marginTop: 20, marginBottom: 15 },
  logoText: { fontSize: 24, fontWeight: '800', color: COLORS.secondary },
  logoTextSmall: { fontSize: 20, fontWeight: '800', color: COLORS.secondary },
  tagline: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  
  // Custom Navs
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: COLORS.background },
  navHeaderCentered: { alignItems: 'center', paddingVertical: 15, backgroundColor: COLORS.background },
  backHeader: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.background },
  backHeaderCenter: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  backButtonAbsolute: { position: 'absolute', left: 20, padding: 10 },
  backText: { fontSize: 22, fontWeight: '700', color: COLORS.secondary },
  hamburger: { fontSize: 24, color: COLORS.secondary },
  screenTitle: { fontSize: 22, fontWeight: '800', color: COLORS.secondary, marginBottom: 15 },
  screenTitleCenter: { fontSize: 20, fontWeight: '800', color: COLORS.secondary },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 15, lineHeight: 20 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: COLORS.secondary, marginTop: 25, marginBottom: 10 },

  // Hero Banner
  heroBanner: { height: 220, backgroundColor: '#D6EAF8', marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', justifyContent: 'center', padding: 20 },
  heroOverlay: { backgroundColor: 'transparent' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: COLORS.secondary, lineHeight: 32 },
  
  // Buttons
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  btnPrimary: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  btnSecondary: { flex: 1, backgroundColor: COLORS.white, paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  btnSecondaryTransparent: { flex: 1, backgroundColor: 'transparent', paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { color: COLORS.secondary, fontWeight: '700', fontSize: 16 },
  btnSecondaryTextMuted: { color: COLORS.textMuted, fontWeight: '600', fontSize: 16 },
  btnOutline: { backgroundColor: COLORS.white, paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary, marginTop: 10 },
  btnOutlineText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },

  // Grid
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  featureItem: { width: '50%', padding: 10, alignItems: 'center', marginVertical: 10 },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center', color: COLORS.secondary },
  featureDesc: { fontSize: 11, textAlign: 'center', color: COLORS.textMuted, marginTop: 4 },

  // HIPAA Footer
  hipaaBlock: { backgroundColor: COLORS.secondary, padding: 20, marginTop: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, alignItems: 'center' },
  hipaaText: { color: COLORS.white, fontWeight: '600', marginBottom: 15 },
  hipaaBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  hipaaBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  legalLinksRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 15 },
  legalLink: { color: '#BDC3C7', fontSize: 11 },

  // Cards & Lists
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  noBorder: { borderBottomWidth: 0 },
  listIcon: { fontSize: 22, marginRight: 15 },
  listTextContainer: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '600', color: COLORS.secondary },
  listStatus: { fontSize: 12, color: COLORS.success, marginTop: 2 },
  listValue: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  chevron: { fontSize: 20, color: COLORS.border },

  // Action Buttons in List
  actionBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionBtnAlt: { backgroundColor: '#27AE60' }, // upload alt
  actionBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  // Gauge
  gaugeContainer: { alignItems: 'center', marginTop: 30 },
  gaugeArc: { width: 200, height: 200, borderRadius: 100, borderWidth: 15, borderColor: COLORS.success, borderBottomColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  gaugeScore: { fontSize: 50, fontWeight: '900', color: COLORS.secondary, marginTop: -20 },
  gaugeSub: { fontSize: 16, color: COLORS.textMuted, marginTop: -5 },
  badgeSuccess: { backgroundColor: COLORS.success, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, marginTop: 10 },
  badgeText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // Assistant Screens
  assistantBanner: { height: 160, backgroundColor: '#EAEDED', justifyContent:'center', borderBottomLeftRadius:20, borderBottomRightRadius:20 },
  chatGreeting: { fontSize: 16, fontWeight: '600', color: COLORS.secondary, lineHeight: 24, marginVertical: 15 },
  insightCard: { backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  insightCardInside: { backgroundColor: COLORS.surface, padding: 15, borderRadius: 8, marginHorizontal: 10, marginVertical: 10 },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  insightTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.secondary },
  badgeNeutral: { backgroundColor: COLORS.badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeNeutralText: { color: COLORS.badgeText, fontSize: 10, fontWeight: 'bold' },
  insightBody: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  
  // Chat Input
  chatInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.surface },
  chatInput: { flex: 1, height: 42, backgroundColor: COLORS.surface, borderRadius: 21, paddingHorizontal: 15, marginRight: 10 },
  chatMic: { fontSize: 20, marginRight: 15 },
  chatSend: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  // Forecast
  forecastSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 15 },
  forecastScore: { fontSize: 24, fontWeight: 'bold', color: COLORS.secondary, textAlign: 'center', marginTop: 5 },
  chartPlaceholder: { height: 100, backgroundColor: COLORS.surface, margin: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chartLabel: { fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 20, marginBottom: 15 },

  // Recommendation
  hugeIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.badgeBg, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  hugeIcon: { fontSize: 36 },
  hugeTitle: { fontSize: 24, fontWeight: '900', color: COLORS.secondary, textAlign: 'center' },
  hugeSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 20, marginTop: 10, lineHeight: 20 },
  impactCard: { backgroundColor: COLORS.white, padding: 20, borderRadius: 12, marginTop: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  impactTitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 15, textTransform: 'uppercase', fontWeight: 'bold' },
  impactRow: { flexDirection: 'row', justifyContent: 'space-around' },
  impactValueScore: { fontSize: 24, fontWeight: 'bold', color: COLORS.success },
  impactValueStat: { fontSize: 24, fontWeight: 'bold', color: COLORS.secondary },

  // Care Connect
  careMessage: { fontSize: 15, color: COLORS.secondary, textAlign: 'center', lineHeight: 22, marginTop: 10, paddingHorizontal: 10 },
  doctorAvatar: { fontSize: 50 },
  doctorName: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
  doctorSpec: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  doctorAvail: { fontSize: 12, color: COLORS.success, fontWeight: 'bold', marginTop: 6 },

  // Journey
  journeyItem: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10 },
  journeyLineContainer: { alignItems: 'center', width: 40 },
  journeyCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  journeyCircleActive: { borderWidth: 2, borderColor: COLORS.primary },
  journeyIcon: { fontSize: 14 },
  journeyLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 5 },
  journeyContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingBottom: 25, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  journeyContentActive: { borderBottomColor: 'transparent' },
  journeyTitle: { fontSize: 16, color: COLORS.textMuted, flex: 1, fontWeight: '500' },
  journeyTitleActive: { color: COLORS.secondary, fontWeight: '800' },
  journeyValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.secondary, marginRight: 10 },
  journeyDot: { fontSize: 16 },

  // Bottom Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 25, paddingTop: 10 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22, color: COLORS.textMuted },
  tabLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  tabActive: { color: COLORS.primary },
});
