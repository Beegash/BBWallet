# Baby Wallet Smart Contract System

Baby Wallet, çocuklar için güvenli kripto birikim sistemi sağlayan Stellar tabanlı smart contract'lardan oluşan kapsamlı bir platformdur.

## 🎯 **Ana Konsept: Amaçlı Harcama Sistemi**

### **Temel Felsefe:**
- **0-18 yaş:** ❌ Hiçbir şekilde para çekilemez
- **18+ yaş:** ✅ **Sadece** anlaşmalı sağlık ve eğitim kurumlarında harcayabilir
- **Normal withdrawal yok:** Para sadece onaylı kurumlara ödenebilir

## 📋 Contract'lar

### 1. Baby Wallet (Ana Contract) - `lib.rs`
**Temel İşlevler:**
- ✅ `create_child_profile()` - Çocuk profili oluşturma
- ✅ `invest()` - Para yatırma (aile üyeleri)
- ✅ `add_approved_institution()` - Anlaşmalı kurum ekleme
- ✅ `pay_to_institution()` - Kuruma ödeme (18 yaş sonrası)
- ✅ `get_approved_institutions()` - Onaylı kurumları listele
- ✅ `is_old_enough_to_spend()` - Yaş kontrolü
- ❌ ~~`withdraw()`~~ - Normal para çekme KALDIRıLDI!

**Yeni Kurum Türleri:**
- `Healthcare` - Sağlık kurumları (hastane, doktor, eczane)
- `Education` - Eğitim kurumları (okul, üniversite, kurs)
- `Both` - Her iki tür de

### 2. Guardian Management - `guardian.rs`
**Temel İşlevler:**
- ✅ `initialize()` - Guardian sistemi başlatma
- ✅ `add_guardian()` - Yeni vasi ekleme
- ✅ `remove_guardian()` - Vasi çıkarma
- ✅ `update_guardian_role()` - Vasi yetkilerini güncelleme
- ✅ `check_permission()` - İzin kontrolü

**Guardian Rolleri:**
- `Owner` - Tam yetki + kurum ekleme
- `Investor` - Yatırım yapabilir, görüntüleyebilir
- `Viewer` - Sadece görüntüleyebilir
- `Withdrawer` - Kuruma ödeme yapabilir (18 yaş sonrası)

### 3. Investment Manager - `investment_manager.rs`
**Temel İşlevler:**
- ✅ `create_investment_plan()` - Yatırım planı oluşturma
- ✅ `execute_scheduled_payment()` - Planlanmış ödeme
- ✅ `set_investment_strategy()` - Yatırım stratejisi belirleme
- ✅ `record_yield()` - Getiri kaydetme
- ✅ `pause/resume_investment_plan()` - Plan duraklat/devam ettir

## 🛠️ Build & Deploy

### Derleme
```bash
# Contract'ları derle
cargo check

# WASM formatında build et
cargo build --target wasm32-unknown-unknown --release

# Build sonucu: target/wasm32-unknown-unknown/release/baby_wallet.wasm
```

### Test Edilmiş Özellikler
✅ **Syntax Check:** Tüm contract'lar hatasız derleniyor
✅ **WASM Build:** 21KB boyutunda optimum WASM dosyası oluşturuluyor
✅ **Structure:** Modüler yapı ile 3 ayrı contract entegrasyonu
✅ **Institution System:** Anlaşmalı kurum ödeme sistemi

## 🧪 Manuel Test Senaryoları

### Senaryo 1: Bebek Wallet Oluşturma
```rust
// 1. Bebek için wallet oluştur
let child_id = client.create_child_profile(
    "Baby Ahmet",      // Ad
    1704067200,        // Doğum tarihi (2024-01-01 - bebek!)
    18,                // 18 yaşında harcayabilecek
    50000,             // Hedef: 50,000 USDC
    "Anne"             // Sahip adı
);

// 2. Aile para yatırır
client.invest(child_id, 1000); // Anne 1000 USDC
client.invest(child_id, 500);  // Baba 500 USDC
client.invest(child_id, 200);  // Büyükanne 200 USDC

// Toplam: 1700 USDC birikti
assert_eq!(client.get_balance(), 1700);
```

### Senaryo 2: Anlaşmalı Kurum Sistemi
```rust
// 1. Hastane ekle (sadece owner)
client.add_approved_institution(
    hospital_address,
    "Acıbadem Hastanesi",
    InstitutionType::Healthcare
);

// 2. Üniversite ekle
client.add_approved_institution(
    university_address,
    "Boğaziçi Üniversitesi",
    InstitutionType::Education
);

// 3. Onaylı kurumları listele
let institutions = client.get_approved_institutions();
assert_eq!(institutions.len(), 2);
```

