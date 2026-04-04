import re
from backend.services.retrieval import get_relevant_data
from backend.services.ai_service import get_ai_response


_CAMPUS_HINT_WORDS = {
    "exam", "syllabus", "subject", "attendance", "placement", "hostel", "timetable", "classroom",
    "semester", "fees", "faculty", "event", "result", "admission", "library", "college", "campus"
}


def _normalize_text(text):
    return re.sub(r"\s+", " ", str(text or "")).strip()


def _contains_campus_hint(text):
    tokens = set(re.findall(r"[a-zA-Z0-9]+", text.lower()))
    return any(word in tokens for word in _CAMPUS_HINT_WORDS)


def _is_service_error(reply_text):
    lowered = str(reply_text or "").lower()
    return any(
        marker in lowered
        for marker in [
            "temporarily unavailable",
            "quota limits",
            "invalid gemini api key",
            "invalid groq api key",
            "system configuration error",
        ]
    )


def _detect_mode(user_question):
    """
    Detect if the user is doing small-talk/greeting vs campus information query.
    """
    text = str(user_question or "").strip().lower()
    if not text:
        return "campus"

    small_talk_patterns = [
        r"^(hi|hello|hey|yo|hola|namaste|good morning|good afternoon|good evening)\b",
        r"\b(how are you|what'?s up|whats up|how's it going)\b",
        r"\b(thanks|thank you|ok|okay|cool|nice|great)\b",
        r"\b(who are you|what can you do|introduce yourself|tell me about yourself)\b",
    ]

    for pattern in small_talk_patterns:
        if re.search(pattern, text):
            return "casual"

    if not _contains_campus_hint(text) and len(text.split()) <= 5:
        return "casual"

    return "campus"


def _casual_fallback(language):
    if language == "bn":
        return "নমস্কার! আমি সাহায্যের জন্য আছি। আপনি সময়সূচি, ইভেন্ট, হোস্টেল, প্লেসমেন্ট বা ক্যাম্পাস সংক্রান্ত প্রশ্ন করতে পারেন।"
    if language == "ta":
        return "வணக்கம்! நான் உதவ தயாராக இருக்கிறேன். நீங்கள் கால அட்டவணை, நிகழ்வுகள், விடுதி, பிளேஸ்மென்ட் அல்லது காம்பஸ் தொடர்பான கேள்விகளை கேட்கலாம்."
    if language == "te":
        return "నమస్తే! నేను సహాయం చేయడానికి సిద్ధంగా ఉన్నాను. మీరు టైమ్‌టేబుల్, ఈవెంట్లు, హాస్టల్, ప్లేస్‌మెంట్ లేదా క్యాంపస్ ప్రశ్నలు అడగవచ్చు."
    if language == "gu":
        return "નમસ્તે! હું મદદ માટે અહીં છું. તમે સમયપત્રક, ઇવેન્ટ્સ, હોસ્ટેલ, પ્લેસમેન્ટ અથવા કેમ્પસ સંબંધિત પ્રશ્નો પૂછી શકો છો."
    if language == "kn":
        return "ನಮಸ್ಕಾರ! ನಾನು ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ. ನೀವು ಟೈಮ್‌ಟೇಬಲ್, ಈವೆಂಟ್‌ಗಳು, ಹಾಸ್ಟೆಲ್, ಪ್ಲೇಸ್ಮೆಂಟ್ ಅಥವಾ ಕ್ಯಾಂಪಸ್ ಪ್ರಶ್ನೆಗಳು ಕೇಳಬಹುದು."
    if language == "ml":
        return "നമസ്കാരം! സഹായിക്കാൻ ഞാൻ ഇവിടെ ഉണ്ടു. ടൈംടേബിൾ, ഇവന്റുകൾ, ഹോസ്റ്റൽ, പ്ലേസ്‌മെന്റ് അല്ലെങ്കിൽ ക്യാമ്പസ് ചോദ്യങ്ങൾ ചോദിക്കാം."
    if language == "pa":
        return "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਮਦਦ ਲਈ ਇੱਥੇ ਹਾਂ। ਤੁਸੀਂ ਟਾਈਮਟੇਬਲ, ਇਵੈਂਟਸ, ਹੋਸਟਲ, ਪਲੇਸਮੈਂਟ ਜਾਂ ਕੈਂਪਸ ਬਾਰੇ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।"
    if language == "or":
        return "ନମସ୍କାର! ମୁଁ ସହାୟତା ପାଇଁ ଏଠାରେ ଅଛି। ଆପଣ ଟାଇମଟେବଲ, ଇଭେଣ୍ଟ, ହୋଷ୍ଟେଲ, ପ୍ଲେସମେଣ୍ଟ କିମ୍ବା କ୍ୟାମ୍ପସ ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ପଚାରିପାରିବେ।"
    if language == "as":
        return "নমস্কাৰ! মই সহায়ৰ বাবে আছোঁ। আপুনি টাইমটেবুল, ইভেণ্ট, হোষ্টেল, প্লেছমেণ্ট বা কেম্পাছ সম্পৰ্কীয় প্ৰশ্ন সুধিব পাৰে।"
    if language == "ur":
        return "السلام علیکم! میں مدد کے لئے حاضر ہوں۔ آپ ٹائم ٹیبل، ایونٹس، ہاسٹل، پلیسمنٹ یا کیمپس سے متعلق سوال پوچھ سکتے ہیں۔"
    if language == "hi":
        return "नमस्ते! मैं आपकी मदद के लिए यहां हूं। आप कॉलेज, टाइमटेबल, इवेंट्स या हॉस्टल से जुड़ा सवाल पूछ सकते हैं।"
    if language == "mr":
        return "नमस्कार! मी मदतीसाठी येथे आहे. तुम्ही कॉलेज, टाइमटेबल, इव्हेंट्स किंवा हॉस्टेलसंबंधी प्रश्न विचारू शकता."
    return "Hi! I am here to help. You can ask me about timetable, events, hostel, placements, or any campus query."

