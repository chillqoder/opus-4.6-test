import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/movie.dart';
import '../../providers/movie_providers.dart';
import '../theme.dart';
import 'movie_details_screen.dart';

class CatalogScreen extends ConsumerStatefulWidget {
  const CatalogScreen({super.key});

  @override
  ConsumerState<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends ConsumerState<CatalogScreen> {
  final _searchController = TextEditingController();
  String? _selectedGenre;
  double _minRating = 0;
  int? _maxDuration;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Movie> _getFilteredMovies() {
    final repo = ref.read(movieRepositoryProvider);
    final query = _searchController.text;
    List<Movie> results;

    if (query.isNotEmpty) {
      results = repo.search(query);
    } else {
      results = repo.loadAll();
    }

    return results.where((m) {
      if (_selectedGenre != null && !m.genres.contains(_selectedGenre)) {
        return false;
      }
      if (_minRating > 0 && m.rating < _minRating) return false;
      if (_maxDuration != null && m.duration > _maxDuration!) return false;
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final repo = ref.read(movieRepositoryProvider);
    final genres = repo.getAllGenres().toList()..sort();
    final movies = _getFilteredMovies();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Каталог'),
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Поиск фильмов...',
                prefixIcon:
                    const Icon(Icons.search, color: AppColors.secondaryText),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear,
                            color: AppColors.secondaryText),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
              ),
            ),
          ),
          // Filters row
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                // Genre filter
                _FilterChipButton(
                  label: _selectedGenre ?? 'Жанр',
                  isActive: _selectedGenre != null,
                  onTap: () => _showGenreFilter(genres),
                ),
                const SizedBox(width: 8),
                // Rating filter
                _FilterChipButton(
                  label: _minRating > 0
                      ? 'От ${_minRating.toStringAsFixed(0)}'
                      : 'Рейтинг',
                  isActive: _minRating > 0,
                  onTap: _showRatingFilter,
                ),
                const SizedBox(width: 8),
                // Duration filter
                _FilterChipButton(
                  label: _maxDuration != null
                      ? 'До $_maxDuration мин'
                      : 'Длительность',
                  isActive: _maxDuration != null,
                  onTap: _showDurationFilter,
                ),
                if (_selectedGenre != null ||
                    _minRating > 0 ||
                    _maxDuration != null) ...[
                  const SizedBox(width: 8),
                  _FilterChipButton(
                    label: 'Сбросить',
                    isActive: false,
                    onTap: () {
                      setState(() {
                        _selectedGenre = null;
                        _minRating = 0;
                        _maxDuration = null;
                      });
                    },
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Results count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Найдено: ${movies.length}',
                style: const TextStyle(
                    color: AppColors.secondaryText, fontSize: 13),
              ),
            ),
          ),
          const SizedBox(height: 8),
          // Movie list
          Expanded(
            child: movies.isEmpty
                ? const Center(
                    child: Text(
                      'Ничего не найдено',
                      style: TextStyle(
                          color: AppColors.secondaryText, fontSize: 16),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: movies.length,
                    itemBuilder: (context, index) {
                      final movie = movies[index];
                      return _CatalogItem(
                        movie: movie,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) =>
                                  MovieDetailsScreen(movie: movie),
                            ),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _showGenreFilter(List<String> genres) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) {
        return ListView(
          shrinkWrap: true,
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Выберите жанр',
                  style: TextStyle(
                      color: AppColors.primaryText,
                      fontSize: 18,
                      fontWeight: FontWeight.w600)),
            ),
            ListTile(
              title: const Text('Все жанры',
                  style: TextStyle(color: AppColors.primaryText)),
              onTap: () {
                setState(() => _selectedGenre = null);
                Navigator.pop(context);
              },
            ),
            ...genres.map((g) => ListTile(
                  title: Text(g,
                      style: const TextStyle(color: AppColors.primaryText)),
                  selected: _selectedGenre == g,
                  selectedTileColor: AppColors.accent.withValues(alpha: 0.1),
                  onTap: () {
                    setState(() => _selectedGenre = g);
                    Navigator.pop(context);
                  },
                )),
          ],
        );
      },
    );
  }

  void _showRatingFilter() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Минимальный рейтинг',
                      style: TextStyle(
                          color: AppColors.primaryText,
                          fontSize: 18,
                          fontWeight: FontWeight.w600)),
                  const SizedBox(height: 16),
                  Text(
                    _minRating > 0
                        ? _minRating.toStringAsFixed(1)
                        : 'Любой',
                    style: const TextStyle(
                        color: AppColors.accent,
                        fontSize: 24,
                        fontWeight: FontWeight.w700),
                  ),
                  Slider(
                    value: _minRating,
                    min: 0,
                    max: 9,
                    divisions: 18,
                    activeColor: AppColors.accent,
                    onChanged: (v) {
                      setSheetState(() => _minRating = v);
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Готово'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showDurationFilter() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Максимальная длительность',
                  style: TextStyle(
                      color: AppColors.primaryText,
                      fontSize: 18,
                      fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                children: [null, 90, 120, 150, 180].map((d) {
                  final label = d == null ? 'Любая' : '$d мин';
                  final isSelected = _maxDuration == d;
                  return ChoiceChip(
                    label: Text(label),
                    selected: isSelected,
                    selectedColor: AppColors.accent.withValues(alpha: 0.3),
                    onSelected: (_) {
                      setState(() => _maxDuration = d);
                      Navigator.pop(context);
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _FilterChipButton extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _FilterChipButton({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.accent.withValues(alpha: 0.2)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive ? AppColors.accent : AppColors.secondaryText,
            width: 0.5,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? AppColors.accent : AppColors.secondaryText,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _CatalogItem extends StatelessWidget {
  final Movie movie;
  final VoidCallback onTap;

  const _CatalogItem({required this.movie, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: CachedNetworkImage(
                  imageUrl: movie.poster,
                  width: 60,
                  height: 90,
                  fit: BoxFit.cover,
                  errorWidget: (context, url, error) => Container(
                    width: 60,
                    height: 90,
                    color: AppColors.surface,
                    child: const Icon(Icons.movie, color: AppColors.secondaryText),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      movie.title,
                      style: const TextStyle(
                        color: AppColors.primaryText,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 3),
                        Text(
                          movie.rating.toStringAsFixed(1),
                          style: const TextStyle(
                              color: AppColors.secondaryText, fontSize: 12),
                        ),
                        const SizedBox(width: 8),
                        Text('${movie.year}',
                            style: const TextStyle(
                                color: AppColors.secondaryText, fontSize: 12)),
                        const SizedBox(width: 8),
                        Text(movie.durationFormatted,
                            style: const TextStyle(
                                color: AppColors.secondaryText, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      movie.genres.join(', '),
                      style: const TextStyle(
                          color: AppColors.secondaryText, fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.secondaryText),
            ],
          ),
        ),
      ),
    );
  }
}