### Senaryo 3: 18 Yaş Sonrası Harcama
```rust
// Çocuk 18 yaşına geldi mi kontrol et
if client.is_old_enough_to_spend() {
    
    // 1. Üniversite harçları öde
    client.pay_to_institution(
        university_address,
        5000,  // 5000 USDC
        "2024-2025 Eğitim Harçları"
    );
    
    // 2. Sağlık kontrolü öde  
    client.pay_to_institution(
        hospital_address,
        500,   // 500 USDC
        "Yıllık Sağlık Kontrolü"
    );
    
} else {
    // 18 yaş altı - hiçbir ödeme yapılamaz!
    panic!("Cannot spend before target age");
}

// Ödeme geçmişini kontrol et
let payments = client.get_institution_payments();
assert_eq!(payments.len(), 2);
```

## 🔒 Güvenlik Özellikleri

### ✅ **Katı Yaş Kontrolü**
- **0-17 yaş:** Hiçbir para çıkışı yok
- **18+ yaş:** Sadece onaylı kurumlara ödeme

### ✅ **Whitelist Sistemi**
- Sadece önceden onaylanmış kurumlar
- Kurum türü kontrolü (sağlık/eğitim)
- Owner tarafından ekleme/çıkarma

### ✅ **Şeffaf Ödeme Sistemi**
- Her ödeme kaydedilir
- Kurum bilgisi ve amaç belirtilir
- Ödeme geçmişi takip edilebilir

### ✅ **Normal Withdraw YOK**
```rust
// ❌ Bu fonksiyon artık YOK!
// client.withdraw(1000); // ÇALIŞMAZ!

// ✅ Sadece bu çalışır:
client.pay_to_institution(hospital, 1000, "treatment");
```

## 📊 Desteklenen Kurumlar

| Kurum Türü | Örnekler | Kullanım Alanı |
|------------|----------|----------------|
| **Healthcare** | Hastane, Eczane, Doktor | Sağlık harcamaları |
| **Education** | Üniversite, Okul, Kurs | Eğitim harcamaları |
| **Both** | Özel entegrasyonlar | Her iki alan |

## 🚀 Kullanım Alanları

### **Bebek Wallet Gerçek Senaryoları:**

1. **Doğum Hediyesi:** Akrabalar bebek doğduğunda para yatırır
2. **Aylık Birikim:** Ebeveynler her ay otomatik yatırım yapar
3. **Büyükanne Desteği:** Aile büyükleri düzenli katkı sağlar
4. **DeFi Kazanç:** 18 yıl boyunca compound faiz birikiyor
5. **Eğitim Fonu:** Üniversite zamanında harç ödemesi
6. **Sağlık Güvencesi:** Acil sağlık durumları için rezerv

### **Örnek Timeline:**
- **Yaş 0-5:** Aile düzenli yatırım → Birikim büyüyor
- **Yaş 6-12:** DeFi kazançları compound oluyor
- **Yaş 13-17:** Hedef miktara yaklaşıyor
- **Yaş 18+:** Sadece eğitim/sağlık harcamaları

## ⚡ Sonraki Adımlar

1. **Institution Verification:** Kurumların kimlik doğrulama sistemi
2. **Payment Categories:** Harcama kategorilerine göre limitler
3. **Family Dashboard:** Aile üyelerinin izleme paneli
4. **Mobile Notifications:** Ödeme bildirimleri
5. **Educational Content:** Mali okuryazarlık eğitimleri

---

## 🎯 **Neden Bu Sistem Devrimci?**

### **Geleneksel vs Baby Wallet:**
| Özellik | Geleneksel Banka | Baby Wallet |
|---------|------------------|-------------|
| **Erişim Kontrolü** | Kart ile her yerde | Sadece onaylı kurumlar |
| **Yaş Sınırı** | 18'de tam erişim | 18'de amaçlı erişim |
| **Şeffaflık** | Aylık ekstre | Real-time blockchain |
| **Aile İşbirliği** | Tek hesap sahibi | Multi-guardian sistem |
| **Yatırım** | Düşük faiz | DeFi yield farming |
| **Global** | Ülke sınırlı | Sınırsız Stellar ağı |

Bu sistem sayesinde çocuklar finansal disiplin öğrenirken, aileler de güvenle birikim yapabilir! 🍼💰

---

Bu contract'lar production-ready seviyede değildir. Test ve geliştirme amaçlıdır. 