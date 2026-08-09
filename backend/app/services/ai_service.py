import json
import logging
from typing import Optional
import google.generativeai as genai
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Configure Google Gemini
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Error configuring Gemini API: {str(e)}")

class AIService:
    @staticmethod
    async def analyze_image_bytes(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
        """
        Sends the image bytes to Google Gemini API to analyze and obtain structured JSON.
        """
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
            logger.warning("GEMINI_API_KEY is not configured. Falling back to default failed state.")
            return AIService._get_failed_state("Gemini API key is not configured.")

        prompt = """
        Analyze this image of a campus infrastructure or safety problem.
        You must return a JSON object with the following fields:
        {
          "detected_issue": "A clear, concise name of the problem (e.g., exposed wiring, pipe leak, broken chair)",
          "category": "Must be exactly one of: 'Electrical', 'Plumbing', 'Civil', 'IT', 'Housekeeping', 'Safety', 'Other'",
          "suggested_department": "Must be exactly one of: 'Electrical', 'Plumbing', 'Civil', 'IT', 'Housekeeping', 'Safety'",
          "suggested_priority": "Must be exactly one of: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'",
          "confidence": 0.0 to 1.0,
          "summary": "A concise one-sentence description of the issue.",
          "reasoning": "A brief explanation of why you selected this category and priority."
        }
        Do not include any extra conversational text or markdown code blocks (like ```json). Just return the raw JSON object.
        """

        try:
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(
                contents=[
                    {"mime_type": mime_type, "data": image_bytes},
                    prompt
                ],
                generation_config={"response_mime_type": "application/json"}
            )
        except Exception as first_err:
            logger.warning(f"Failed with model {settings.GEMINI_MODEL}, trying fallback model: {str(first_err)}")
            try:
                # Try fallback model
                fallback_model_name = "gemini-pro" if "1.5" in settings.GEMINI_MODEL else "gemini-1.5-flash"
                model = genai.GenerativeModel(fallback_model_name)
                response = model.generate_content(
                    contents=[
                        {"mime_type": mime_type, "data": image_bytes},
                        prompt
                    ]
                )
            except Exception as e:
                logger.error(f"Failed to analyze image with Gemini API fallbacks: {str(e)}")
                return AIService._get_failed_state(str(e))

        try:
            result_text = response.text.strip()
            # Clean response text if it has markdown formatting
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            
            data = json.loads(result_text)
            
            # Simple validation & mapping
            category = data.get("category", "Other")
            if category not in ["Electrical", "Plumbing", "Civil", "IT", "Housekeeping", "Safety", "Other"]:
                category = "Other"
                
            suggested_department = data.get("suggested_department", "Safety")
            if suggested_department not in ["Electrical", "Plumbing", "Civil", "IT", "Housekeeping", "Safety"]:
                suggested_department = "Safety"
                
            suggested_priority = data.get("suggested_priority", "LOW").upper()
            if suggested_priority not in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
                suggested_priority = "LOW"
                
            confidence = data.get("confidence")
            if confidence is not None:
                confidence = float(confidence)
                
            return {
                "detected_issue": data.get("detected_issue", "Unknown issue"),
                "category": category,
                "suggested_department": suggested_department,
                "suggested_priority": suggested_priority,
                "confidence": confidence,
                "summary": data.get("summary", "Image uploaded successfully."),
                "reasoning": data.get("reasoning", "AI analysis successful.")
            }
        except Exception as e:
            logger.error(f"Failed to analyze image with Gemini API: {str(e)}")
            return AIService._get_failed_state(str(e))

    @staticmethod
    def _get_failed_state(error_message: str) -> dict:
        return {
            "detected_issue": "AI Analysis Failed",
            "category": "Other",
            "suggested_department": "Safety",
            "suggested_priority": "LOW",
            "confidence": None,
            "summary": "AI image analysis failed to run.",
            "reasoning": f"Error: {error_message}"
        }
