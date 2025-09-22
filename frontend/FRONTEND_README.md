# ChatterBox Frontend

A modern, responsive chat application frontend built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Modern UI Design**: Dark theme with gradient backgrounds and smooth animations
- **Authentication Pages**: Login and signup with form validation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Component-Based Architecture**: Reusable components for maintainability
- **Form Validation**: Client-side validation with user-friendly error messages
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS for rapid UI development

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   │   └── AuthPage.tsx  # Login/Signup page
│   ├── Button.tsx        # Button component
│   ├── InputField.tsx    # Input field component
│   └── Logo.tsx          # Logo component
└── utils/                # Utility functions
    └── validation.ts     # Form validation utilities
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React 19** - UI library
- **ESLint** - Code linting

## Features Implemented

### Authentication UI

- Login and signup forms with tab navigation
- Form validation with real-time error display
- Responsive design with mobile-first approach
- Loading states and disabled states for better UX

### Components

- **Logo**: Reusable logo component with size variants
- **InputField**: Styled input component with focus states
- **Button**: Button component with multiple variants
- **AuthPage**: Complete authentication page with form handling

### Validation

- Username validation (length, characters)
- Email validation (proper email format)
- Password validation (strength requirements)
- Password confirmation matching
- Real-time error display and clearing

## Design System

### Colors

- **Primary**: Blue (blue-500, blue-600, blue-700)
- **Background**: Slate gradients (slate-800, slate-900)
- **Text**: White and slate variants
- **Success/Error**: Green and red variants

### Typography

- System font stack for optimal readability
- Multiple font weights (normal, medium, bold)
- Responsive text sizing

### Spacing

- Consistent spacing using Tailwind's spacing scale
- Responsive padding and margins
- Proper form field spacing

## Future Enhancements

- [ ] Connect to backend authentication API
- [ ] Add social login options
- [ ] Implement password reset functionality
- [ ] Add loading animations and micro-interactions
- [ ] Create chat interface components
- [ ] Add internationalization (i18n)
- [ ] Implement theme switching
- [ ] Add progressive web app (PWA) features

## Development Guidelines

1. **Component Structure**: Use functional components with TypeScript
2. **Styling**: Use Tailwind CSS classes, avoid custom CSS when possible
3. **State Management**: Use React hooks for local state
4. **Validation**: Use the validation utilities in `utils/validation.ts`
5. **Accessibility**: Ensure all interactive elements are keyboard accessible
6. **Performance**: Optimize with Next.js built-in features (Image, Link, etc.)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new code
3. Test components on multiple screen sizes
4. Ensure accessibility standards are met
5. Write clear commit messages
