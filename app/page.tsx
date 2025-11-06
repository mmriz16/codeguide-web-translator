"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons } from "@/components/auth-buttons";
import { toast } from "sonner";
import {
  Languages,
  Upload,
  Download,
  Loader2,
  FileText,
  Globe
} from "lucide-react";
import Image from "next/image";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "pl", name: "Polish" },
];

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError("Please enter text to translate");
      toast.error("Please enter text to translate");
      return;
    }

    if (!sourceLanguage) {
      setError("Please select a source language");
      toast.error("Please select a source language");
      return;
    }

    if (!targetLanguage) {
      setError("Please select a target language");
      toast.error("Please select a target language");
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError("Source and target languages cannot be the same");
      toast.error("Source and target languages cannot be the same");
      return;
    }

    setIsLoading(true);
    setError("");
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage,
          targetLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Translation failed");
      }

      setTranslatedText(data.translatedText);
      setProgress(100);
      toast.success("Translation completed successfully!");
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during translation";
      setError(errorMessage);
      toast.error(errorMessage);
      setTranslatedText("");
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "text/plain") {
      const errorMessage = "Only .txt files are supported";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      const errorMessage = "File size must be less than 2MB";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSourceText(content);
      setError("");
      toast.success(`File "${file.name}" uploaded successfully`);
    };
    reader.onerror = () => {
      const errorMessage = "Failed to read file";
      setError(errorMessage);
      toast.error(errorMessage);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    } else {
      toast.error("No file detected");
    }
  };

  const handleDownload = () => {
    if (!translatedText.trim()) {
      toast.error("No translation available to download");
      return;
    }

    try {
      const blob = new Blob([translatedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `translated_${sourceLanguage}_to_${targetLanguage}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Translation downloaded successfully!");
    } catch (error) {
      const errorMessage = "Failed to download translation";
      toast.error(errorMessage);
      console.error("Download error:", error);
    }
  };

  const clearAll = () => {
    setSourceText("");
    setTranslatedText("");
    setSourceLanguage("");
    setTargetLanguage("");
    setError("");
    setProgress(0);
    toast.success("All fields cleared");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="text-center py-8 sm:py-12 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <Image
            src="/codeguide-logo.png"
            alt="CodeGuide Logo"
            width={50}
            height={50}
            className="rounded-xl sm:w-[60px] sm:h-[60px]"
          />
          <div className="flex items-center gap-2">
            <Languages className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 bg-clip-text text-transparent">
              AI Translator
            </h1>
          </div>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Translate text between multiple languages using advanced AI technology
        </p>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 pb-12 max-w-6xl">
        <Card className="p-6 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Source Language
              </label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Language
              </label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop a .txt file here, or{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Maximum file size: 2MB
              </p>
            </div>
          </div>

          {/* Text Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Source Text
              </label>
              <Textarea
                value={sourceText}
                onChange={(e) => {
                  setSourceText(e.target.value);
                  setError("");
                }}
                placeholder="Enter text to translate or upload a file..."
                className="min-h-[200px] resize-none"
                maxLength={10000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {sourceText.length}/10,000 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Translation Result
              </label>
              <Textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                className="min-h-[200px] resize-none bg-gray-50 dark:bg-gray-800"
              />
              {translatedText && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {translatedText.length} characters
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Translating...
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim() || !sourceLanguage || !targetLanguage}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Translate
                </>
              )}
            </Button>

            <Button
              onClick={handleDownload}
              disabled={!translatedText.trim()}
              variant="outline"
              className="min-w-[140px]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Result
            </Button>

            <Button
              onClick={clearAll}
              variant="ghost"
              className="min-w-[140px]"
            >
              Clear All
            </Button>
          </div>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
            <Languages className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold mb-2">Multiple Languages</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Support for 20+ languages with accurate translations
            </p>
          </Card>

          <Card className="p-6 text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
            <FileText className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold mb-2">File Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload .txt files for quick translation of documents
            </p>
          </Card>

          <Card className="p-6 text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
            <Download className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold mb-2">Easy Export</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download your translations as text files
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
