import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import 'message_screen.dart';
import 'doctor_screen.dart';
import '../widgets/app_drawer.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({Key? key}) : super(key: key);

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final List<Map<String, dynamic>> _chats = [
    {
      'name': 'Dr. James Smith',
      'specialty': 'Internal Medicine',
      'lastMessage': 'The diet plan looks good for you.',
      'time': '12:45 PM',
      'image': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?fit=crop&q=80&w=200',
      'unread': 2,
    },
    {
      'name': 'Dr. Sarah Connor',
      'specialty': 'Endocrinology',
      'lastMessage': 'Please upload your latest lab results.',
      'time': 'Yesterday',
      'image': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?fit=crop&q=80&w=200',
      'unread': 0,
    },
    {
      'name': 'Dr. Michael Chen',
      'specialty': 'Cardiology',
      'lastMessage': 'Your heart rate variability is improving.',
      'time': 'Monday',
      'image': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?fit=crop&q=80&w=200',
      'unread': 0,
    },
    {
      'name': 'Assistant AI',
      'specialty': 'Health Intelligence',
      'lastMessage': 'I have analyzed your activity data.',
      'time': 'Oct 12',
      'image': 'https://images.unsplash.com/photo-1675249141978-8927ba2d3a1e?fit=crop&q=80&w=200',
      'unread': 0,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      drawer: const AppDrawer(),
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
          IconButton(onPressed: () {}, icon: const Icon(Icons.search, color: Colors.grey)),
          IconButton(onPressed: () {}, icon: const Icon(Icons.more_vert, color: Colors.grey)),
        ],
      ),
      body: Column(
        children: [
          // Online Specialists Row (Instagram Style Stories)
          Container(
            height: 100,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _chats.length,
              itemBuilder: (context, i) => _buildStoryItem(_chats[i]),
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          Expanded(
            child: ListView.separated(
              itemCount: _chats.length,
              separatorBuilder: (context, i) => const Padding(
                padding: EdgeInsets.only(left: 88),
                child: Divider(height: 1, color: Color(0xFFF1F5F9)),
              ),
              itemBuilder: (context, i) => _buildChatItem(_chats[i]),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DoctorScreen())),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add_comment, color: Colors.white),
      ),
    );
  }

  Widget _buildStoryItem(Map<String, dynamic> chat) {
    return Padding(
      padding: const EdgeInsets.only(right: 20),
      child: Column(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: AppColors.primary.withOpacity(0.2),
                child: CircleAvatar(
                  radius: 27,
                  backgroundImage: NetworkImage(chat['image']),
                ),
              ),
              Positioned(
                right: 2,
                bottom: 2,
                child: Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(chat['name'].split(' ')[1], style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildChatItem(Map<String, dynamic> chat) {
    return ListTile(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MessageScreen(doctorName: chat['name'], doctorImage: chat['image']))),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: CircleAvatar(
        radius: 28,
        backgroundImage: NetworkImage(chat['image']),
      ),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(chat['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B))),
          Text(chat['time'], style: TextStyle(color: chat['unread'] > 0 ? AppColors.primary : Colors.grey, fontSize: 12)),
        ],
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Row(
          children: [
            Expanded(
              child: Text(
                chat['lastMessage'],
                style: TextStyle(color: chat['unread'] > 0 ? Colors.black87 : Colors.grey, fontSize: 14),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (chat['unread'] > 0)
              Container(
                margin: const EdgeInsets.only(left: 8),
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                child: Text('${chat['unread']}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
      ),
    );
  }
}