def handle_query(user_question, role="student", language="en", chat_history=None, user_profile=None):
    """
    Main entry point for the AI Agent system.
    Follows Retrieval-Augmented Generation (RAG) architecture.

    Args:
        user_question (str): The query sent by the user in any language.
        role (str): The role of the user (e.g., student, faculty, admin).
        language (str): Language code for the reply (en, hi, mr).

    Returns:
        str: Final intelligent, context-aware answer from the bot.
    """
    # 1. Guard: empty query
    if not user_question or str(user_question).strip() == "":
        return "Please ask a valid question."

    cleaned_question = _normalize_text(user_question)

    mode = _detect_mode(cleaned_question)

    # 2. Retrieval: fetch campus data only for campus-information questions
    results = []
    if mode == "campus":
        results = get_relevant_data(cleaned_question, top_k=6)

    # 3. Build compact context from retrieved chunks
    if results:
        context_parts = []
        total_chars = 0
        max_chars = 6000
        for item in results:
            chunk_text = _normalize_text(item.get('content') or item.get('answer') or "")
            if not chunk_text:
                continue

            section = item.get('section', '')
            category = item.get('category', '')
            source = item.get('source', '')

            entry = f"[Category: {category}] [Section: {section}] [Source: {source}]\n{chunk_text[:900]}"
            if total_chars + len(entry) > max_chars:
                break

            context_parts.append(entry)
            total_chars += len(entry)

        retrieved_data = "\n\n".join(context_parts)
    else:
        retrieved_data = ""

    # 3. GenAI API call: Pass question, retrieved data, role, and language
    final_answer = get_ai_response(
        question=cleaned_question,
        data=retrieved_data,
        role=role,
        language=language,
        mode=mode,
        chat_history=chat_history or [],
        user_profile=user_profile or {},
    )

    if mode == "casual" and isinstance(final_answer, str) and _is_service_error(final_answer):
            return _casual_fallback(language)

    # 4. Return clean response
    return final_answer

# For local testing and execution validation
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    print("\n--- Testing CampusCopilot AI Agent ---")
    question = "When is exam?"
    print(f"Query: {question}")
    
    answer = handle_query(question)
    print(f"Response: \n{answer}\n")
    
    question2 = "Hostel mess options?"
    print(f"Query: {question2}")
    
    answer2 = handle_query(question2, role="faculty")
    print(f"Response: \n{answer2}\n")
