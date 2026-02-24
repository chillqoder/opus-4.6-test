import 'package:flutter/material.dart';

import '../theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Профиль')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // App info
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              children: [
                Icon(Icons.movie_filter, size: 56, color: AppColors.accent),
                SizedBox(height: 12),
                Text(
                  'MovieSwipe',
                  style: TextStyle(
                    color: AppColors.primaryText,
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Версия 1.0.0',
                  style: TextStyle(color: AppColors.secondaryText, fontSize: 14),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Settings section
          const Text(
            'Настройки',
            style: TextStyle(
              color: AppColors.secondaryText,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          _SettingsTile(
            icon: Icons.language,
            title: 'Язык',
            subtitle: 'Русский',
            onTap: () {},
          ),
          _SettingsTile(
            icon: Icons.dark_mode,
            title: 'Тема',
            subtitle: 'Тёмная',
            onTap: () {},
          ),
          const SizedBox(height: 20),
          const Text(
            'О приложении',
            style: TextStyle(
              color: AppColors.secondaryText,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          _SettingsTile(
            icon: Icons.info_outline,
            title: 'О MovieSwipe',
            subtitle: 'Находите фильмы легко',
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.accent),
        title: Text(title,
            style: const TextStyle(color: AppColors.primaryText, fontSize: 15)),
        subtitle: Text(subtitle,
            style:
                const TextStyle(color: AppColors.secondaryText, fontSize: 13)),
        trailing:
            const Icon(Icons.chevron_right, color: AppColors.secondaryText),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }
}
