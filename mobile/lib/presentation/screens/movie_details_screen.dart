import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/movie.dart';
import '../../providers/movie_providers.dart';
import '../theme.dart';

class MovieDetailsScreen extends ConsumerWidget {
  final Movie movie;

  const MovieDetailsScreen({super.key, required this.movie});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repo = ref.read(movieRepositoryProvider);
    final currentMovie = repo.getById(movie.id) ?? movie;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Backdrop / poster header
          SliverAppBar(
            expandedHeight: 400,
            pinned: true,
            backgroundColor: AppColors.background,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: currentMovie.backdrop ?? currentMovie.poster,
                    fit: BoxFit.cover,
                    errorWidget: (context, url, error) => Container(
                      color: AppColors.surface,
                      child: const Icon(Icons.movie, size: 64, color: AppColors.secondaryText),
                    ),
                  ),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          AppColors.background.withValues(alpha: 0.8),
                          AppColors.background,
                        ],
                        stops: const [0.3, 0.75, 1.0],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: Icon(
                  currentMovie.isFavorite
                      ? Icons.favorite
                      : Icons.favorite_border,
                  color:
                      currentMovie.isFavorite ? AppColors.like : Colors.white,
                ),
                onPressed: () {
                  repo.toggleFavorite(currentMovie.id);
                  ref.read(favoritesProvider.notifier).state =
                      repo.getFavorites();
                  (context as Element).markNeedsBuild();
                },
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    currentMovie.title,
                    style: const TextStyle(
                      color: AppColors.primaryText,
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (currentMovie.originalTitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      currentMovie.originalTitle!,
                      style: const TextStyle(
                          color: AppColors.secondaryText, fontSize: 16),
                    ),
                  ],
                  const SizedBox(height: 12),
                  // Meta row
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 20),
                      const SizedBox(width: 4),
                      Text(
                        currentMovie.rating.toStringAsFixed(1),
                        style: const TextStyle(
                          color: AppColors.primaryText,
                          fontSize: 17,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        '${currentMovie.year}',
                        style: const TextStyle(
                            color: AppColors.secondaryText, fontSize: 15),
                      ),
                      const SizedBox(width: 16),
                      const Icon(Icons.access_time,
                          color: AppColors.secondaryText, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        currentMovie.durationFormatted,
                        style: const TextStyle(
                            color: AppColors.secondaryText, fontSize: 15),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Genres
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: currentMovie.genres.map((g) {
                      return Chip(
                        label: Text(g,
                            style: const TextStyle(fontSize: 12)),
                        materialTapTargetSize:
                            MaterialTapTargetSize.shrinkWrap,
                        visualDensity: VisualDensity.compact,
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                  // Description
                  Text(
                    currentMovie.description,
                    style: const TextStyle(
                      color: AppColors.primaryText,
                      fontSize: 15,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Director
                  _InfoRow(
                      label: 'Режиссёр', value: currentMovie.director),
                  const SizedBox(height: 12),
                  // Cast
                  _InfoRow(
                    label: 'В ролях',
                    value: currentMovie.cast.join(', '),
                  ),
                  if (currentMovie.tags.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: currentMovie.tags.map((t) {
                        return Chip(
                          label: Text('#$t',
                              style: const TextStyle(fontSize: 11)),
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                          visualDensity: VisualDensity.compact,
                          backgroundColor: AppColors.surface,
                        );
                      }).toList(),
                    ),
                  ],
                  const SizedBox(height: 24),
                  // Favorite button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: Icon(
                        currentMovie.isFavorite
                            ? Icons.favorite
                            : Icons.favorite_border,
                      ),
                      label: Text(currentMovie.isFavorite
                          ? 'Удалить из избранного'
                          : 'Добавить в избранное'),
                      onPressed: () {
                        repo.toggleFavorite(currentMovie.id);
                        ref.read(favoritesProvider.notifier).state =
                            repo.getFavorites();
                        (context as Element).markNeedsBuild();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: currentMovie.isFavorite
                            ? AppColors.skip
                            : AppColors.accent,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.secondaryText,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(color: AppColors.primaryText, fontSize: 15),
        ),
      ],
    );
  }
}
