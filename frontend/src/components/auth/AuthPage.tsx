"use client";

import { useState } from "react";
import Logo from "../Logo";
import InputField from "../InputField";
import Button from "../Button";
import { useAuth } from "@/contexts/AuthContext";
import {
  validateLoginForm,
  validateSignupForm,
  type LoginData,
  type SignupData,
} from "@/utils/validation";

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const { login, signup, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      const isLoginTab = activeTab === "login";

      if (isLoginTab) {
        const loginData: LoginData = {
          username: formData.username,
          password: formData.password,
        };

        const validation = validateLoginForm(loginData);

        if (!validation.isValid) {
          setErrors(validation.errors);
          return;
        }

        // Call login API
        const result = await login({
          username: loginData.username,
          password: loginData.password,
        });

        if (result.success) {
          console.log('✅ Login successful in AuthPage, calling onAuthSuccess');
          // Reset form after successful login
          setFormData({
            username: "",
            password: "",
            confirmPassword: "",
          });
          
          // Call success callback if provided
          onAuthSuccess?.();
        } else {
          console.error('❌ Login failed in AuthPage:', result.error);
          setErrors([result.error || "Login failed. Please try again."]);
        }
      } else {
        const signupData: SignupData = {
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        };

        const validation = validateSignupForm(signupData);

        if (!validation.isValid) {
          setErrors(validation.errors);
          return;
        }

        // Call signup API (note: backend doesn't use email, only username)
        const result = await signup({
          username: signupData.username,
          password: signupData.password,
        });

        if (result.success) {
          console.log('✅ Signup successful in AuthPage, calling onAuthSuccess');
          // Reset form after successful signup
          setFormData({
            username: "",
            password: "",
            confirmPassword: "",
          });
          
          // Call success callback if provided
          onAuthSuccess?.();
        } else {
          console.error('❌ Signup failed in AuthPage:', result.error);
          setErrors([result.error || "Signup failed. Please try again."]);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors(["An unexpected error occurred. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setErrors([]);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
    });
  };

  const isLoginTab = activeTab === "login";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Logo size="md" />
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLoginTab ? "Welcome Back!" : "Join ChatterBox!"}
          </h2>
          <p className="text-slate-400">
            {isLoginTab
              ? "Login to continue your conversations."
              : "Create an account to start chatting."}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-2 text-center font-medium rounded-md transition-all duration-200 ${
              isLoginTab
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("signup")}
            className={`flex-1 py-2 text-center font-medium rounded-md transition-all duration-200 ${
              !isLoginTab
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <ul className="text-red-400 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(value) => handleInputChange("username", value)}
            required
          />



          <InputField
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            required
          />

          {!isLoginTab && (
            <InputField
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange("confirmPassword", value)}
              required
            />
          )}

          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : isLoginTab
                ? "Login"
                : "Create Account"}
            </Button>
          </div>
        </form>

        {/* Additional Links */}
        <div className="text-center mt-6">
          <span className="text-slate-400">
            {isLoginTab
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={() => handleTabChange(isLoginTab ? "signup" : "login")}
            className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
          >
            {isLoginTab ? "Sign up" : "Login"}
          </button>
        </div>

        {isLoginTab && (
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
