import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import '../widgets/app_drawer.dart';
import 'package:file_picker/file_picker.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

class AssistantScreenV2 extends StatefulWidget {
  const AssistantScreenV2({Key? key}) : super(key: key);
  @override
  State<AssistantScreenV2> createState() => _AssistantScreenV2State();
}

class _AssistantScreenV2State extends State<AssistantScreenV2> {
  final TextEditingController _msgController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  final ScrollController _scrollController = ScrollController();
  final AudioPlayer _audioPlayer = AudioPlayer();
  PlatformFile? _selectedFile;

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'pdf', 'png', 'jpeg'],
    );
    if (result != null) {
      setState(() => _selectedFile = result.files.first);
    }
  }

  void _sendMessage(String text) async {
    if (text.trim().isEmpty && _selectedFile == null) return;
    
    final currentText = text.trim();
    PlatformFile? fileToSend = _selectedFile;

    setState(() {
      if (currentText.isNotEmpty) {
        _messages.add({'text': currentText, 'isUser': true});
      }
      _isLoading = true;
      _selectedFile = null;
    });
    _msgController.clear();
    _scrollToBottom();

    String finalMessage = currentText;
    int? attachedDocId;
    if (fileToSend != null) {
      // Upload file first
      final uploadRes = await ApiService.uploadDocument(
        fileToSend.path!, 
        fileToSend.name, 
        fileToSend.extension == 'pdf' ? 'Report' : 'Lab Result'
      );
      if (uploadRes.containsKey('id')) {
        attachedDocId = uploadRes['id'];
        finalMessage += (finalMessage.isEmpty ? "" : "\n\n") + "*(Attached file: ${fileToSend.name})*";
      }
    }

    try {
      final resp = await ApiService.chat(finalMessage, docId: attachedDocId);
      if (mounted) {
        setState(() {
          _messages.add({
            'text': resp['reply'] ?? 'No response',
            'results': resp['results'] ?? {}, // Multi-model results
            'isUser': false,
            'hasAudio': false,
          });
          _isLoading = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _playVoice(String text, int index) async {
    try {
      final response = await ApiService.fetchTTS(text);
      if (response.statusCode == 200) {
        final dir = await getTemporaryDirectory();
        final file = File('${dir.path}/tts_$index.mp3');
        await file.writeAsBytes(response.bodyBytes);
        await _audioPlayer.setFilePath(file.path);
        _audioPlayer.play();
      }
    } catch (e) {
      debugPrint("TTS Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('Assistant', style: TextStyle(color: AppColors.accent)),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: AppColors.accent),
            onPressed: () {},
          )
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) return const _ThinkingIndicator();
                final m = _messages[index];
                return _ChatBubble(
                  message: m,
                  onVoiceTap: () => _playVoice(m['text'], index),
                );
              },
            ),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_selectedFile != null && _selectedFile!.path != null)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              alignment: Alignment.centerLeft,
              child: Stack(
                children: [
                  Container(
                    height: 200,
                    width: MediaQuery.of(context).size.width * 0.8,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.white,
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: _selectedFile!.extension == 'pdf'
                        ? SfPdfViewer.file(File(_selectedFile!.path!), canShowScrollHead: false)
                        : ['jpg', 'jpeg', 'png'].contains(_selectedFile!.extension) 
                            ? Image.file(File(_selectedFile!.path!), fit: BoxFit.cover)
                            : Container(
                                color: AppColors.primary.withOpacity(0.1),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.insert_drive_file, color: AppColors.primary, size: 40),
                                    const SizedBox(height: 8),
                                    Text(_selectedFile!.name, style: const TextStyle(fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedFile = null),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                        child: const Icon(Icons.close, size: 18, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          Row(
            children: [
              IconButton(
                onPressed: _pickFile,
                icon: const Icon(Icons.add_circle_outline, color: AppColors.primary, size: 28),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: TextField(
                  controller: _msgController,
                  onSubmitted: _sendMessage,
                  decoration: InputDecoration(
                    hintText: 'Ask about your vitals or reports...',
                    fillColor: const Color(0xFFF1F5F9),
                    filled: true,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(25), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => _sendMessage(_msgController.text),
                child: CircleAvatar(
                  radius: 25,
                  backgroundColor: AppColors.primary,
                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 24),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final Map<String, dynamic> message;
  final VoidCallback onVoiceTap;

  const _ChatBubble({required this.message, required this.onVoiceTap});

  @override
  Widget build(BuildContext context) {
    bool isUser = message['isUser'];
    Map<String, dynamic> results = message['results'] ?? {};
    bool hasMultiModel = results.isNotEmpty;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(isUser ? 20 : 0),
            bottomRight: Radius.circular(isUser ? 0 : 20),
          ),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (message['attachedFilePath'] != null)
              Container(
                height: MediaQuery.of(context).size.height * 0.4,
                margin: const EdgeInsets.only(left: 16, right: 16, top: 16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                clipBehavior: Clip.antiAlias,
                child: message['attachedFileExt'] == 'pdf'
                    ? SfPdfViewer.file(File(message['attachedFilePath']), canShowScrollHead: false)
                    : ['jpg', 'jpeg', 'png'].contains(message['attachedFileExt'])
                        ? Image.file(File(message['attachedFilePath']), fit: BoxFit.cover)
                        : Container(
                            color: Colors.grey.shade200,
                            alignment: Alignment.center,
                            child: Text(message['attachedFileName'] ?? 'File', style: const TextStyle(color: Colors.black)),
                          ),
              ),
            if (message['text'] != null && message['text'].toString().isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(16),
                child: MarkdownBody(
                  data: message['text'],
                  selectable: true,
                  styleSheet: MarkdownStyleSheet(
                    p: TextStyle(color: isUser ? Colors.white : const Color(0xFF1E293B), fontSize: 15, height: 1.5),
                    tableBody: TextStyle(color: isUser ? Colors.white : Colors.black, fontSize: 12),
                    tableBorder: TableBorder.all(color: isUser ? Colors.white24 : Colors.grey.shade300),
                    h2: TextStyle(color: isUser ? Colors.white : AppColors.accent, fontSize: 18, fontWeight: FontWeight.bold),
                    listBullet: TextStyle(color: isUser ? Colors.white : AppColors.primary),
                  ),
                ),
              ),
            if (!isUser) ...[
              const Divider(height: 1),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (hasMultiModel)
                    TextButton.icon(
                      onPressed: () => _showAnalysisOverview(context, results),
                      icon: const Icon(Icons.analytics_outlined, size: 16, color: AppColors.primary),
                      label: const Text('Multi-Model Analysis', style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold)),
                    )
                  else
                    const SizedBox(width: 10),
                  IconButton(
                    icon: const Icon(Icons.volume_up_rounded, size: 18, color: Colors.grey),
                    onPressed: onVoiceTap,
                  ),
                ],
              ),
            ]
          ],
        ),
      ),
    );
  }

  void _showAnalysisOverview(BuildContext context, Map<String, dynamic> results) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _AnalysisSheet(results: results),
    );
  }
}

class _AnalysisSheet extends StatelessWidget {
  final Map<String, dynamic> results;
  const _AnalysisSheet({required this.results});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            width: 40, height: 5,
            decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
          ),
          const Text('Praxia Parallel Analysis', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.accent)),
          const SizedBox(height: 10),
          Expanded(
            child: DefaultTabController(
              length: 2,
              child: Column(
                children: [
                  const TabBar(
                    labelColor: AppColors.primary,
                    unselectedLabelColor: Colors.grey,
                    indicatorColor: AppColors.primary,
                    tabs: [Tab(text: 'DeepSeek-R1'), Tab(text: 'Med42 (Clinical)')],
                  ),
                  Expanded(
                    child: TabBarView(
                      children: [
                        _ModelOutput(text: results['deepseek'] ?? 'No data'),
                        _ModelOutput(text: results['med42'] ?? 'No data'),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ModelOutput extends StatelessWidget {
  final String text;
  const _ModelOutput({required this.text});
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Text(text),
    );
  }
}

class _ThinkingIndicator extends StatelessWidget {
  const _ThinkingIndicator();
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
            const SizedBox(width: 12),
            Text('Praxia is thinking...', style: TextStyle(color: Colors.grey.shade600, fontSize: 14)),
          ],
        ),
      ),
    );
  }
}
