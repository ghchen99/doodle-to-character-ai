import os
import json
import base64
import logging
import requests
from PIL import Image
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

# --- Helper functions ---

def encode_image_to_base64(image_path):
    logging.info(f"Encoding image: {image_path}")
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

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

def extract_image_description(client, model_name, image_path):
    try:
        base64_image = encode_image_to_base64(image_path)
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
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
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
        return "A simple scene with a sun, a tree, and a house."  # fallback

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

# --- Initialization ---

client = AzureOpenAI(
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

vision_model = os.getenv("AZURE_OPENAI_VISION_MODEL_NAME")
dalle_model = os.getenv("AZURE_OPENAI_MODEL_NAME")

image_input_path = os.path.join(os.curdir, 'images', 'input_image.jpg')

# Step 1: Get description from image using GPT-4 Vision
description = extract_image_description(client, vision_model, image_input_path)

# Save the description to a text file
text_output_dir = os.path.join(os.curdir, 'extracted-text')
os.makedirs(text_output_dir, exist_ok=True)
text_output_path = os.path.join(text_output_dir, 'description.txt')
with open(text_output_path, "w", encoding="utf-8") as f:
    f.write(description)
logging.info(f"Extracted description saved to {text_output_path}")

# Step 2: Create prompt for imaginative image generation
prompt_text = create_imaginative_prompt(description)

# Step 3: Generate image using DALL·E
logging.info("Generating imaginative artwork from DALL·E model...")
result = client.images.generate(
    model=dalle_model,
    prompt=prompt_text,
    n=1,
    size="1024x1024",  # Using higher resolution for better detail
    quality="hd",      # Use higher quality if available in your API
    style="vivid"      # For more creative, vibrant results
)

json_response = json.loads(result.model_dump_json())

# Step 4: Save generated image
image_dir = os.path.join(os.curdir, 'images')
os.makedirs(image_dir, exist_ok=True)

image_path = os.path.join(image_dir, 'generated_image.png')
image_url = json_response["data"][0]["url"]

logging.info(f"Downloading generated image from {image_url}")
generated_image = requests.get(image_url).content
with open(image_path, "wb") as image_file:
    image_file.write(generated_image)

logging.info(f"Generated imaginative artwork saved to {image_path}")

# Step 5: Display image
image = Image.open(image_path)
image.show()