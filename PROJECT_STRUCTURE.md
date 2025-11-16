# ExeAI Premium - Project Structure Guide

## 📁 Essential Files to Share with ChatGPT

### **Root Configuration Files**
```
package.json                    # Dependencies and scripts
tsconfig.json                   # TypeScript configuration
next.config.ts                  # Next.js configuration
tailwind.config.ts             # Tailwind CSS configuration
prisma/schema.prisma            # Database schema (CRITICAL)
.env.local                      # Environment variables (remove sensitive data)
```

### **Core Application Structure**

#### **1. App Directory (Next.js App Router)**
```
app/
├── layout.tsx                  # Root layout
├── page.tsx                    # Home page
├── globals.css                 # Global styles
├── types.ts                    # Main type definitions (Note, Page, CalendarEvent)
│
├── auth/                       # Authentication pages
│   ├── signin/page.tsx        # Sign in page
│   ├── signup/page.tsx        # Sign up page
│   └── register/route.ts      # Registration API
│
├── dashboard/                  # Dashboard functionality
│   ├── page.tsx               # Main dashboard page
│   ├── types/
│   │   ├── index.ts           # Dashboard-specific types
│   │   └── notes.ts           # Note-related types
│   └── utils/
│       ├── aiHelpers.ts       # AI integration utilities
│       ├── noteHelpers.ts     # Note manipulation helpers
│       └── searchUtils.ts     # Search functionality
│
└── api/                        # API Routes
    ├── auth/
    │   ├── [...nextauth]/route.ts    # NextAuth handler
    │   └── signup/route.ts           # Signup API
    ├── notes/
    │   ├── route.ts           # GET/POST notes
    │   └── [id]/route.ts      # GET/PATCH/DELETE note by ID
    ├── tasks/
    │   ├── route.ts           # GET/POST tasks
    │   ├── [id]/route.ts      # GET/PATCH/DELETE task by ID
    │   └── toggle/route.ts    # Toggle task completion
    ├── calendar-events/
    │   ├── route.ts           # GET/POST calendar events
    │   └── [id]/route.ts      # GET/PUT/DELETE event by ID
    ├── pages/
    │   ├── route.ts           # Page CRUD operations
    │   ├── [id]/route.ts      # Get page by ID
    │   └── search/route.ts    # Search pages
    └── user/route.ts          # User profile API
```

#### **2. Components Directory**
```
components/
├── Providers.tsx               # React context providers
│
└── dashboard/                 # Dashboard components
    ├── CenterPanel.tsx        # Main content area (CRITICAL - 1298 lines)
    ├── LeftSidebarComponent.tsx  # Left sidebar navigation
    ├── RightSidebar.tsx       # Right sidebar (todos, email, messenger)
    ├── TopBar.tsx             # Top navigation bar
    ├── TodoList.tsx           # Todo list component
    ├── Calendar.tsx           # Calendar component
    ├── ClockWidget.tsx        # Clock widget
    ├── EmailModule.tsx        # Email module
    ├── MessengerModule.tsx   # Messenger module
    ├── UserProfile.tsx        # User profile component
    └── Logo.tsx               # Logo component
```

#### **3. Library/Utilities Directory**
```
lib/
├── prisma.ts                  # Prisma client instance
├── auth.ts                    # Auth utilities (legacy)
├── auth-options.ts            # NextAuth configuration (CRITICAL)
│
└── db/                        # Database operations
    ├── index.ts               # Database utilities
    ├── users.ts               # User database operations
    ├── notes.ts               # Note database operations
    ├── pages.ts               # Page database operations
    └── tasks.ts               # Task database operations
```

#### **4. Contexts**
```
contexts/
└── SubscriptionContext.tsx    # Subscription state management
```

#### **5. Middleware & Configuration**
```
middleware.ts                  # Next.js middleware (auth protection)
types/next-auth.d.ts           # NextAuth type extensions
```

### **📋 Priority Files for Understanding**

#### **🔴 Critical (Must Include)**
1. `prisma/schema.prisma` - Database structure
2. `lib/auth-options.ts` - Authentication setup
3. `app/dashboard/page.tsx` - Main dashboard
4. `components/dashboard/CenterPanel.tsx` - Core functionality
5. `app/types.ts` - Main type definitions
6. `package.json` - Dependencies

#### **🟡 Important (Highly Recommended)**
7. `app/api/notes/route.ts` - Notes API
8. `app/api/tasks/route.ts` - Tasks API
9. `app/api/auth/[...nextauth]/route.ts` - Auth handler
10. `components/dashboard/RightSidebar.tsx` - Sidebar components
11. `components/dashboard/LeftSidebarComponent.tsx` - Navigation
12. `lib/db/tasks.ts` - Task database operations
13. `lib/db/notes.ts` - Note database operations

#### **🟢 Helpful (For Complete Understanding)**
14. `app/auth/signin/page.tsx` - Sign in UI
15. `app/auth/signup/page.tsx` - Sign up UI
16. `app/dashboard/utils/noteHelpers.ts` - Note utilities
17. `app/dashboard/utils/aiHelpers.ts` - AI integration
18. `components/dashboard/TodoList.tsx` - Todo implementation
19. `contexts/SubscriptionContext.tsx` - Subscription logic

### **📝 Quick Reference List (Copy-Paste Format)**

```
Root:
- package.json
- tsconfig.json
- prisma/schema.prisma
- .env.local (sanitized)

App:
- app/layout.tsx
- app/page.tsx
- app/types.ts
- app/dashboard/page.tsx
- app/dashboard/types/index.ts
- app/dashboard/utils/noteHelpers.ts
- app/dashboard/utils/aiHelpers.ts
- app/auth/signin/page.tsx
- app/auth/signup/page.tsx
- app/api/auth/[...nextauth]/route.ts
- app/api/notes/route.ts
- app/api/notes/[id]/route.ts
- app/api/tasks/route.ts
- app/api/tasks/[id]/route.ts
- app/api/calendar-events/route.ts

Components:
- components/dashboard/CenterPanel.tsx
- components/dashboard/LeftSidebarComponent.tsx
- components/dashboard/RightSidebar.tsx
- components/dashboard/TopBar.tsx
- components/dashboard/TodoList.tsx
- components/Providers.tsx

Lib:
- lib/auth-options.ts
- lib/prisma.ts
- lib/db/tasks.ts
- lib/db/notes.ts
- lib/db/pages.ts
- lib/db/users.ts

Contexts:
- contexts/SubscriptionContext.tsx

Config:
- middleware.ts
- types/next-auth.d.ts
```

### **🎯 For Specific Features**

**Authentication:**
- `lib/auth-options.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/auth/signin/page.tsx`
- `app/auth/signup/page.tsx`

**Notes & Pages:**
- `app/types.ts`
- `app/api/notes/route.ts`
- `components/dashboard/CenterPanel.tsx`
- `lib/db/notes.ts`

**Tasks:**
- `app/api/tasks/route.ts`
- `components/dashboard/TodoList.tsx`
- `lib/db/tasks.ts`

**Database:**
- `prisma/schema.prisma` (MOST IMPORTANT)
- `lib/prisma.ts`
- All files in `lib/db/`

---

**Note:** When sharing with ChatGPT, start with the Critical files, then add Important files based on what you're working on. The schema.prisma file is essential for understanding the data model.

