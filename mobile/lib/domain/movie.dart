class Movie {
  final String id;
  final String title;
  final String? originalTitle;
  final int year;
  final String description;
  final List<String> genres;
  final List<String> moods;
  final double rating;
  final int duration;
  final String director;
  final List<String> cast;
  final String poster;
  final String? backdrop;
  final String language;
  final List<String> tags;
  final String watchStatus;
  final int? tmdbId;
  final String? createdAt;
  bool isFavorite;

  Movie({
    required this.id,
    required this.title,
    this.originalTitle,
    required this.year,
    required this.description,
    required this.genres,
    required this.moods,
    required this.rating,
    required this.duration,
    required this.director,
    required this.cast,
    required this.poster,
    this.backdrop,
    required this.language,
    required this.tags,
    this.watchStatus = 'unwatched',
    this.tmdbId,
    this.createdAt,
    this.isFavorite = false,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    return Movie(
      id: json['id'] as String,
      title: json['title'] as String,
      originalTitle: json['original_title'] as String?,
      year: json['year'] as int,
      description: json['description'] as String,
      genres: List<String>.from(json['genres'] ?? []),
      moods: List<String>.from(json['moods'] ?? []),
      rating: (json['rating'] as num).toDouble(),
      duration: json['duration'] as int,
      director: json['director'] as String,
      cast: List<String>.from(json['cast'] ?? []),
      poster: json['poster'] as String,
      backdrop: json['backdrop'] as String?,
      language: json['language'] as String? ?? 'ru',
      tags: List<String>.from(json['tags'] ?? []),
      watchStatus: json['watch_status'] as String? ?? 'unwatched',
      tmdbId: json['tmdb_id'] as int?,
      createdAt: json['created_at'] as String?,
      isFavorite: json['is_favorite'] as bool? ?? false,
    );
  }

  Movie copyWith({bool? isFavorite}) {
    return Movie(
      id: id,
      title: title,
      originalTitle: originalTitle,
      year: year,
      description: description,
      genres: genres,
      moods: moods,
      rating: rating,
      duration: duration,
      director: director,
      cast: cast,
      poster: poster,
      backdrop: backdrop,
      language: language,
      tags: tags,
      watchStatus: watchStatus,
      tmdbId: tmdbId,
      createdAt: createdAt,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }

  String get durationFormatted {
    final h = duration ~/ 60;
    final m = duration % 60;
    if (h > 0) return '$h ч $m мин';
    return '$m мин';
  }
}
