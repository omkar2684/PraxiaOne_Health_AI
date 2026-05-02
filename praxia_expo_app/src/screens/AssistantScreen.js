import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';
import AppSidebarWrapper from '../components/AppSidebarWrapper';
import * as DocumentPicker from 'expo-document-picker';

export default function AssistantScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    const history = await ApiService.getChatHistory();
    const formatted = history.map(m => ({
      text: m.content || m.text || '',
      isUser: m.role === 'user'
    }));
    setMessages(formatted);
    setIsLoading(false);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;

      setIsLoading(true);
      const response = await ApiService.uploadDocument(fileUri, 'AI Chat Upload', fileName);
      setIsLoading(false);

      if (response.success && response.data && response.data.id) {
        setSelectedDoc({ id: response.data.id, name: fileName });
        Alert.alert("Document Attached", `${fileName} is ready to be analyzed by the AI.`);
      } else {
        Alert.alert("Upload Failed", "Could not upload the document to the AI.");
      }
    } catch (e) {
      setIsLoading(false);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setInput('');
    setIsLoading(true);

    const docIdToPass = selectedDoc ? selectedDoc.id : null;
    setSelectedDoc(null); // Clear attachment after sending

    const resp = await ApiService.chat(userMsg, docIdToPass);
    setMessages(prev => [...prev, { text: resp.reply, isUser: false }]);
    setIsLoading(false);
  };

  const renderBubble = ({ item }) => (
    <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
      {!item.isUser && item.text.includes('Consensus') && (
        <Text style={styles.aiHeading}>Clinical Intelligence Consensus</Text>
      )}
      <Text style={[styles.bubbleText, item.isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
    </View>
  );

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()}>
            <MaterialIcons name="menu" size={28} color="#1D3B5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assistant</Text>
          <TouchableOpacity>
            <MaterialIcons name="history" size={28} color="#1D3B5A" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderBubble}
          contentContainerStyle={styles.list}
        />

        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={AppColors.primary} />
            <Text style={styles.loadingText}>Praxia is processing...</Text>
          </View>
        )}

        {selectedDoc && (
          <View style={styles.attachmentStrip}>
            <MaterialIcons name="picture-as-pdf" size={20} color={AppColors.primary} />
            <Text style={styles.attachmentText} numberOfLines={1}>Attached: {selectedDoc.name}</Text>
            <TouchableOpacity onPress={() => setSelectedDoc(null)}>
              <MaterialIcons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.plusButton} onPress={handlePickDocument}>
            <MaterialIcons name="add-circle-outline" size={28} color={AppColors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask about your vitals or documents..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <MaterialIcons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', padding: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D3B5A' },
  list: { padding: 15 },
  bubble: { padding: 18, borderRadius: 16, marginBottom: 15, maxWidth: '90%' },
  userBubble: { backgroundColor: AppColors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 5 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: 'white' },
  aiText: { color: '#334155' },
  aiHeading: { fontSize: 16, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 10 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', alignSelf: 'flex-start', padding: 12, borderRadius: 20, margin: 15 },
  loadingText: { marginLeft: 10, color: 'gray' },
  attachmentStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2F8EE', paddingHorizontal: 15, paddingVertical: 10, marginHorizontal: 15, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  attachmentText: { flex: 1, fontSize: 13, color: '#065F46', marginLeft: 10, fontWeight: 'bold' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: 'white', alignItems: 'center', borderTopWidth: 1, borderColor: '#F1F5F9' },
  plusButton: { marginRight: 10 },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  sendButton: { backgroundColor: AppColors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
