import os
import json
import base64
import logging
import io
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import AzureOpenAI

# --- Environment and Logging Setup ---
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("image_processing.log"),
        logging.StreamHandler()
    ]
)

app = FastAPI(title="Child Drawing Transformer")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Models ---
class ImageDescriptionResponse(BaseModel):
    description: str

class TextToImageResponse(BaseModel):
    image_url: str

class TextToImageRequest(BaseModel):
    description: str

class Base64ImageRequest(BaseModel):
    base64_image: str

# --- Initialize Azure OpenAI client ---
client = AzureOpenAI(
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

vision_model = os.getenv("AZURE_OPENAI_VISION_MODEL_NAME")
dalle_model = os.getenv("AZURE_OPENAI_MODEL_NAME")

# --- Helper functions ---

def encode_image_to_base64(image_bytes):
    """Encode image bytes to base64"""
    return base64.b64encode(image_bytes).decode("utf-8")

def get_vision_system_prompt():
    return """You are an assistant that clearly describes children's drawings with the right level of detail.
Provide a balanced description that includes:
- The main elements, characters, or objects in the drawing
- The basic shapes, proportions, and their positions
- Key colors used and notable visual features
- Any distinctive or unusual elements that make this drawing unique
- Basic expressions or postures if characters are present

Focus ONLY on what is depicted in the drawing itself.
Do NOT include phrases like 'drawn on paper' or any references to the medium.
Be clear and thorough without being excessively verbose."""

def extract_image_description(client, model_name, image_bytes):
    """Extract description from image bytes using GPT-4 Vision"""
    try:
        base64_image = encode_image_to_base64(image_bytes)
        logging.info("Sending image to GPT-4 Vision model for description...")
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": get_vision_system_prompt()},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": """Describe this child's drawing with enough detail to capture its essence.
Include the main elements, their colors, arrangement, and any unique or distinctive features.
Be informative but concise."""},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=1500
        )
        description = response.choices[0].message.content.strip()
        logging.info("Image description successfully extracted.")
        return description
    except Exception as e:
        logging.error(f"Error during image description: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

def create_imaginative_prompt(description):
    """Creates a prompt for generating an imaginative but polished version of a child's drawing"""
    
    prompt = f"""Transform this child's drawing into a magical, imaginative digital artwork: {description}
    
Create a fantastical, dreamlike interpretation that honors the child's imagination while adding professional artistic flair.
Maintain the original's essence, character proportions, and unique elements exactly as described.
Use vibrant, enchanting colors and stylized textures that feel like stepping into a child's imagination come to life.
Add magical effects, glowing elements, or fantastical environments that complement the drawing's spirit.
The result should not be photorealistic or strictly CGI, but rather a professional digital artwork that celebrates 
the wonder and creativity of childhood imagination - like it could be from a high-quality animated film or storybook.
Make the impossible possible in this magical world where a child's drawings become reality."""
    
    return prompt

def generate_image_from_text(client, dalle_model, description):
    """Generate image using DALL-E from a text description"""
    try:
        logging.info("Generating imaginative artwork from DALL·E model...")
        
        # Create prompt for DALL-E
        prompt = create_imaginative_prompt(description)
        
        # Generate image
        result = client.images.generate(
            model=dalle_model,
            prompt=prompt,
            n=1,
            size="1024x1024",  # Using higher resolution for better detail
            quality="hd",      # Use higher quality if available in your API
            style="vivid"      # For more creative, vibrant results
        )
        
        # Extract image URL
        json_response = json.loads(result.model_dump_json())
        image_url = json_response["data"][0]["url"]
        
        return image_url
    except Exception as e:
        logging.error(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating image: {str(e)}")

# --- API Endpoints ---

# PART 1: IMAGE-TO-TEXT ENDPOINTS

@app.post("/analyze-drawing", response_model=ImageDescriptionResponse)
async def analyze_drawing(file: UploadFile = File(...)):
    """
    Analyze a child's drawing and return a textual description.
    
    - Accepts a PNG image file from a canvas drawing
    - Extracts a description using GPT-4 Vision
    - Returns the description
    """
    try:
        # Read the image file
        image_bytes = await file.read()
        
        # Extract description
        description = extract_image_description(client, vision_model, image_bytes)
        
        return {"description": description}
    
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-from-base64", response_model=ImageDescriptionResponse)
async def analyze_from_base64(request: Base64ImageRequest):
    """
    Analyze a child's drawing provided as base64-encoded image data.
    
    - Accepts a base64-encoded PNG image from a canvas drawing
    - Extracts a description using GPT-4 Vision
    - Returns the description
    """
    try:
        # Decode base64 image
        image_data = request.base64_image
        
        # Remove data URL prefix if present
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
            
        image_bytes = base64.b64decode(image_data)
        
        # Extract description
        description = extract_image_description(client, vision_model, image_bytes)
        
        return {"description": description}
    
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# PART 2: TEXT-TO-IMAGE ENDPOINT

@app.post("/generate-artwork", response_model=TextToImageResponse)
async def generate_artwork(request: TextToImageRequest):
    """
    Generate an imaginative artwork based on a text description.
    
    - Accepts a text description of a child's drawing
    - Generates an imaginative artwork based on the description
    - Returns the image URL
    """
    try:
        # Generate image from description
        image_url = generate_image_from_text(client, dalle_model, request.description)
        
        return {"image_url": image_url}
    
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- For local testing ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)