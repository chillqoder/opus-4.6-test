import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'data/movie_repository.dart';
import 'providers/movie_providers.dart';
import 'presentation/theme.dart';
import 'presentation/screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final repo = MovieRepository();
  await repo.init();

  runApp(
    ProviderScope(
      overrides: [
        movieRepositoryProvider.overrideWithValue(repo),
      ],
      child: const MovieSwipeApp(),
    ),
  );
}

class MovieSwipeApp extends ConsumerStatefulWidget {
  const MovieSwipeApp({super.key});

  @override
  ConsumerState<MovieSwipeApp> createState() => _MovieSwipeAppState();
}

class _MovieSwipeAppState extends ConsumerState<MovieSwipeApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final repo = ref.read(movieRepositoryProvider);
      ref.read(favoritesProvider.notifier).state = repo.getFavorites();
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MovieSwipe',
      debugShowCheckedModeBanner: false,
      theme: buildDarkTheme(),
      home: const HomeScreen(),
    );
  }
}
