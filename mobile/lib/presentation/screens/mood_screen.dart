import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/movie_providers.dart';
import '../theme.dart';
import 'movie_details_screen.dart';

class MoodScreen extends ConsumerWidget {
  const MoodScreen({super.key});

  static const _moodLabels = <String, String>{
    'romantic': 'Романтичный',
    'funny': 'Весёлый',
    'tense': 'Напряжённый',
    'calm': 'Спокойный',
    'sad': 'Грустный',
    'nostalgic': 'Ностальгический',
    'adventurous': 'Приключенческий',
    'intellectual': 'Интеллектуальный',
    'dark': 'Мрачный',
    'inspiring': 'Вдохновляющий',
    'thought-provoking': 'Заставляющий думать',
    'intense': 'Интенсивный',
    'heartwarming': 'Душевный',
    'thrilling': 'Захватывающий',
    'epic': 'Эпический',
    'feel-good': 'Для хорошего настроения',
    'suspenseful': 'С интригой',
    'emotional': 'Эмоциональный',
    'mysterious': 'Загадочный',
    'whimsical': 'Причудливый',
    'lighthearted': 'Лёгкий',
    'gritty': 'Суровый',
    'dreamy': 'Мечтательный',
    'quirky': 'Оригинальный',
    'uplifting': 'Воодушевляющий',
    'bittersweet': 'Горько-сладкий',
    'mind-bending': 'Взрывающий мозг',
    'rebellious': 'Бунтарский',
    'poignant': 'Пронзительный',
    'absurd': 'Абсурдный',
    'provocative': 'Провокационный',
    'haunting': 'Навязчивый',
    'visionary': 'Визионерский',
    'playful': 'Игривый',
    'satirical': 'Сатирический',
    'melancholic': 'Меланхоличный',
    'adrenaline-pumping': 'Адреналиновый',
    'charming': 'Очаровательный',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repo = ref.read(movieRepositoryProvider);
    final allMoods = repo.getAllMoods().toList()..sort();
    final selectedMoods = ref.watch(selectedMoodsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Настроение')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Какое у вас настроение?',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Выберите одно или несколько',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            Expanded(
              child: SingleChildScrollView(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: allMoods.map((mood) {
                    final isSelected = selectedMoods.contains(mood);
                    final label = _moodLabels[mood] ?? mood;
                    return FilterChip(
                      label: Text(label),
                      selected: isSelected,
                      onSelected: (selected) {
                        final current =
                            Set<String>.from(ref.read(selectedMoodsProvider));
                        if (selected) {
                          current.add(mood);
                        } else {
                          current.remove(mood);
                        }
                        ref.read(selectedMoodsProvider.notifier).state =
                            current;
                      },
                      selectedColor: AppColors.accent.withValues(alpha: 0.3),
                      checkmarkColor: AppColors.accent,
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.movie_filter),
                label: const Text('Подобрать фильм'),
                onPressed: selectedMoods.isEmpty
                    ? null
                    : () {
                        final movie =
                            repo.getRandomByMood(selectedMoods.toList());
                        if (movie != null) {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) =>
                                  MovieDetailsScreen(movie: movie),
                            ),
                          );
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Фильмы не найдены')),
                          );
                        }
                      },
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
