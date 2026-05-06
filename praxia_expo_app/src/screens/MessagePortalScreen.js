import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function MessagePortalScreen({ navigation }) {
  const sidebarRef = useRef(null);

  const activeProviders = [
    { id: '1', name: 'James', img: require('../../assets/public/ai_assistant/woman_background_img.png'), online: true },
    { id: '2', name: 'Sarah', img: require('../../assets/public/ai_assistant/woman_background_img.png'), online: true },
    { id: '3', name: 'Michael', img: require('../../assets/public/ai_assistant/woman_background_img.png'), online: true },
    { id: '4', name: 'AI', img: require('../../assets/public/ai_assistant/woman_background_img.png'), online: true, isAI: true },
  ];

  const chatList = [
    { id: 'c1', name: 'Dr. James Smith', msg: 'The diet plan looks good for you.', time: '12:45 PM', unread: 2, img: require('../../assets/public/ai_assistant/woman_background_img.png') },
    { id: 'c2', name: 'Dr. Sarah Connor', msg: 'Please upload your latest lab results.', time: 'Yesterday', unread: 0, img: require('../../assets/public/ai_assistant/woman_background_img.png') },
    { id: 'c3', name: 'Dr. Michael Chen', msg: 'Your heart rate variability is improving.', time: 'Monday', unread: 0, img: require('../../assets/public/ai_assistant/woman_background_img.png') },
    { id: 'c4', name: 'Assistant AI', msg: 'I have analyzed your activity data.', time: 'Oct 12', unread: 0, img: require('../../assets/public/ai_assistant/woman_background_img.png'), isAI: true },
  ];

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()}>
            <MaterialIcons name="menu" size={28} color="#1D3B5A" />
          </TouchableOpacity>
          <View style={styles.logoCont}>
            <MaterialIcons name="spa" size={24} color={AppColors.primary} />
            <Text style={styles.logoText}>PraxiaOne</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={{marginRight: 15}}><MaterialIcons name="search" size={24} color="#94A3B8" /></TouchableOpacity>
            <TouchableOpacity><MaterialIcons name="more-vert" size={24} color="#94A3B8" /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.activeUsersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
            {activeProviders.map(p => (
              <TouchableOpacity key={p.id} style={styles.activeUserCont}>
                <View style={[styles.activeImgWrapper, p.isAI && styles.activeAIWrapper]}>
                  {!p.isAI && <Image source={p.img} style={styles.activeImg} />}
                  {p.online && <View style={styles.onlineDot} />}
                </View>
                <Text style={styles.activeUserName}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.chatListScroll}>
          {chatList.map(chat => (
            <TouchableOpacity 
              key={chat.id} 
              style={styles.chatRow} 
              onPress={() => navigation.navigate(chat.isAI ? 'Assistant' : 'ChatDetail')}
            >
              <View style={[styles.chatImgWrapper, chat.isAI && styles.chatAIWrapper]}>
                {!chat.isAI && <Image source={chat.img} style={styles.chatImg} />}
              </View>
              <View style={styles.chatTextCont}>
                <View style={styles.chatRowTop}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={[styles.chatTime, chat.unread > 0 && {color: AppColors.primary, fontWeight: 'bold'}]}>{chat.time}</Text>
                </View>
                <View style={styles.chatRowBottom}>
                  <Text style={[styles.chatMsg, chat.unread > 0 && {color: '#1D3B5A', fontWeight: '500'}]} numberOfLines={1}>{chat.msg}</Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.fab}>
          <MaterialIcons name="add-comment" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  logoCont: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  activeUsersSection: { backgroundColor: '#F8FAFC', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  activeUserCont: { alignItems: 'center', marginRight: 20 },
  activeImgWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E2E8F0', padding: 3 },
  activeAIWrapper: { backgroundColor: '#E0E7FF' }, // Purple tint for AI
  activeImg: { width: '100%', height: '100%', borderRadius: 30 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: 'white' },
  activeUserName: { fontSize: 12, color: '#94A3B8', marginTop: 8, fontWeight: '600' },
  chatListScroll: { paddingVertical: 10 },
  chatRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center' },
  chatImgWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E2E8F0', marginRight: 15 },
  chatAIWrapper: { backgroundColor: '#F3E8FF' }, // Light purple tint for AI bubble
  chatImg: { width: '100%', height: '100%', borderRadius: 28 },
  chatTextCont: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 15 },
  chatRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  chatName: { fontSize: 16, fontWeight: 'bold', color: '#1D3B5A' },
  chatTime: { fontSize: 12, color: '#94A3B8' },
  chatRowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMsg: { fontSize: 14, color: '#64748B', flex: 1, marginRight: 10 },
  unreadBadge: { backgroundColor: AppColors.primary, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: AppColors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: AppColors.primary, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }
});
