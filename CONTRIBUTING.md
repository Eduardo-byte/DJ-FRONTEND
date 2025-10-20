# Contributing to DJ Request Platform

First off, thank you for considering contributing to the DJ Request Platform! It's people like you that make this project such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots if possible**
* **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Provide specific examples to demonstrate the enhancement**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the JavaScript/React style guide
* Include screenshots and animated GIFs in your pull request whenever possible
* End all files with a newline
* Avoid platform-dependent code

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the dev server: `npm run dev`
5. Make your changes
6. Run linter: `npm run lint`
7. Test your changes thoroughly
8. Commit and push to your fork
9. Submit a pull request

## Style Guide

### JavaScript/React

* Use functional components with hooks
* Use arrow functions for component definitions
* Use meaningful variable and function names
* Add JSDoc comments for service methods
* Keep components small and focused
* Use Tailwind CSS for styling (avoid custom CSS)

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Examples:
```
Add real-time notification feature
Fix payment processing bug in request flow
Update README with new installation steps
Refactor event service for better error handling
```

## Project Structure Guidelines

* **API Services** - Keep business logic in `/src/api/services/`
* **Components** - Reusable UI components in `/src/components/`
* **Pages** - Route-level components in `/src/pages/`
* **Utils** - Helper functions in `/src/utils/`
* **Stores** - Global state in `/src/store/`

## Testing

* Write tests for new features
* Ensure all tests pass before submitting PR
* Aim for meaningful test coverage

## Questions?

Feel free to open an issue with your question or reach out to the maintainers directly.

Thank you for contributing! 🎉

