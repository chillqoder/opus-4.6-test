import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/movie_repository.dart';
import '../domain/movie.dart';

final movieRepositoryProvider = Provider<MovieRepository>((ref) {
  return MovieRepository();
});

final allMoviesProvider = StateProvider<List<Movie>>((ref) => []);

final favoritesProvider = StateProvider<List<Movie>>((ref) => []);

final swipeStackProvider =
    StateNotifierProvider<SwipeStackNotifier, List<Movie>>((ref) {
  return SwipeStackNotifier(ref);
});

class SwipeStackNotifier extends StateNotifier<List<Movie>> {
  final Ref ref;
  final List<Movie> _undoStack = [];

  SwipeStackNotifier(this.ref) : super([]);

  void loadStack() {
    final repo = ref.read(movieRepositoryProvider);
    state = repo.getRandomStack(count: 20);
  }

  void swipeRight() {
    if (state.isEmpty) return;
    final movie = state.first;
    _undoStack.add(movie);
    final repo = ref.read(movieRepositoryProvider);
    repo.toggleFavorite(movie.id);
    if (!movie.isFavorite) {
      repo.toggleFavorite(movie.id);
    }
    state = state.sublist(1);
    ref.read(favoritesProvider.notifier).state = repo.getFavorites();
    _refillIfNeeded();
  }

  void swipeLeft() {
    if (state.isEmpty) return;
    _undoStack.add(state.first);
    state = state.sublist(1);
    _refillIfNeeded();
  }

  void undo() {
    if (_undoStack.isEmpty) return;
    final movie = _undoStack.removeLast();
    // If it was liked, unlike it
    if (movie.isFavorite) {
      final repo = ref.read(movieRepositoryProvider);
      repo.toggleFavorite(movie.id);
      ref.read(favoritesProvider.notifier).state = repo.getFavorites();
    }
    state = [movie, ...state];
  }

  bool get canUndo => _undoStack.isNotEmpty;

  void _refillIfNeeded() {
    if (state.length < 3) {
      final repo = ref.read(movieRepositoryProvider);
      final more = repo.getRandomStack(count: 20);
      final currentIds = state.map((m) => m.id).toSet();
      final fresh = more.where((m) => !currentIds.contains(m.id)).toList();
      state = [...state, ...fresh];
    }
  }
}

final searchQueryProvider = StateProvider<String>((ref) => '');

final searchResultsProvider = Provider<List<Movie>>((ref) {
  final query = ref.watch(searchQueryProvider);
  final repo = ref.read(movieRepositoryProvider);
  if (query.isEmpty) return repo.loadAll();
  return repo.search(query);
});

final selectedMoodsProvider = StateProvider<Set<String>>((ref) => {});
