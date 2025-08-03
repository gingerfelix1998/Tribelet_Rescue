import os
from openai import OpenAI, RateLimitError
import re
import base64

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Client Pitch:
def generate_summary(prompt: str) -> str:
    """
    Function for generating a team summary based on the user's input prompt.

    Arguments:
    - prompt (string): A prompt provided by the user to describe their team.

    Returns:
    - summary (string): A summary of the team in maximum 20 words from Open AI.
    """

    print("Sending prompt to Open AI... \n")
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a branding expert helping a small, non-professional sports team pitch for sponsorship on their kit."},
                {"role": "user", "content": f"Create a 100-word team identity pitch for the following prompt: {prompt}. This should be aimed at securing a kit sponsor. Return only the pitch itself, do not keep the Open AI response. Do not include a title."}
            ],
            temperature=0.4,
            max_tokens=500
        )

        summary = response.choices[0].message.content.strip()
        print("Received response:", summary, ".\n")
        return summary
    except RateLimitError:
        return "Error - OpenAI quota exceeded."

# Team Name:
def generate_team_name(team_name: str, prompt: str) -> str:
    """
    Function for generating a team name based on the user's input prompt.

    Arguments:
    - prompt (string): A prompt provided by the user to describe their team.

    Returns:
    - summary (string): A proposed team name.
    """

    print("Sending prompt to Open AI... \n")
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a branding expert helping people name new sports teams."},
                {"role": "user", "content": f"Return a list of five potential team names, based on this prompt: {prompt}. Only return the list, no other text. The top of the five names should be {team_name} for reference."}
            ],
            temperature=0.5,
            max_tokens=100
        )

        summary = response.choices[0].message.content.strip()
        print("Received response:", summary, ".\n")

        # Extract team name items:
        names = re.split(r"\d+\.\s*", summary)  # Split on "1. ", "2. ", etc.
        names = [name.strip() for name in names if name.strip()] 

        print(names[0])
        return names
    
    except RateLimitError:
        return "Error - OpenAI quota exceeded."
    
# Single Team Name:
def generate_single_team_name(prompt: str) -> str:
    """
    Function for generating a team name based on the user's input prompt.

    Arguments:
    - prompt (string): A prompt provided by the user to describe their team.

    Returns:
    - summary (string): A proposed team name.
    """

    print("Sending prompt to Open AI... \n")
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a branding expert helping people name new sports teams."},
                {"role": "user", "content": f"Return a single team name, based on this prompt: {prompt}. Only return the name, no other text or punctuation."}
            ],
            temperature=0.5,
            max_tokens=100
        )

        summary = response.choices[0].message.content.strip()
        print("Received response:", summary, ".\n")
        return summary
    except RateLimitError:
        return "Error - OpenAI quota exceeded."
    
# Short Summary for Logo Context:
def generate_short_summary(prompt: str) -> str:
    """
    Function for generating a short team summary for logo context.

    Arguments:
    - prompt (string): A prompt provided by the user to describe their team.

    Returns:
    - summary (string): A 30-word team summary.
    """

    print("Sending prompt to Open AI... \n")
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a branding expert helping people name new sports teams."},
                {"role": "user", "content": f"Create a 30-word team identity summary for the following prompt: {prompt}."}
            ],
            temperature=0.5,
            max_tokens=100
        )

        summary = response.choices[0].message.content.strip()
        print("Received response:", summary, ".\n")
        return summary
    except RateLimitError:
        return "Error - OpenAI quota exceeded."

# Logo Generation with GPT-4o (Multiple Images):
def generate_logo_image(prompt: str, team_name: str, count: int = 3):
    """
    Generates multiple logo images using OpenAI's GPT-4o.
    Returns a list of base64-encoded PNG images.
    
    Args:
        prompt: Team description/context
        team_name: Name of the team
        count: Number of logo variations to generate (default: 3)
    
    Returns:
        List of base64-encoded image strings
    """
    full_prompt = (
        f"Create a simple, transparent background, team coat of arms. "
        f"DO NOT include text in the image, other than this explicit team name: '{team_name}'. "
        f"The logo will go on the top right chest of a sports kit. "
        f"The team has this description: '{prompt}'."
    )

    logo_images = []
    
    # Generate multiple images using GPT-4o (need multiple calls)
    for i in range(count):
        try:
            print(f"Generating logo {i+1}/{count} with GPT-4o...")
            
            response = client.responses.create(
                model="gpt-4o",
                input=full_prompt,
                tools=[{"type": "image_generation", "background": "transparent", "quality": "high"}],
            )

            # Extract base64 image(s) from the response
            image_data = [
                output.result
                for output in response.output
                if output.type == "image_generation_call"
            ]
            
            if image_data:
                logo_images.extend(image_data)
                print(f"Successfully generated logo {i+1}/{count}")
            else:
                print(f"No image data received for logo {i+1}")
            
        except Exception as e:
            print(f"Error generating logo {i+1} with GPT-4o: {e}")
            continue

    print(f"Generated {len(logo_images)} logos total")
    return logo_images