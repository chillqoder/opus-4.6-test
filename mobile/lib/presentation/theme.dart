import 'package:flutter/material.dart';

class AppColors {
  static const background = Color(0xFF111219);
  static const surface = Color(0xFF15171A);
  static const cardBg = Color(0xFF1C1E24);
  static const primaryText = Color(0xFFE6E7EB);
  static const secondaryText = Color(0xFFA6A8AD);
  static const accent = Color(0xFF2ECC71);
  static const error = Color(0xFFFF6B6B);
  static const like = Color(0xFF2ECC71);
  static const skip = Color(0xFFFF6B6B);
}

ThemeData buildDarkTheme() {
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.background,
    colorScheme: const ColorScheme.dark(
      surface: AppColors.surface,
      primary: AppColors.accent,
      error: AppColors.error,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.background,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: AppColors.primaryText,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
      iconTheme: IconThemeData(color: AppColors.primaryText),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.accent,
      unselectedItemColor: AppColors.secondaryText,
      type: BottomNavigationBarType.fixed,
    ),
    cardTheme: CardThemeData(
      color: AppColors.cardBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 4,
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.surface,
      selectedColor: AppColors.accent.withValues(alpha: 0.3),
      labelStyle: const TextStyle(color: AppColors.primaryText),
      side: const BorderSide(color: AppColors.secondaryText, width: 0.5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
          color: AppColors.primaryText,
          fontSize: 28,
          fontWeight: FontWeight.w600),
      headlineMedium: TextStyle(
          color: AppColors.primaryText,
          fontSize: 22,
          fontWeight: FontWeight.w600),
      titleLarge: TextStyle(
          color: AppColors.primaryText,
          fontSize: 18,
          fontWeight: FontWeight.w600),
      titleMedium: TextStyle(
          color: AppColors.primaryText,
          fontSize: 16,
          fontWeight: FontWeight.w500),
      bodyLarge:
          TextStyle(color: AppColors.primaryText, fontSize: 16),
      bodyMedium:
          TextStyle(color: AppColors.secondaryText, fontSize: 14),
      bodySmall:
          TextStyle(color: AppColors.secondaryText, fontSize: 12),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      hintStyle: const TextStyle(color: AppColors.secondaryText),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
  );
}
