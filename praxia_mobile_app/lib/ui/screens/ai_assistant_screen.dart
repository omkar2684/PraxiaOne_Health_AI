import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import '../widgets/app_drawer.dart';
import '../components/praxia_button.dart';
import 'prediction_screen.dart';

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({Key? key}) : super(key: key);
  @override State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> {
  final TextEditingController _msgController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {'text': 'Hi,\nHow can I help you today?', 'isUser': false},
  ];
  bool _isLoading = false;
  final ScrollController _scrollController = ScrollController();

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

  void _sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    setState(() {
      _messages.add({'text': text.trim(), 'isUser': true});
      _isLoading = true;
    });
    _msgController.clear();
    _scrollToBottom();

    final resp = await ApiService.chat(text);
    if (mounted) {
      setState(() {
        _messages.add({'text': resp['reply'] ?? 'No response', 'isUser': false});
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('Ask Praxia', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900)),
        iconTheme: const IconThemeData(color: Colors.black),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(24),
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return const ChatMsg('AI is thinking...', false);
                }
                final m = _messages[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: ChatMsg(m['text'], m['isUser']),
                );
              },
            ),
          ),
          
          if (_messages.length == 1) ...[
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  ChatChipMsg('Why is my score low?', () => _sendMessage('Why is my score low?')),
                  const SizedBox(width: 8),
                  ChatChipMsg('What should I do to improve?', () => _sendMessage('What should I do to improve?')),
                  const SizedBox(width: 8),
                  ChatChipMsg('How am I trending?', () => _sendMessage('How am I trending?')),
                ],
              ),
            ),
          ],

          Container(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    onSubmitted: _sendMessage,
                    decoration: InputDecoration(
                      hintText: 'Type your question',
                      fillColor: const Color(0xFFF1F5F9),
                      filled: true,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: () => _sendMessage(_msgController.text),
                  child: CircleAvatar(backgroundColor: AppColors.primary, child: const Icon(Icons.send, color: Colors.white, size: 20)),
                ),
              ],
            ),
          ),
          PraxiaButton(text: 'View Forecast', onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ForecastScreen())), margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10)),
        ],
      ),
    );
  }
}

class ChatMsg extends StatelessWidget {
  final String text;
  final bool isUser;
  const ChatMsg(this.text, this.isUser, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.all(16),
        constraints: const BoxConstraints(maxWidth: 320),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: MarkdownBody(
          data: text,
          styleSheet: MarkdownStyleSheet(
            p: TextStyle(color: isUser ? Colors.white : Colors.black, height: 1.4, fontSize: 13),
            tableBody: TextStyle(color: isUser ? Colors.white : Colors.black, fontSize: 11),
            tableHead: TextStyle(color: isUser ? Colors.white : Colors.black, fontWeight: FontWeight.bold, fontSize: 11),
            tableBorder: TableBorder.all(color: isUser ? Colors.white24 : Colors.black12, width: 1),
          ),
        ),
      ),
    );
  }
}

class ChatChipMsg extends StatelessWidget {
  final String text;
  final VoidCallback onTap;
  const ChatChipMsg(this.text, this.onTap, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.circular(20)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.chat_bubble_outline, size: 14, color: Colors.grey),
            const SizedBox(width: 8),
            Text(text, style: const TextStyle(color: Colors.black54, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
