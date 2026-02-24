import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/movie_providers.dart';
import '../theme.dart';
import '../widgets/movie_card.dart';
import 'movie_details_screen.dart';
import 'catalog_screen.dart';

class SwipeScreen extends ConsumerStatefulWidget {
  const SwipeScreen({super.key});

  @override
  ConsumerState<SwipeScreen> createState() => _SwipeScreenState();
}

class _SwipeScreenState extends ConsumerState<SwipeScreen>
    with SingleTickerProviderStateMixin {
  Offset _dragOffset = Offset.zero;
  double _dragAngle = 0;
  bool _isDragging = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(swipeStackProvider.notifier).loadStack();
    });
  }

  void _onPanStart(DragStartDetails details) {
    setState(() => _isDragging = true);
  }

  void _onPanUpdate(DragUpdateDetails details) {
    setState(() {
      _dragOffset += details.delta;
      _dragAngle = _dragOffset.dx * 0.001;
    });
  }

  void _onPanEnd(DragEndDetails details) {
    final dx = _dragOffset.dx;
    if (dx > 100) {
      _animateSwipe(true);
    } else if (dx < -100) {
      _animateSwipe(false);
    } else {
      setState(() {
        _dragOffset = Offset.zero;
        _dragAngle = 0;
        _isDragging = false;
      });
    }
  }

  void _animateSwipe(bool isLike) {
    setState(() {
      _dragOffset = Offset.zero;
      _dragAngle = 0;
      _isDragging = false;
    });
    if (isLike) {
      ref.read(swipeStackProvider.notifier).swipeRight();
    } else {
      ref.read(swipeStackProvider.notifier).swipeLeft();
    }
  }

  @override
  Widget build(BuildContext context) {
    final stack = ref.watch(swipeStackProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('MovieSwipe'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CatalogScreen()),
              );
            },
          ),
        ],
      ),
      body: stack.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.movie_filter, size: 64, color: AppColors.secondaryText),
                  const SizedBox(height: 16),
                  const Text(
                    'Фильмы закончились!',
                    style: TextStyle(color: AppColors.secondaryText, fontSize: 18),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      ref.read(swipeStackProvider.notifier).loadStack();
                    },
                    child: const Text('Обновить'),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return Stack(
                          clipBehavior: Clip.none,
                          children: _buildCardStack(stack, constraints),
                        );
                      },
                    ),
                  ),
                ),
                _buildButtons(),
                const SizedBox(height: 16),
              ],
            ),
    );
  }

  List<Widget> _buildCardStack(List<dynamic> stack, BoxConstraints constraints) {
    final cards = <Widget>[];
    final count = min(3, stack.length);

    for (int i = count - 1; i >= 0; i--) {
      final movie = stack[i];
      final scale = 1.0 - (i * 0.04);
      final yOffset = i * 12.0;

      if (i == 0) {
        cards.add(
          Positioned.fill(
            child: GestureDetector(
              onPanStart: _onPanStart,
              onPanUpdate: _onPanUpdate,
              onPanEnd: _onPanEnd,
              child: AnimatedContainer(
                duration: _isDragging
                    ? Duration.zero
                    : const Duration(milliseconds: 300),
                curve: Curves.easeOut,
                transform: Matrix4.identity()
                  ..translateByDouble(_dragOffset.dx, _dragOffset.dy, 0, 1)
                  ..rotateZ(_dragAngle),
                transformAlignment: Alignment.center,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    MovieCard(
                      movie: movie,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => MovieDetailsScreen(movie: movie),
                          ),
                        );
                      },
                    ),
                    // Like indicator
                    if (_dragOffset.dx > 30)
                      Positioned(
                        top: 40,
                        left: 30,
                        child: Transform.rotate(
                          angle: -0.3,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              border:
                                  Border.all(color: AppColors.like, width: 3),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'НРАВИТСЯ',
                              style: TextStyle(
                                color: AppColors.like,
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                      ),
                    // Skip indicator
                    if (_dragOffset.dx < -30)
                      Positioned(
                        top: 40,
                        right: 30,
                        child: Transform.rotate(
                          angle: 0.3,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              border:
                                  Border.all(color: AppColors.skip, width: 3),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'ПРОПУСК',
                              style: TextStyle(
                                color: AppColors.skip,
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        );
      } else {
        cards.add(
          Positioned.fill(
            child: Transform(
              transform: Matrix4.identity()
                ..translateByDouble(0.0, yOffset, 0, 1)
                ..scaleByDouble(scale, scale, 1, 1),
              alignment: Alignment.center,
              child: MovieCard(movie: movie),
            ),
          ),
        );
      }
    }

    return cards;
  }

  Widget _buildButtons() {
    final notifier = ref.read(swipeStackProvider.notifier);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // Skip
          _ActionButton(
            icon: Icons.close,
            color: AppColors.skip,
            onTap: () => _animateSwipe(false),
          ),
          // Undo
          _ActionButton(
            icon: Icons.undo,
            color: AppColors.secondaryText,
            size: 48,
            onTap: () => notifier.undo(),
          ),
          // Like
          _ActionButton(
            icon: Icons.favorite,
            color: AppColors.like,
            onTap: () => _animateSwipe(true),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  final double size;

  const _ActionButton({
    required this.icon,
    required this.color,
    required this.onTap,
    this.size = 60,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.surface,
          border: Border.all(color: color.withValues(alpha: 0.5), width: 2),
        ),
        child: Icon(icon, color: color, size: size * 0.45),
      ),
    );
  }
}
