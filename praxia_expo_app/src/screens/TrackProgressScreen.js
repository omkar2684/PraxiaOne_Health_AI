import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { FontAwesome5, MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';
import { ApiService } from '../services/apiService';

export default function TrackProgressScreen({ route, navigation }) {
  const sidebarRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const passedActions = route?.params?.actions;

  useEffect(() => {
    const fetchData = async () => {
      const result = await ApiService.getTrackProgress();
      if (result) {
        if (passedActions && passedActions.length > 0) {
          const mapped = passedActions.map((pa, idx) => ({
            id: `new_${Date.now()}_${idx}`,
            icon: pa.icon || 'star',
            title: pa.title,
            subtext: pa.subtitle || 'Added from insights',
            status: "Not Started",
            status_color: "error",
            color_hex: "#EF4444",
            is_actionable: false
          }));
          result.actions = [...mapped, ...(result.actions || [])];
          
          const completed = result.actions.filter(a => a.status === "On Track").length;
          const partial = result.actions.filter(a => a.status === "Partial").length;
          const not_started = result.actions.filter(a => a.status === "Not Started").length;
          const total = result.actions.length;
          result.weekly_summary = {
            ...result.weekly_summary,
            completed, partial, not_started, total,
            progress_percent: total > 0 ? Math.round((completed / total) * 100) : 0
          };
        }
        setData(result);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleUpdateStatus = (actionId) => {
    if (!data) return;
    
    setData(prev => {
      const newActions = prev.actions.map(act => {
        if (act.id === actionId && !act.is_actionable) {
          // Cycle status: On Track -> Partial -> Not Started -> On Track
          let nextStatus, nextColor, nextColorHex;
          if (act.status === "On Track") {
            nextStatus = "Partial"; nextColor = "warning"; nextColorHex = "#F59E0B";
          } else if (act.status === "Partial") {
            nextStatus = "Not Started"; nextColor = "error"; nextColorHex = "#EF4444";
          } else {
            nextStatus = "On Track"; nextColor = "success"; nextColorHex = "#10B981";
          }
          return { ...act, status: nextStatus, status_color: nextColor, color_hex: nextColorHex };
        }
        return act;
      });
      
      const completed = newActions.filter(a => a.status === "On Track").length;
      const partial = newActions.filter(a => a.status === "Partial").length;
      const not_started = newActions.filter(a => a.status === "Not Started").length;
      const total = newActions.length;
      const progress_percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { 
        ...prev, 
        actions: newActions, 
        weekly_summary: { completed, partial, not_started, total, progress_percent } 
      };
    });
  };

  const getMaterialIconName = (name) => {
    if (!name) return 'check-circle';
    return name.replace(/_/g, '-');
  };

  const ActionCard = ({ id, icon, title, subtext, statusText, statusColor, color, isLast = false, showSchedule = false }) => (
    <TouchableOpacity 
      style={[styles.actionRow, isLast && { borderBottomWidth: 0 }]}
      onPress={() => showSchedule ? null : handleUpdateStatus(id)}
      activeOpacity={showSchedule ? 1 : 0.7}
    >
      <View style={styles.actionHeader}>
        <View style={styles.actionLeft}>
          <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
            <MaterialIcons name={getMaterialIconName(icon)} size={24} color={color} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtext}>{subtext}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#CBD5E1" />
      </View>
      
      {!showSchedule ? (
        <View style={styles.daysRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
             <View key={idx} style={[styles.dayCircle, idx < 4 ? { borderColor: color } : {}]}>
               <Text style={[styles.dayText, idx < 4 ? { color: color } : {}]}>{day}</Text>
             </View>
          ))}
        </View>
      ) : (
        <TouchableOpacity style={styles.scheduleButton}>
          <MaterialIcons name="event" size={18} color="#2563EB" />
          <Text style={styles.scheduleButtonText}>Schedule Now</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()} style={styles.menuIcon}>
            <Feather name="menu" size={24} color={AppColors.text} />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Progress</Text>
        <TouchableOpacity style={styles.bellIcon}>
          <Feather name="bell" size={24} color={AppColors.text} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {loading || !data ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <>
            {/* Top Info Row */}
            <View style={styles.topInfoRow}>
              <View style={styles.infoBlock}>
                <MaterialIcons name="event-note" size={24} color="#2563EB" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Week 2 of Plan</Text>
                  <Text style={styles.infoSubtitle}>May 6 - May 12, 2024</Text>
                </View>
              </View>
              <View style={styles.infoBlock}>
                <Ionicons name="flask-outline" size={24} color="#2563EB" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Next Lab Check</Text>
                  <Text style={styles.infoHighlight}>{data.re_test?.days_left} days</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#CBD5E1" />
              </View>
            </View>

            {/* Section 1: Weekly Summary */}
            <View style={styles.card}>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryText}>You completed</Text>
                  <Text style={styles.summaryCount}><Text style={styles.summaryCountBold}>{data.weekly_summary?.completed}</Text> of {data.weekly_summary?.total} actions</Text>
                  <Text style={styles.summaryText}>this week</Text>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { flex: data.weekly_summary?.progress_percent || 0 }]}>
                      <Text style={styles.progressPercent}>{data.weekly_summary?.progress_percent}%</Text>
                    </View>
                    <View style={[styles.progressBarEmpty, { flex: 100 - (data.weekly_summary?.progress_percent || 0) }]} />
                  </View>
                </View>
                
                <View style={styles.summaryRight}>
                  <View style={styles.statRow}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                    <Text style={styles.statLabel}>Completed</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>{data.weekly_summary?.completed}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Ionicons name="remove-circle-outline" size={20} color="#F59E0B" />
                    <Text style={styles.statLabel}>Partial</Text>
                    <Text style={[styles.statValue, { color: '#F59E0B' }]}>{data.weekly_summary?.partial}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                    <Text style={styles.statLabel}>Not Started</Text>
                    <Text style={[styles.statValue, { color: '#EF4444' }]}>{data.weekly_summary?.not_started}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Section 2: Action Tracker */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Action Tracker</Text>
              <TouchableOpacity><Text style={styles.linkText}>Edit Plan</Text></TouchableOpacity>
            </View>
            
            <View style={styles.card}>
              {data.actions?.map((action, idx) => {
                const colorMap = {
                  'success': '#10B981',
                  'warning': '#F59E0B',
                  'error': '#EF4444',
                  'primary': '#3B82F6',
                };
                return (
                  <ActionCard 
                    key={action.id || idx}
                    id={action.id}
                    icon={action.icon}
                    title={action.title}
                    subtext={action.subtext}
                    statusText={action.status}
                    statusColor={colorMap[action.status_color] || '#3B82F6'}
                    color={action.color_hex}
                    isLast={idx === data.actions.length - 1}
                    showSchedule={action.is_actionable}
                  />
                );
              })}
            </View>

            {/* Section 3: AI Behavior Insight */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <MaterialIcons name="auto-awesome" size={20} color="#3B82F6" />
                  <Text style={styles.cardTitle}>What We're Seeing</Text>
                </View>
                <TouchableOpacity><Text style={styles.linkText}>View Details</Text></TouchableOpacity>
              </View>
              
              {data.insights?.map((insight, idx) => {
                const colorMap = {
                  'success': '#10B981',
                  'warning': '#F59E0B',
                  'error': '#EF4444',
                  'primary': '#3B82F6',
                };
                const iconColor = colorMap[insight.color] || '#3B82F6';
                
                // Naive bolding of percentages for simple text handling
                const parts = insight.text.split(/(\d+%)/);
                
                return (
                  <View key={idx} style={styles.insightRow}>
                    <MaterialIcons name={getMaterialIconName(insight.icon)} size={24} color={iconColor} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.insightText}>
                        {parts.map((part, pIdx) => (
                          part.match(/\d+%/) 
                            ? <Text key={pIdx} style={{ color: iconColor, fontWeight: 'bold' }}>{part}</Text>
                            : part
                        ))}
                      </Text>
                      {insight.subtext && <Text style={styles.insightSubtext}>{insight.subtext}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Section 4: Outcome Projection */}
            <View style={styles.card}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="bullseye" size={20} color="#3B82F6" />
                <Text style={styles.cardTitle}>If you stay on track</Text>
              </View>
              <View style={styles.projectionBox}>
                <MaterialIcons name="trending-up" size={28} color="#10B981" />
                <View style={styles.projectionTextContainer}>
                  <Text style={styles.projectionText}>
                    {data.projection?.text.split(/glucose levels/i).map((part, idx, arr) => (
                      <React.Fragment key={idx}>
                        {part}
                        {idx < arr.length - 1 && <Text style={{ color: '#10B981', fontWeight: 'bold' }}>glucose levels</Text>}
                      </React.Fragment>
                    ))}
                  </Text>
                  <Text style={styles.projectionSubtext}>{data.projection?.subtext}</Text>
                </View>
              </View>
            </View>

            {/* Section 5: Re-Test Trigger */}
            <View style={[styles.card, styles.highlightCard]}>
              <View style={styles.retestHeader}>
                <Ionicons name="flask-outline" size={32} color="#2563EB" />
                <View style={styles.retestTextContainer}>
                  <Text style={styles.retestTitle}>Next Step: Re-Test</Text>
                  <Text style={styles.retestDesc}>
                    {data.re_test?.text.split(/(\d+ days)/).map((part, idx) => (
                      part.match(/\d+ days/) 
                        ? <Text key={idx} style={{ fontWeight: 'bold', color: '#2563EB' }}>{part}</Text>
                        : part
                    ))}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Book Follow-Up Test</Text>
              </TouchableOpacity>
            </View>
          </>
        )}


      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
          <Feather name="home" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('DataSources')}>
          <Feather name="file-text" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Results</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Prediction')}>
          <MaterialIcons name="lightbulb" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="trending-up" size={24} color={AppColors.primary} />
          <Text style={[styles.tabText, {color: AppColors.primary}]}>Track</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Settings')}>
          <Feather name="user" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>

      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Account for bottom tab
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 8,
    marginRight: 4,
  },
  infoTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  infoSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  infoHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
  },
  summaryLeft: {
    flex: 1.2,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  summaryText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  summaryCount: {
    fontSize: 16,
    color: '#0F172A',
    marginVertical: 4,
  },
  summaryCountBold: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  progressBarContainer: {
    flexDirection: 'row',
    marginTop: 12,
    height: 24,
    alignItems: 'center',
  },
  progressBarFill: {
    backgroundColor: '#2563EB',
    flex: 6,
    height: '100%',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarEmpty: {
    backgroundColor: '#E2E8F0',
    flex: 4,
    height: '100%',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  progressPercent: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryRight: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  linkText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  daysRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginLeft: 52,
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  dayText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
  },
  scheduleButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginLeft: 8,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  insightText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  insightSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 12,
    marginTop: 2,
  },
  projectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
  },
  projectionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  projectionText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    lineHeight: 20,
  },
  projectionSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  highlightCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
  },
  retestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  retestTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  retestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  retestDesc: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomTab: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 70, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9' 
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 10, fontWeight: 'bold', marginTop: 4, color: '#94A3B8' },
});
