// src/kit_steps/ConfirmOrderStep.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const apiUrl = process.env.REACT_APP_API_URL;

const ConfirmOrderStep = ({
  kitType,
  teamwearColor,
  emblemColor,
  teamLogo,
  frontPrint,
  backPrint,
  teamName,
  designName,
  onBack,
  frontImage,
  backImage,
  showFrontImage,
  showBackImage
}) => {
  const { username } = useContext(UserContext);
  const userEmail = localStorage.getItem("userEmail");
  const [quantities, setQuantities] = useState({
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const unitPrice = 25.00; // Base price per polo
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const updateQuantity = (size, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    setQuantities(prev => ({ ...prev, [size]: newValue }));
  };

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const subtotal = totalItems * unitPrice;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (totalItems === 0) {
      alert("Please select at least one item to order.");
      return;
    }
    
    setIsSubmitting(true);
    const generatedOrderId = `TBL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setOrderId(generatedOrderId);
    
    // Prepare order data for email
    const orderData = {
      customer_email: userEmail,
      customer_name: username,
      kit_type: "Polo Shirt",
      teamwear_color: teamwearColor,
      emblem_color: emblemColor,
      team_name: teamName || "No Team",
      design_name: designName || "Custom Design",
      front_image: !!(showFrontImage && frontImage),  // Convert to boolean
      back_image: !!(showBackImage && backImage),     // Convert to boolean
      back_print_enabled: backPrint.enabled,
      back_print_text: backPrint.text || "",
      back_print_position: backPrint.position || 50,
      quantities: quantities,
      subtotal: subtotal,
      tax: tax,
      total: total,
      order_id: generatedOrderId
    };
    
    console.log("Sending order data:", orderData);  // Debug log
    
    try {
      // Send order confirmation email
      const response = await fetch(`${apiUrl}/send-order-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error("Email send failed:", result);
        // Continue with order even if email fails
      }
      
      setOrderPlaced(true);
    } catch (error) {
      console.error("Error sending order:", error);
      // Continue with order even if email fails
      setOrderPlaced(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    navigate('/create-kit');
    window.location.reload(); // Reset the form
  };

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Order Confirmed!</h2>
          <p className="text-green-600 mb-4">
            Your custom polo order has been received. You'll receive a confirmation email shortly.
          </p>
          <p className="text-sm text-green-600">
            Order #{orderId}
          </p>
          <p className="text-sm text-green-600 mt-2">
            A confirmation email has been sent to {userEmail}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleNewOrder}
            className="w-full bg-[#A461F9] text-white py-3 rounded-xl hover:bg-[#934ff2] transition font-semibold"
          >
            Create Another Design
          </button>
          <button
            onClick={() => navigate('/my-teams')}
            className="w-full bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition font-semibold"
          >
            View My Teams
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Review Your Order</h2>
        <p className="text-gray-400">Confirm your design and select quantities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Design Summary</h3>
          
          {/* Design Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 200 240" className="w-32 h-40">
                <path
                  d="M50 60 L50 50 L60 30 L140 30 L150 50 L150 60 L170 70 L170 230 L30 230 L30 70 Z"
                  fill={teamwearColor}
                  stroke="#ddd"
                  strokeWidth="1"
                />
                <path
                  d="M60 30 L140 30 L135 45 L100 50 L65 45 Z"
                  fill={teamwearColor}
                  stroke="#ddd"
                  strokeWidth="1"
                />
                {teamLogo && (
                  <foreignObject x="60" y="80" width="80" height="60">
                    <img src={teamLogo} alt="Team Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </foreignObject>
                )}
                {frontPrint.enabled && frontPrint.text && (
                  <text x="100" y="160" textAnchor="middle" fill="#000" fontSize="8px" fontFamily={frontPrint.font}>
                    {frontPrint.text}
                  </text>
                )}
              </svg>
            </div>
          </div>

          {/* Design Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Kit Type:</span>
              <span className="font-medium">Polo Shirt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Team Name:</span>
              <span className="font-medium">{teamName || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Design Name:</span>
              <span className="font-medium">{designName || "Not specified"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Teamwear Color:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: teamwearColor }}
                ></div>
                <span className="font-medium">{teamwearColor}</span>
              </div>
            </div>
            {showFrontImage && frontImage && (
              <div className="flex justify-between">
                <span className="text-gray-600">Front Image:</span>
                <span className="font-medium">Yes</span>
              </div>
            )}
            {showBackImage && backImage && (
              <div className="flex justify-between">
                <span className="text-gray-600">Back Image:</span>
                <span className="font-medium">Yes</span>
              </div>
            )}
            {backPrint.enabled && (
              <div className="flex justify-between">
                <span className="text-gray-600">Back Print:</span>
                <span className="font-medium">"{backPrint.text}" at {backPrint.position}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Quantity Selection & Pricing */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Select Quantities</h3>
          
          {/* Size Selection */}
          <div className="space-y-3 mb-6">
            {sizes.map(size => (
              <div key={size} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{size}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(size, quantities[size] - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantities[size]}</span>
                  <button
                    onClick={() => updateQuantity(size, quantities[size] + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items ({totalItems}):</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>£{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold"
            >
              Back to Edit
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={totalItems === 0 || isSubmitting}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
                totalItems > 0 && !isSubmitting
                  ? "bg-[#A461F9] text-white hover:bg-[#934ff2]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderStep;