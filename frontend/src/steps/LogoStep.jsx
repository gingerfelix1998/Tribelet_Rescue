// src/steps/LogoStep.jsx
import React, { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

const LogoStep = ({
  prompt,
  teamName,
  logoOptions,
  setLogoOptions,
  selectedLogo,
  setSelectedLogo,
  onBack,
  onNext
}) => {
  const [loading, setLoading] = useState(false);
  const [animatedText, setAnimatedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Animated text messages
  const messages = [
    "Using GPT-4o for transparent backgrounds",
    "This could take a few minutes, please hang with us!"
  ];

  // Typewriter animation effect
  useEffect(() => {
    if (!loading) {
      setAnimatedText("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentMessage = "";

    const typeWriter = () => {
      const fullMessage = messages[messageIndex];
      
      if (!isDeleting) {
        // Typing forward
        currentMessage = fullMessage.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === fullMessage.length) {
          // Finished typing, wait then start deleting
          setTimeout(() => {
            isDeleting = true;
            typeWriter();
          }, 2000); // Wait 2 seconds before deleting
          return;
        }
      } else {
        // Deleting backward
        currentMessage = fullMessage.substring(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
          // Finished deleting, move to next message
          isDeleting = false;
          messageIndex = (messageIndex + 1) % messages.length;
          setTimeout(typeWriter, 500); // Brief pause before next message
          return;
        }
      }
      
      setAnimatedText(currentMessage);
      
      // Speed of typing/deleting
      const speed = isDeleting ? 50 : 100;
      setTimeout(typeWriter, speed);
    };

    // Start the animation after a brief delay
    const startDelay = setTimeout(typeWriter, 500);
    
    return () => {
      clearTimeout(startDelay);
      setIsTyping(false);
    };
  }, [loading]);

  const handleGenerate = async () => {
    setLoading(true);
    setLogoOptions([]); // Clear previous options
    
    try {
      // Set a long timeout for GPT-4o logo generation (5 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes
      
      const res = await fetch(`${apiUrl}/generate-logo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          team_name: teamName,
          count: 3 
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setLogoOptions(data.logo_images || []);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error("Logo generation timed out after 5 minutes");
        alert("Logo generation is taking longer than expected. Please try again or contact support.");
      } else {
        console.error("Failed to generate logos:", err);
        alert("Failed to generate logos. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateOne = async (index) => {
    const updatedOptions = [...logoOptions];
    updatedOptions[index] = "loading"; // Placeholder for loading state
    setLogoOptions(updatedOptions);

    try {
      // Set timeout for single logo regeneration (2 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes
      
      const res = await fetch(`${apiUrl}/generate-logo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          team_name: teamName, 
          count: 1 
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await res.json();
      if (data.logo_images && data.logo_images.length > 0) {
        updatedOptions[index] = data.logo_images[0];
        setLogoOptions(updatedOptions);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error("Logo regeneration timed out");
        alert("Logo regeneration timed out. Please try again.");
      } else {
        console.error("Failed to regenerate logo:", err);
      }
      // Restore original or show error state
      updatedOptions[index] = logoOptions[index];
      setLogoOptions(updatedOptions);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-4">Select a Team Logo</h2>
      
      <p className="text-gray-600 text-center text-sm mb-4">
        We'll generate 3 unique logo options with transparent backgrounds for your team
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-[#A461F9] text-white py-3 rounded-xl font-semibold hover:bg-[#934ff2] transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Generating 3 logos with GPT-4o..." : "Generate Logo Options"}
      </button>

      {/* Loading indicator */}
      {loading && (
        <div className="mb-6">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A461F9]"></div>
            <span className="text-gray-600">Creating unique designs...</span>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2 h-6">
            {animatedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
      )}

      {logoOptions.length > 0 && !loading && (
        <div>
          <p className="text-center text-sm text-gray-600 mb-4">
            Click on a logo to select it, or regenerate individual options
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {logoOptions.map((b64, index) => (
              <div key={index} className="relative group">
                {b64 === "loading" ? (
                  <div className="aspect-square bg-gray-200 rounded-xl flex flex-col items-center justify-center animate-pulse">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A461F9] mb-2"></div>
                    <span className="text-gray-500 text-sm">Regenerating...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={`data:image/png;base64,${b64}`}
                      alt={`Logo ${index + 1}`}
                      onClick={() => setSelectedLogo(b64)}
                      className={`cursor-pointer w-full aspect-square object-contain rounded-xl border-4 shadow-md transition-all ${
                        selectedLogo === b64 
                          ? "border-[#A461F9] scale-105 shadow-lg" 
                          : "border-transparent hover:border-gray-300 hover:scale-102"
                      }`}
                    />
                    
                    {/* Regenerate button (appears on hover) */}
                    <button
                      onClick={() => handleRegenerateOne(index)}
                      className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm shadow-md"
                      title="Regenerate this logo"
                    >
                      🔄
                    </button>
                    
                    {/* Selection indicator */}
                    {selectedLogo === b64 && (
                      <div className="absolute top-2 left-2 bg-[#A461F9] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-md">
                        ✓
                      </div>
                    )}
                    
                    {/* Logo number */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Helpful text about transparency */}
          <p className="text-center text-xs text-gray-500 mb-4">
            ✨ All logos generated with transparent backgrounds for perfect kit placement
          </p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button 
          onClick={onBack} 
          className="text-gray-600 hover:text-gray-800 hover:underline transition"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedLogo}
          className="bg-[#A461F9] text-white py-2 px-6 rounded-xl font-semibold hover:bg-[#934ff2] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default LogoStep;