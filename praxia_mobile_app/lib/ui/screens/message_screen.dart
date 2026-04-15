import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

class MessageScreen extends StatefulWidget {
  final String doctorName;
  final String doctorImage;
  const MessageScreen({
    Key? key, 
    this.doctorName = "Dr. James Smith",
    this.doctorImage = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200"
  }) : super(key: key);

  @override
  State<MessageScreen> createState() => _MessageScreenState();
}

class _MessageScreenState extends State<MessageScreen> {
  final TextEditingController _msgController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  PlatformFile? _selectedFile;
  final ScrollController _scrollController = ScrollController();
  String _userName = "User";

  @override
  void initState() {
    super.initState();
    _fetchInfoAndHistory();
  }

  Future<void> _fetchInfoAndHistory() async {
    final uname = await ApiService.getUsername();
    final history = await ApiService.getChatHistory();
    
    if (mounted) {
      setState(() {
        _userName = uname ?? "User";
        _messages.addAll(history.map((m) => {
          'text': m['text'] ?? '',
          'isUser': m['role'] == 'user',
          'results': Map<String, dynamic>.from(m['results'] ?? {}),
        }));
      });
      _scrollToBottom();
    }
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

  void _sendMessage() async {
    final text = _msgController.text.trim();
    if (text.isEmpty && _selectedFile == null) return;

    final fileToSend = _selectedFile;
    setState(() {
      if (text.isNotEmpty) _messages.add({'text': text, 'isUser': true, 'results': <String, dynamic>{}});
      _isLoading = true;
      _selectedFile = null;
    });
    _msgController.clear();
    _scrollToBottom();

    String finalMessage = text;
    if (fileToSend != null) {
      final res = await ApiService.uploadDocument(fileToSend.path!, fileToSend.name, 'Message Attachment');
      if (res.containsKey('id')) {
        finalMessage += (finalMessage.isEmpty ? "" : "\n\n") + "*(Attached: ${fileToSend.name})*";
      }
    }

    try {
      final resp = await ApiService.chat(finalMessage);
      if (mounted) {
        setState(() {
          _messages.add({
            'text': resp['reply'] ?? 'Response received.', 
            'isUser': false,
            'results': Map<String, dynamic>.from(resp['results'] ?? {}),
          });
          _isLoading = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1D3B5A)),
        title: Image.asset(
          'public/data_sources_screen/PraxiaOne_logo_data_sources.png',
          height: 36,
          fit: BoxFit.contain,
        ),
        centerTitle: false,
        actions: [
          IconButton(icon: const Icon(Icons.videocam_outlined, color: Color(0xFF1E293B)), onPressed: () {}),
          IconButton(icon: const Icon(Icons.phone_outlined, color: Color(0xFF1E293B)), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(color: Colors.white, border: Border(bottom: BorderSide(color: Colors.grey.shade200))),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundImage: NetworkImage(widget.doctorImage),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.doctorName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                    const Text('Online', style: TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(20),
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) return _buildThinking();
                return _ChatBubble(message: _messages[index]);
              },
            ),
          ),
          _buildInput(),
        ],
      ),
    );
  }

  Widget _buildThinking() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
            const SizedBox(width: 12),
            Text('Processing...', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      decoration: BoxDecoration(
        color: Colors.white, 
        border: Border(top: BorderSide(color: Colors.grey.shade100)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_selectedFile != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    const Icon(Icons.attach_file, size: 16, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_selectedFile!.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                    IconButton(icon: const Icon(Icons.close, size: 16), onPressed: () => setState(() => _selectedFile = null)),
                  ],
                ),
              ),
            ),
          Row(
            children: [
              IconButton(icon: const Icon(Icons.add_circle_outline, color: AppColors.primary, size: 28), onPressed: _pickFile),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _msgController,
                  onSubmitted: (_) => _sendMessage(),
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(25), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: _sendMessage,
                child: CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primary,
                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
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
  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    bool isUser = message['isUser'];
    Map<String, dynamic> results = Map<String, dynamic>.from(message['results'] ?? {});
    bool hasResults = results.isNotEmpty;

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
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: MarkdownBody(
                data: message['text'],
                styleSheet: MarkdownStyleSheet(
                  p: TextStyle(color: isUser ? Colors.white : const Color(0xFF1E293B), fontSize: 14.5, height: 1.5),
                  tableBody: TextStyle(color: isUser ? Colors.white : Colors.black, fontSize: 12),
                  tableBorder: TableBorder.all(color: isUser ? Colors.white24 : Colors.grey.shade200),
                ),
              ),
            ),
            if (hasResults && !isUser) ...[
              const Divider(height: 1),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: TextButton.icon(
                  onPressed: () => _showAnalysis(context, results),
                  icon: const Icon(Icons.analytics_outlined, size: 16, color: AppColors.primary),
                  label: const Text('Multi-Model Analysis', style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold)),
                ),
              )
            ]
          ],
        ),
      ),
    );
  }

  void _showAnalysis(BuildContext context, Map<String, dynamic> results) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
        child: Column(
          children: [
            Container(margin: const EdgeInsets.symmetric(vertical: 12), width: 40, height: 5, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10))),
            const Text('Clinical Model Split', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.accent)),
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
                          _ModelView(text: results['deepseek'] ?? 'Analysis not available'),
                          _ModelView(text: results['med42'] ?? 'Analysis not available'),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ModelView extends StatelessWidget {
  final String text;
  const _ModelView({required this.text});
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(padding: const EdgeInsets.all(20), child: MarkdownBody(data: text));
  }
}
