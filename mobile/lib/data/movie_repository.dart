import 'dart:convert';
import 'dart:math';

import 'package:flutter/services.dart' show rootBundle;
import 'package:hive_flutter/hive_flutter.dart';

import '../domain/movie.dart';

class MovieRepository {
  static const _favoritesBoxName = 'favorites';
  late Box<String> _favoritesBox;
  List<Movie> _allMovies = [];
  final _random = Random();

  Future<void> init() async {
    await Hive.initFlutter();
    _favoritesBox = await Hive.openBox<String>(_favoritesBoxName);
    await _loadFromAssets();
  }

  Future<void> _loadFromAssets() async {
    final jsonString = await rootBundle.loadString('assets/movies.json');
    final List<dynamic> jsonList = json.decode(jsonString);
    _allMovies = jsonList.map((e) => Movie.fromJson(e)).toList();

    // Apply saved favorites
    for (final movie in _allMovies) {
      if (_favoritesBox.containsKey(movie.id)) {
        movie.isFavorite = true;
      }
    }
  }

  List<Movie> loadAll() => List.unmodifiable(_allMovies);

  Movie? getById(String id) {
    try {
      return _allMovies.firstWhere((m) => m.id == id);
    } catch (_) {
      return null;
    }
  }

  List<Movie> getRandomStack({int count = 20}) {
    final available = _allMovies.where((m) => !m.isFavorite).toList();
    available.shuffle(_random);
    return available.take(count).toList();
  }

  Movie? getRandomByMood(List<String> moods) {
    final filtered = _allMovies.where((m) {
      return moods.any((mood) => m.moods.contains(mood));
    }).toList();
    if (filtered.isEmpty) return null;
    return filtered[_random.nextInt(filtered.length)];
  }

  List<Movie> getByMoods(List<String> moods) {
    return _allMovies.where((m) {
      return moods.any((mood) => m.moods.contains(mood));
    }).toList();
  }

  List<Movie> search(String query) {
    final q = query.toLowerCase();
    return _allMovies.where((m) {
      return m.title.toLowerCase().contains(q) ||
          (m.originalTitle?.toLowerCase().contains(q) ?? false) ||
          m.director.toLowerCase().contains(q) ||
          m.cast.any((c) => c.toLowerCase().contains(q)) ||
          m.tags.any((t) => t.toLowerCase().contains(q));
    }).toList();
  }

  List<Movie> filter({
    List<String>? genres,
    double? minRating,
    int? maxDuration,
  }) {
    return _allMovies.where((m) {
      if (genres != null && genres.isNotEmpty) {
        if (!genres.any((g) => m.genres.contains(g))) return false;
      }
      if (minRating != null && m.rating < minRating) return false;
      if (maxDuration != null && m.duration > maxDuration) return false;
      return true;
    }).toList();
  }

  void toggleFavorite(String id) {
    final movie = getById(id);
    if (movie == null) return;
    movie.isFavorite = !movie.isFavorite;
    if (movie.isFavorite) {
      _favoritesBox.put(id, id);
    } else {
      _favoritesBox.delete(id);
    }
  }

  List<Movie> getFavorites() {
    return _allMovies.where((m) => m.isFavorite).toList();
  }

  Set<String> getAllGenres() {
    final genres = <String>{};
    for (final m in _allMovies) {
      genres.addAll(m.genres);
    }
    return genres;
  }

  Set<String> getAllMoods() {
    final moods = <String>{};
    for (final m in _allMovies) {
      moods.addAll(m.moods);
    }
    return moods;
  }
}
