SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English"},
    "hi": {"name": "Hindi", "native": "हिंदी"},
    "mr": {"name": "Marathi", "native": "मराठी"},
    "bn": {"name": "Bengali", "native": "বাংলা"},
    "ta": {"name": "Tamil", "native": "தமிழ்"},
    "te": {"name": "Telugu", "native": "తెలుగు"},
    "gu": {"name": "Gujarati", "native": "ગુજરાતી"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ"},
    "ml": {"name": "Malayalam", "native": "മലയാളം"},
    "pa": {"name": "Punjabi", "native": "ਪੰਜਾਬੀ"},
    "or": {"name": "Odia", "native": "ଓଡ଼ିଆ"},
    "as": {"name": "Assamese", "native": "অসমীয়া"},
    "ur": {"name": "Urdu", "native": "اردو"},
}

LANGUAGE_ALIASES = {
    "english": "en",
    "hindi": "hi",
    "marathi": "mr",
    "bengali": "bn",
    "bangla": "bn",
    "tamil": "ta",
    "telugu": "te",
    "gujarati": "gu",
    "kannada": "kn",
    "malayalam": "ml",
    "punjabi": "pa",
    "odia": "or",
    "oriya": "or",
    "assamese": "as",
    "urdu": "ur",
}


def normalize_language(language):
    value = str(language or "en").strip().lower()
    if not value:
        return "en"

    if value in SUPPORTED_LANGUAGES:
        return value

    if value in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[value]

    return "en"


def get_language_label(language_code):
    info = SUPPORTED_LANGUAGES.get(language_code, SUPPORTED_LANGUAGES["en"])
    return f"{info['name']} ({info['native']})"
