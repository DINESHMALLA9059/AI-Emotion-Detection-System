"""
Mental Health Risk Assessment Module

Calculates risk levels based on detected emotions from audio input.
Uses a scoring system to assess mental health risk.
"""

def calculate_risk(audio_emotion):
    """
    Calculate mental health risk based on detected audio emotion.
    
    Args:
        audio_emotion (str): Emotion detected from audio analysis
        
    Returns:
        str: Risk level - "High", "Medium", or "Low"
    """
    # Define negative emotions that indicate higher risk
    negative_emotions = ["sadness", "sad", "fear", "angry", "anger", "anxiety"]
    positive_emotions = ["joy", "happy", "happiness", "excitement"]
    neutral_emotions = ["neutral", "surprise", "disgust"]
    
    score = 0
    
    # Scoring logic based on audio emotion
    if audio_emotion.lower() in negative_emotions:
        score += 2  # Audio tone is significant indicator
    elif audio_emotion.lower() in positive_emotions:
        score -= 1
    elif audio_emotion.lower() not in neutral_emotions:
        score += 0.5
    
    # Determine risk level based on total score
    if score >= 2:
        return "High"
    elif score >= 0.5:
        return "Medium"
    else:
        return "Low"


def get_risk_recommendations(risk_level, emotion):
    """
    Get recommendations based on risk level and emotion.
    
    Args:
        risk_level (str): Risk level - "High", "Medium", or "Low"
        emotion (str): Detected emotion
        
    Returns:
        dict: Recommendations and next steps
    """
    recommendations = {
        "High": {
            "message": "High mental health risk detected",
            "action": "Please consider reaching out to a mental health professional",
            "resources": [
                "National Suicide Prevention Lifeline: 988",
                "Crisis Text Line: Text HOME to 741741",
                "International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/"
            ]
        },
        "Medium": {
            "message": "Moderate mental health concerns detected",
            "action": "Consider speaking with a counselor or therapist",
            "resources": [
                "Psychology Today Therapist Finder: https://www.psychologytoday.com",
                "BetterHelp Online Therapy: https://www.betterhelp.com"
            ]
        },
        "Low": {
            "message": "No significant mental health concerns detected",
            "action": "Continue maintaining healthy lifestyle habits",
            "resources": [
                "Meditation apps: Calm, Headspace",
                "Exercise and healthy diet recommendations"
            ]
        }
    }
    
    return recommendations.get(risk_level, recommendations["Low"])
