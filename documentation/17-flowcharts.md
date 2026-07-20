# 17 — Flowcharts (Mermaid Diagrams)

All diagrams below are written in **Mermaid** syntax. They render automatically on GitHub, Notion, and most documentation platforms. Paste any block into [mermaid.live](https://mermaid.live) to see it visually.

---

## 1. Complete User Journey

```mermaid
flowchart TD
    A([Customer visits be-zone.vercel.app]) --> B[App loads from Vercel CDN]
    B --> C[Service Worker installs sw.js]
    C --> D{Is user logged in?}
    D -->|No| E[Browse as guest]
    D -->|Yes| F[FCM token registered]
    F --> E
    E --> G[Home page loads]
    G --> H{What does user do?}
    H -->|Browse| I[Products page /products]
    H -->|Search| J[SearchBar with live suggestions]
    H -->|Click product| K[Product Detail /product/id]
    I --> K
    J --> K
    K --> L{Add to cart or Buy Now?}
    L -->|Add to Cart| M[CartDrawer opens]
    L -->|Buy Now| N[Checkout /checkout]
    L -->|WhatsApp| O[Opens wa.me link]
    M --> P{Checkout?}
    P -->|Yes| N
    N --> Q[Fill shipping form]
    Q --> R[Place Order]
    R --> S[INSERT orders + order_items]
    S --> T[Telegram notification to admin]
    T --> U[Confetti + Success screen]
    U --> V[Customer views orders in /profile]
```

---

## 2. Authentication Flow

```mermaid
flowchart TD
    A([User visits /auth]) --> B{Sign In or Sign Up?}
    
    B -->|Sign Up| C[Enter name, email, password]
    C --> D[supabase.auth.signUp]
    D --> E[Supabase creates auth.users row]
    E --> F[DB trigger fires: INSERT into profiles]
    F --> G[Session starts automatically]
    
    B -->|Sign In| H[Enter email, password]
    H --> I[supabase.auth.signInWithPassword]
    I -->|Wrong credentials| J[Error toast shown]
    J --> H
    I -->|Success| G
    
    G --> K[AuthContext updates user + session]
    K --> L[checkAdmin RPC call]
    L -->|Admin| M[isAdmin = true]
    L -->|Not admin| N[isAdmin = false]
    M --> O[/admin accessible]
    N --> P[useFCMToken registers push token]
    P --> Q[Token saved to profiles.fcm_token]
```

---

## 3. Order Placement Flow

```mermaid
flowchart TD
    A([Customer clicks Place Order]) --> B{Form valid?}
    B -->|No| C[Show validation errors]
    C --> A
    B -->|Yes| D[INSERT into orders table]
    D -->|Error| E[Show error to customer]
    D -->|Success| F[INSERT into order_items for each product]
    F -->|Error| E
    F -->|Success| G[UPDATE profiles with shipping info]
    G --> H[POST /api/notify-telegram]
    H --> I{Telegram configured?}
    I -->|Yes| J[Send Telegram message to admin]
    I -->|No| K[Skip silently]
    J --> L[clearCart]
    K --> L
    L --> M[Confetti animation]
    M --> N[Success screen shown]
    N --> O([Customer sees order confirmation])
```

---

## 4. Admin Order Management + Push Notification Flow

```mermaid
flowchart TD
    A([Admin opens /admin]) --> B{isAdmin?}
    B -->|No| C[Redirect to /]
    B -->|Yes| D[Load all orders from Supabase]
    D --> E[Admin selects order]
    E --> F[Admin changes status dropdown]
    F --> G[UPDATE orders SET status = new value]
    G --> H[Admin clicks Send Notification]
    H --> I[POST /api/send-push-notification]
    I --> J[Fetch profiles.fcm_token for user]
    J -->|No token| K[Log no_token to notification_logs]
    J -->|Has token| L[Mint Google OAuth2 access token from service account]
    L --> M[POST to Firebase FCM HTTP v1 API]
    M -->|Success| N[Log sent to notification_logs]
    M -->|UNREGISTERED| O[Clear stale token from profiles]
    O --> P[Log failed to notification_logs]
    M -->|Other error| P
    N --> Q([Customer device receives push notification])
    Q --> R[Customer taps notification]
    R --> S[/profile opens showing updated order]
```

---

## 5. Product Search Flow

```mermaid
flowchart TD
    A([User starts typing in SearchBar]) --> B{Query length >= 2?}
    B -->|No| C[Hide dropdown]
    B -->|Yes| D[Wait 300ms debounce]
    D --> E[Supabase query 1: ilike on name, description, category]
    D --> F[Supabase query 2: tags contains query]
    E --> G[Results from query 1]
    F --> H[Results from query 2]
    G --> I[Merge + deduplicate, max 8 results]
    H --> I
    I -->|Results found| J[Show dropdown with thumbnails + prices]
    I -->|No results| K[Show No products found message]
    J --> L{User action?}
    L -->|Click suggestion| M[Navigate to /product/id]
    L -->|Press Escape| N[Close dropdown]
    L -->|Submit form| O[Navigate to /products with search query]
    O --> P[Client-side filter runs on cached products]
```

---

## 6. FCM Token Registration Flow

```mermaid
flowchart TD
    A([User logs in]) --> B{Is admin?}
    B -->|Yes, admin| C[Skip FCM registration]
    B -->|No, regular user| D{Browser supports push?}
    D -->|No support| C
    D -->|Yes| E[Request notification permission]
    E -->|Denied| C
    E -->|Granted| F[Get existing SW registration for /sw.js]
    F --> G{SW state?}
    G -->|Installing| H[Wait for activated state]
    G -->|Activated| I[Call getToken with vapidKey]
    H --> I
    I --> J[Firebase returns FCM token string]
    J --> K[SELECT fcm_token FROM profiles WHERE id = user.id]
    K --> L{Token same as stored?}
    L -->|Same| M[Skip update - no change needed]
    L -->|Different or null| N[UPDATE profiles SET fcm_token = new token]
    N --> O([Token stored - ready to receive push notifications])
```

---

## 7. Database Entity Relationships

```mermaid
erDiagram
    auth_users {
        uuid id PK
        text email
        text raw_user_meta_data
    }
    
    profiles {
        uuid id PK_FK
        text full_name
        text phone
        text email
        text address
        text city
        text pincode
        text fcm_token
        timestamptz created_at
    }
    
    user_roles {
        uuid id PK
        uuid user_id FK
        app_role role
    }
    
    products {
        uuid id PK
        text name
        text description
        integer price
        integer original_price
        text category
        text image
        numeric rating
        integer review_count
        text[] tags
        text zodiac_sign
        boolean in_stock
    }
    
    orders {
        uuid id PK
        uuid user_id FK
        text status
        text payment_method
        integer total
        text shipping_name
        text shipping_phone
        text shipping_address
        text shipping_city
        timestamptz created_at
    }
    
    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        text product_name
        integer price
        integer quantity
    }
    
    reviews {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        text author
        integer rating
        text comment
    }
    
    campaigns {
        uuid id PK
        text title
        text coupon_code
        boolean is_active
    }
    
    notification_logs {
        uuid id PK
        uuid order_id FK
        uuid user_id
        text status
        text error_message
        timestamptz created_at
    }
    
    auth_users ||--|| profiles : "has profile"
    auth_users ||--o{ user_roles : "has roles"
    auth_users ||--o{ orders : "places"
    orders ||--o{ order_items : "contains"
    products ||--o{ order_items : "ordered as"
    products ||--o{ reviews : "has"
    orders ||--o{ notification_logs : "triggers"
```

---

## 8. Push Notification Architecture

```mermaid
flowchart LR
    subgraph Browser["Customer's Browser"]
        SW[Service Worker sw.js]
        FCM_SDK[Firebase SDK]
    end
    
    subgraph Vercel["Vercel Servers"]
        API[api/send-push-notification.js]
    end
    
    subgraph Firebase["Firebase Cloud Messaging"]
        FCM[FCM HTTP v1 API]
    end
    
    subgraph Supabase["Supabase Database"]
        Profiles[profiles table]
        Logs[notification_logs table]
    end
    
    Admin -->|POST order status update| API
    API -->|Fetch FCM token| Profiles
    Profiles -->|Returns token| API
    API -->|OAuth2 JWT + Send push| FCM
    FCM -->|Routes push message| SW
    SW -->|showNotification| Customer
    API -->|Log result| Logs
    
    FCM_SDK -->|getToken| Profiles
```

---

## 9. PWA Installation Flow

```mermaid
flowchart TD
    A([Customer visits site]) --> B[Browser checks PWA criteria]
    B --> C{Meets criteria?}
    C -->|HTTPS + Manifest + SW| D[beforeinstallprompt event fires]
    C -->|Not met| E[No install prompt]
    D --> F[PWAInstallPrompt captures event]
    F --> G[Shows custom install banner at bottom]
    G --> H{User action?}
    H -->|Dismiss| I[Banner hidden]
    H -->|Install| J[promptEvent.prompt called]
    J --> K{User accepts in browser dialog?}
    K -->|No| L[Nothing happens]
    K -->|Yes| M[App installed to home screen]
    M --> N[Icon appears on home screen]
    N --> O([Opens in standalone mode - no browser chrome])
```

---

## 10. Telegram Bot Flow

```mermaid
sequenceDiagram
    participant Checkout as Checkout.tsx
    participant Notify as telegramNotify.ts
    participant API as api/notify-telegram.js
    participant TG as Telegram Bot API
    participant Admin as Admin Telegram
    
    Checkout->>Checkout: Order saved to Supabase ✓
    Checkout->>Notify: sendOrderNotification(orderData)
    Notify->>API: POST /api/notify-telegram {orderId, items, total, ...}
    API->>API: Read TELEGRAM_BOT_TOKEN from env
    API->>API: Format MarkdownV2 message
    API->>TG: POST /bot{TOKEN}/sendMessage
    TG->>Admin: 🛍️ NEW ORDER — Be-Zone message
    TG-->>API: { ok: true }
    API-->>Notify: { ok: true }
    Note over Checkout: Order saved regardless of Telegram result
```
