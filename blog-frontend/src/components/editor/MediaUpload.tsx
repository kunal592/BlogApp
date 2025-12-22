"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaUploadProps {
    onUpload?: (file: File) => Promise<string>;
    accept?: string;
    maxSize?: number; // in MB
}

export function MediaUpload({
    onUpload,
    accept = "image/*",
    maxSize = 10
}: MediaUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setError(null);

        const files = e.dataTransfer.files;
        if (files?.[0]) {
            await processFile(files[0]);
        }
    }, []);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const files = e.target.files;
        if (files?.[0]) {
            await processFile(files[0]);
        }
    }, []);

    const processFile = async (file: File) => {
        // Validate size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        if (onUpload) {
            setIsUploading(true);
            try {
                await onUpload(file);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const clearPreview = () => {
        setPreview(null);
        setError(null);
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {preview ? (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-xl overflow-hidden"
                    >
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            {isUploading ? (
                                <span className="text-sm text-white/70 flex items-center gap-2">
                                    <span className="animate-spin">⟳</span> Uploading...
                                </span>
                            ) : (
                                <span className="text-sm text-white/70">Ready</span>
                            )}
                            <button
                                onClick={clearPreview}
                                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${isDragging
                                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                                : "border-white/10 hover:border-white/20"
                            }`}
                    >
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="p-12 text-center">
                            <motion.div
                                animate={{ y: isDragging ? -5 : 0 }}
                                className="text-4xl mb-4"
                            >
                                📷
                            </motion.div>
                            <p className="text-[var(--muted)]">
                                {isDragging ? (
                                    <span className="text-[var(--accent)]">Drop to upload</span>
                                ) : (
                                    <>
                                        <span className="text-white">Drag & drop</span> or{" "}
                                        <span className="text-[var(--accent)]">click</span> to upload
                                    </>
                                )}
                            </p>
                            <p className="text-sm text-white/30 mt-2">
                                Max {maxSize}MB · PNG, JPG, GIF, WebP
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-400"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
