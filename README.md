├─ public
│  ├─ index.html
│  └─ manifest.json
├─ src
│  ├─ App.css
│  ├─ App.js
│  ├─ components
│  │  ├─ CTA.js
│  │  ├─ Footer.js
│  │  ├─ Header.js
│  │  ├─ Hero.js
│  │  ├─ ProtectedRoute.js
│  │  ├─ Services.js
│  │  └─ Testimonial.js
│  ├─ context
│  │  └─ AuthContext.js
│  ├─ index.js
│  ├─ pages
│  │  ├─ about
│  │  │  └─ layout.js
│  │  ├─ checkout
│  │  │  ├─ components
│  │  │  │  ├─ CheckoutButton.js
│  │  │  │  └─ CheckoutCard.js
│  │  │  └─ layout.js
│  │  ├─ create-lesson
│  │  │  └─ layout.js
│  │  ├─ forgot-password
│  │  │  └─ layout.js
│  │  ├─ legal
│  │  │  └─ layout.js
│  │  ├─ marketplace
│  │  │  ├─ components
│  │  │  │  ├─ LessonCard.js
│  │  │  │  ├─ LessonsGrid.js
│  │  │  │  └─ PurchaseLessonButton.js
│  │  │  └─ layout.js
│  │  ├─ profile
│  │  │  └─ layout.js
│  │  ├─ sign-in
│  │  │  ├─ components
│  │  │  └─ layout.js
│  │  └─ sign-up
│  │     ├─ components.js
│  │     └─ layout.js
│  └─ utils
│     ├─ server.js
│     └─ supabaseClient.js
├─ supabase
│  ├─ .gitignore
│  ├─ .temp
│  │  └─ cli-latest
│  ├─ config.toml
│  └─ functions
│     ├─ create-checkout-session
│     │  ├─ functions.toml
│     │  └─ index.ts
│     └─ stripe-webhook
│        └─ index.ts
└─ tailwind.config.js