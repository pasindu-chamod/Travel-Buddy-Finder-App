import 'package:flutter/material.dart';

class AppTheme {
  // Aggressive / Cyber-Tactical Color Palette
  static const Color neonCrimson = Color(0xFFFF1355);
  static const Color electricAmber = Color(0xFFFF6B00);
  static const Color cyberObsidian = Color(0xFF05070E);
  static const Color tacticalNavy = Color(0xFF0B0F19);
  static const Color cardSurface = Color(0xFF111827);
  static const Color matrixGreen = Color(0xFF10E599);
  static const Color hazardYellow = Color(0xFFFACC15);
  static const Color textMuted = Color(0xFF94A3B8);

  static ThemeData aggressiveTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: cyberObsidian,
    colorScheme: const ColorScheme.dark(
      primary: neonCrimson,
      secondary: electricAmber,
      surface: cardSurface,
      background: cyberObsidian,
      onPrimary: Colors.white,
      onSurface: Color(0xFFF1F5F9),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: tacticalNavy,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.w900,
        letterSpacing: 1.5,
      ),
      iconTheme: IconThemeData(color: neonCrimson),
    ),
    cardTheme: CardTheme(
      color: cardSurface,
      elevation: 8,
      shadowColor: neonCrimson.withOpacity(0.2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0x33FF1355)),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: neonCrimson,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w900,
          fontSize: 14,
          letterSpacing: 1.5,
        ),
        elevation: 10,
        shadowColor: neonCrimson.withOpacity(0.6),
      ),
    ),
  );
}
