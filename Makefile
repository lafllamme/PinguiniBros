# Pinguini Bros - Makefile
# A fun platformer game built with KAPLAY and Nuxt

.PHONY: help install dev build preview clean lint test

# Default target
help:
	@echo "🐧 Pinguini Bros - Available commands:"
	@echo "  install  - Install dependencies"
	@echo "  dev      - Start development server"
	@echo "  build    - Build for production"
	@echo "  preview  - Preview production build"
	@echo "  clean    - Clean build artifacts"
	@echo "  lint     - Run linter"
	@echo "  test     - Run tests"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	pnpm install

# Start development server
dev:
	@echo "🚀 Starting development server..."
	pnpm dev

# Build for production
build:
	@echo "🔨 Building for production..."
	pnpm build

# Preview production build
preview:
	@echo "👀 Previewing production build..."
	pnpm preview

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .nuxt
	rm -rf .output
	rm -rf dist

# Run linter
lint:
	@echo "🔍 Running linter..."
	pnpm lint

# Run tests
test:
	@echo "🧪 Running tests..."
	pnpm test

# Quick start (install + dev)
start: install dev
