import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';
import AppSidebarWrapper from '../components/AppSidebarWrapper';
import * as DocumentPicker from 'expo-document-picker';
import Markdown from 'react-native-markdown-display';

export default function AssistantScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showMultiModel, setShowMultiModel] = useState(null);
  const [previousUploads, setPreviousUploads] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    loadHistory();
    loadPreviousUploads();
  }, []);

  const loadPreviousUploads = async () => {
    try {
      const saved = await AsyncStorage.getItem('previous_uploads');
      if (saved) setPreviousUploads(JSON.parse(saved));
    } catch (e) {}
  };

  const saveUpload = async (name, uri) => {
    try {
      const saved = await AsyncStorage.getItem('previous_uploads');
      let list = saved ? JSON.parse(saved) : [];
      if (!list.find(u => u.uri === uri)) {
        list.push({ name, uri });
        await AsyncStorage.setItem('previous_uploads', JSON.stringify(list));
        setPreviousUploads(list);
      }
    } catch (e) {}
  };

  const handlePreviousSelect = async (file) => {
    setShowDropdown(false);
    setIsLoading(true);
    const response = await ApiService.uploadDocument(file.uri, 'AI Chat Upload', file.name);
    setIsLoading(false);
    if (response.success && response.data && response.data.id) {
      setSelectedDoc({ id: response.data.id, name: file.name });
    } else {
      Alert.alert("Error", "Could not attach the previous document.");
    }
  };

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
        await saveUpload(fileName, fileUri);
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
    
    setMessages(prev => [...prev, { 
      text: resp.reply, 
      isUser: false,
      results: resp.results || null 
    }]);
    setIsLoading(false);
  };

  const renderBubble = ({ item }) => {
    const hasMultiModel = item.results && Object.keys(item.results).length > 0;
    
    return (
      <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        {!item.isUser && item.text.includes('Consensus') && (
          <Text style={styles.aiHeading}>Clinical Intelligence Consensus</Text>
        )}
        <Markdown style={{
          body: { color: item.isUser ? 'white' : '#334155', fontSize: 15, lineHeight: 22 },
          table: { borderColor: item.isUser ? 'rgba(255,255,255,0.3)' : '#E2E8F0', borderWidth: 1 },
          tr: { borderBottomWidth: 1, borderColor: item.isUser ? 'rgba(255,255,255,0.3)' : '#E2E8F0' },
          th: { padding: 8, fontWeight: 'bold' },
          td: { padding: 8 },
        }}>
          {item.text}
        </Markdown>
        
        {!item.isUser && hasMultiModel && (
          <>
            <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 }} />
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setShowMultiModel(item.results)}
            >
              <MaterialIcons name="analytics" size={16} color={AppColors.primary} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: AppColors.primary, marginLeft: 6 }}>
                Multi-Model Analysis
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
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

          {previousUploads.length > 0 && !selectedDoc && (
            <TouchableOpacity 
              style={styles.dropdownToggle}
              onPress={() => setShowDropdown(true)}
            >
              <MaterialIcons name="history" size={18} color="#64748B" />
              <Text style={styles.dropdownToggleText}>Use previous PDF</Text>
            </TouchableOpacity>
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
        </KeyboardAvoidingView>

        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDropdown(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Previous Uploads</Text>
                <TouchableOpacity onPress={() => setShowDropdown(false)}>
                  <MaterialIcons name="close" size={24} color="#1D3B5A" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={previousUploads}
                keyExtractor={(item) => item.uri}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => handlePreviousSelect(item)}
                  >
                    <MaterialIcons name="picture-as-pdf" size={24} color="#EF4444" />
                    <Text style={styles.dropdownItemText} numberOfLines={1}>{item.name}</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {showMultiModel && (
          <View style={styles.multiModelOverlay}>
            <View style={styles.multiModelModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Praxia Parallel Analysis</Text>
                <TouchableOpacity onPress={() => setShowMultiModel(null)}>
                  <MaterialIcons name="close" size={24} color="gray" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 20 }}>
                {Object.keys(showMultiModel).map(modelKey => (
                  <View key={modelKey} style={{ marginBottom: 20 }}>
                    <Text style={{ fontWeight: 'bold', color: AppColors.primary, marginBottom: 8, fontSize: 16 }}>{modelKey.toUpperCase()}</Text>
                    <Markdown>{showMultiModel[modelKey]}</Markdown>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
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
  multiModelOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  multiModelModal: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A' },
  dropdownToggle: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', marginHorizontal: 15, marginBottom: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E2E8F0' },
  dropdownToggleText: { color: '#475569', fontSize: 12, marginLeft: 6, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '60%' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dropdownItemText: { flex: 1, fontSize: 14, color: '#1D3B5A', marginLeft: 12, fontWeight: '500' }
});
