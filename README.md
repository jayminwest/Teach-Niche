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
│  │  ├─ Services.js
│  │  └─ Testimonial.js
│  ├─ index.js
│  ├─ pages
│  │  ├─ about
│  │  │  ├─ layout.js
│  │  │  └─ page.js
│  │  ├─ checkout
│  │  │  ├─ components
│  │  │  │  ├─ CheckoutButton.js
│  │  │  │  └─ CheckoutCard.js
│  │  │  ├─ layout.js
│  │  │  └─ page.js
│  │  ├─ create-lesson
│  │  │  ├─ layout.js
│  │  │  └─ page.js
│  │  ├─ forgot-password
│  │  │  └─ layout.js
│  │  ├─ legal
│  │  │  ├─ layout.js
│  │  │  └─ page.js
│  │  ├─ marketplace
│  │  │  ├─ components
│  │  │  │  ├─ LessonCard.js
│  │  │  │  ├─ LessonsGrid.js
│  │  │  │  └─ PurchaseLessonButton.js
│  │  │  ├─ layout.js
│  │  │  └─ page.js
│  │  ├─ profile
│  │  │  ├─ layout.js
│  │  │  └─ page.js
│  │  ├─ sign-in
│  │  │  ├─ components
│  │  │  ├─ layout.js
│  │  │  └─ page.js
│  │  └─ sign-up
│  │     ├─ components.js
│  │     ├─ layout.js
│  │     └─ page.js
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