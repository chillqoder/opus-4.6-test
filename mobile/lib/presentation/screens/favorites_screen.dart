import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/movie.dart';
import '../../providers/movie_providers.dart';
import '../theme.dart';
import 'movie_details_screen.dart';

enum _SortMode { dateAdded, rating, year, title }

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  _SortMode _sortMode = _SortMode.dateAdded;

  List<Movie> _sorted(List<Movie> movies) {
    final list = List<Movie>.from(movies);
    switch (_sortMode) {
      case _SortMode.rating:
        list.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case _SortMode.year:
        list.sort((a, b) => b.year.compareTo(a.year));
        break;
      case _SortMode.title:
        list.sort((a, b) => a.title.compareTo(b.title));
        break;
      case _SortMode.dateAdded:
        break;
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final favorites = ref.watch(favoritesProvider);
    final sorted = _sorted(favorites);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Избранное'),
        actions: [
          PopupMenuButton<_SortMode>(
            icon: const Icon(Icons.sort),
            onSelected: (mode) => setState(() => _sortMode = mode),
            itemBuilder: (_) => const [
              PopupMenuItem(
                  value: _SortMode.dateAdded, child: Text('По добавлению')),
              PopupMenuItem(
                  value: _SortMode.rating, child: Text('По рейтингу')),
              PopupMenuItem(value: _SortMode.year, child: Text('По году')),
              PopupMenuItem(
                  value: _SortMode.title, child: Text('По названию')),
            ],
          ),
        ],
      ),
      body: favorites.isEmpty
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.favorite_border,
                      size: 64, color: AppColors.secondaryText),
                  SizedBox(height: 16),
                  Text(
                    'Пока пусто',
                    style:
                        TextStyle(color: AppColors.secondaryText, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Свайпните вправо, чтобы добавить фильм',
                    style:
                        TextStyle(color: AppColors.secondaryText, fontSize: 14),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: sorted.length,
              itemBuilder: (context, index) {
                final movie = sorted[index];
                return _FavoriteItem(
                  movie: movie,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => MovieDetailsScreen(movie: movie),
                      ),
                    );
                  },
                  onRemove: () {
                    final repo = ref.read(movieRepositoryProvider);
                    repo.toggleFavorite(movie.id);
                    ref.read(favoritesProvider.notifier).state =
                        repo.getFavorites();
                  },
                );
              },
            ),
    );
  }
}

class _FavoriteItem extends StatelessWidget {
  final Movie movie;
  final VoidCallback onTap;
  final VoidCallback onRemove;

  const _FavoriteItem({
    required this.movie,
    required this.onTap,
    required this.onRemove,
  });

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
                  width: 65,
                  height: 95,
                  fit: BoxFit.cover,
                  errorWidget: (context, url, error) => Container(
                    width: 65,
                    height: 95,
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
                        fontSize: 16,
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
                              color: AppColors.secondaryText, fontSize: 13),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${movie.year}',
                          style: const TextStyle(
                              color: AppColors.secondaryText, fontSize: 13),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          movie.durationFormatted,
                          style: const TextStyle(
                              color: AppColors.secondaryText, fontSize: 13),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline,
                    color: AppColors.secondaryText),
                onPressed: onRemove,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
